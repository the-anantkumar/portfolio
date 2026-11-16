import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {env,AutoModelForSeq2SeqLM,AutoTokenizer} from '@huggingface/transformers';
import {prepareRag,validateRagSelection} from '../../src/lib/rag.mjs';
import {RAG_MODEL as candidate} from '../../src/lib/rag-config.mjs';
import {buildRagBinaryPrompt,parseRagRelevance,RAG_BINARY_PROMPT_VERSION} from '../../src/lib/rag-prompt.mjs';
assert.equal(candidate.promptVersion,RAG_BINARY_PROMPT_VERSION);
const casesFlag=process.argv.indexOf('--cases');
const casesFile=casesFlag<0?'experiments/rag/cases.json':process.argv[casesFlag+1];
assert(typeof casesFile==='string'&&/^experiments\/rag\/[a-zA-Z0-9_-]+\.json$/.test(casesFile),'Use an explicit public RAG evaluation file');
const suite=casesFile.split('/').at(-1).replace(/\.json$/,'');
const reportFile=`artifacts/rag/flan-base-${suite}-native-results.json`;
const corpus=JSON.parse(await readFile('dist/knowledge.json','utf8'));
const {cases}=JSON.parse(await readFile(casesFile,'utf8'));
await mkdir('artifacts/rag',{recursive:true});
env.allowLocalModels=false;
env.cacheDir='artifacts/rag/flan-base-cache';
env.remotePathTemplate=`{model}/resolve/${candidate.revision}/`;
const prefix=`https://huggingface.co/${candidate.model}/resolve/${candidate.revision}/`;
env.fetch=(input,init={})=>{assert(String(input).startsWith(prefix),'Unpinned public model request');const headers=new Headers(init.headers);headers.delete('Authorization');return fetch(input,{...init,headers,credentials:'omit',referrerPolicy:'no-referrer'});};
const loadStarted=performance.now();
const options={revision:candidate.revision,dtype:candidate.dtype,device:'cpu',session_options:{intraOpNumThreads:2,interOpNumThreads:1}};
const [model,tokenizer]=await Promise.all([AutoModelForSeq2SeqLM.from_pretrained(candidate.model,options),AutoTokenizer.from_pretrained(candidate.model,options)]);
const report={candidate,backend:'native CPU, two intra-op threads',casesFile,loadMs:Math.round(performance.now()-loadStarted),cases:[],notes:['Fixed supplied public evidence isolates source selection; not end-to-end retrieval.','The same frozen prepareRag preflight and validateRagSelection companion enforcement are used.','Per-document inputs preserve full title, context, and text; prompts over512tokens are rejected, never truncated.','Source-ID exact match is measured; exact source text authenticity does not establish relevance.']};
try {
for(const test of cases){
 const start=performance.now();
 const passages=test.passages.map(id=>{const p=corpus.passages.find(p=>p.id===id);assert(p,'Unknown public source');return p;});
 const prepared=prepareRag(test.question,passages);
 const rows=[];let selected=[];let answer;let error;
 if(prepared.kind==='ready'){
  for(let i=0;i<prepared.passages.length;i++){
   const p=prepared.passages[i];
   const prompt=buildRagBinaryPrompt(prepared.question,p);
   const input=tokenizer(prompt,{add_special_tokens:true,truncation:false});
   const promptTokens=input.input_ids.data.length;
   if(promptTokens>candidate.maxPromptTokens){rows.push({id:p.id,promptTokens,error:'oversized-prompt'});error='oversized-prompt';continue;}
   const tokenIds=await model.generate({...input,max_new_tokens:candidate.maxNewTokens,do_sample:false,return_dict_in_generate:false});
   const raw=tokenizer.batch_decode(tokenIds,{skip_special_tokens:true})[0].trim();
   let relevant;try{relevant=parseRagRelevance(raw);}catch{error='invalid-binary-selection';}
   const label=relevant===true?'yes':relevant===false?'no':'invalid';
   rows.push({id:p.id,promptTokens,raw,label,valid:['yes','no'].includes(label)});
   if(label==='yes')selected.push(i+1);
   else if(label!=='no')error='invalid-binary-selection';
  }
  if(!error)answer=validateRagSelection(JSON.stringify({sources:selected}),prepared.passages,prepared.question);
 }else answer=prepared;
 const actual=answer?.passages?.map(p=>p.id)??[];
 const exact=!error&&JSON.stringify([...actual].sort())===JSON.stringify([...test.expected].sort());
 const row={id:test.id,kind:test.kind,preflight:prepared.kind,reason:prepared.reason,rows,selectedNumbers:selected,actual,expected:test.expected,exact,error,milliseconds:Math.round(performance.now()-start),repaired:answer?.repaired??false};
 report.cases.push(row);console.log(`${test.id}: ${exact?'exact-match':'miss'}${error?' '+error:''}`);
 await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
}
report.exactMatches=report.cases.filter(c=>c.exact).length;report.answerableExactMatches=report.cases.filter(c=>c.kind==='answerable'&&c.exact).length;report.unsupportedExactMatches=report.cases.filter(c=>c.kind==='unsupported'&&c.exact).length;report.nativeRssBytesAfterRun=process.memoryUsage().rss;report.promoted=false;await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');console.log(`FLAN base screening completed: ${report.exactMatches}/${cases.length} exact source sets; no promotion.`);
} finally {await model.dispose();}
