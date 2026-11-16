import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {env,AutoModelForCausalLM,AutoTokenizer,TextGenerationPipeline} from '@huggingface/transformers';
import {RAG_MODEL as c} from '../../src/lib/rag-config.mjs';
import {prepareRag,validateRagSelection} from '../../src/lib/rag.mjs';
await mkdir('artifacts/rag',{recursive:true});
env.allowLocalModels=false;env.cacheDir='artifacts/rag/cache';env.remotePathTemplate=`{model}/resolve/${c.revision}/`;
const prefix=`https://huggingface.co/${c.model}/resolve/${c.revision}/`;
env.fetch=(input,init={})=>{if(!String(input).startsWith(prefix))throw Error('Unpinned asset');return fetch(input,{...init,credentials:'omit',referrerPolicy:'no-referrer'});};
const start=performance.now();const options={revision:c.revision,dtype:c.dtype,device:'cpu',session_options:{intraOpNumThreads:2,interOpNumThreads:1}};
const [model,tokenizer]=await Promise.all([AutoModelForCausalLM.from_pretrained(c.model,options),AutoTokenizer.from_pretrained(c.model,options)]);
const pipeline=new TextGenerationPipeline({task:'text-generation',model,tokenizer});
const corpus=JSON.parse(await readFile('dist/knowledge.json','utf8'));const cases=JSON.parse(await readFile('experiments/rag/cases.json','utf8')).cases;
const report={candidate:c,loadMs:Math.round(performance.now()-start),cases:[]};
for(const test of cases){const passages=test.passages.map(id=>corpus.passages.find(p=>p.id===id));const prepared=prepareRag(test.question,passages);let raw='{"sources":[]}',result=prepared,ms=0,error;
if(prepared.kind==='ready'){try{const prompt=tokenizer.apply_chat_template(prepared.messages,{tokenize:false,add_generation_prompt:true});const tokens=tokenizer(prompt,{add_special_tokens:false,truncation:false}).input_ids.data.length;if(tokens>c.maxPromptTokens)throw Error('oversized');const started=performance.now();const output=await pipeline(prepared.messages,{max_new_tokens:c.maxNewTokens,do_sample:false});ms=Math.round(performance.now()-started);raw=output[0].generated_text.at(-1).content.trim();result=validateRagSelection(raw,prepared.passages);}catch(e){error=String(e);result={kind:'abstain',passages:[]};}}
const ids=result.passages.map(p=>p.id);const pass=test.expected.length===ids.length&&test.expected.every(id=>ids.includes(id));report.cases.push({id:test.id,raw,ids,pass,ms,preflight:prepared.kind,repaired:result.repaired??false,error});console.log(test.id,pass,raw);await writeFile('artifacts/rag/selection.json',JSON.stringify(report,null,2));}
await pipeline.dispose();
