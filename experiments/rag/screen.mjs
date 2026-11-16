import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {env,AutoModelForCausalLM,AutoTokenizer,TextGenerationPipeline} from '@huggingface/transformers';
import {RAG_MODEL as c} from './candidate.mjs';
import {buildMessages,inspectAnswer} from '../generation/config.mjs';
await mkdir('artifacts/rag',{recursive:true});
env.allowLocalModels=false;env.cacheDir='artifacts/rag/cache';env.remotePathTemplate=`{model}/resolve/${c.revision}/`;
const prefix=`https://huggingface.co/${c.model}/resolve/${c.revision}/`;
env.fetch=(input,init={})=>{if(!String(input).startsWith(prefix))throw Error('Unpinned asset');return fetch(input,{...init,credentials:'omit',referrerPolicy:'no-referrer'});};
const start=performance.now();
const options={revision:c.revision,dtype:c.dtype,device:'cpu',session_options:{intraOpNumThreads:2,interOpNumThreads:1}};
const [model,tokenizer]=await Promise.all([AutoModelForCausalLM.from_pretrained(c.model,options),AutoTokenizer.from_pretrained(c.model,options)]);
const pipeline=new TextGenerationPipeline({task:'text-generation',model,tokenizer});
const corpus=JSON.parse(await readFile('dist/knowledge.json','utf8'));
const cases=JSON.parse(await readFile('experiments/generation/cases.json','utf8')).cases;
const report={candidate:c,loadMs:Math.round(performance.now()-start),cases:[]};
for(const test of cases){const passages=test.passages.map(id=>corpus.passages.find(p=>p.id===id));const result=await pipeline(buildMessages(test.question,passages),{max_new_tokens:160,do_sample:false});const answer=result[0].generated_text.at(-1).content.trim();report.cases.push({id:test.id,answer,...inspectAnswer(answer,passages,test)});console.log(test.id,report.cases.at(-1).flags);await writeFile('artifacts/rag/prose.json',JSON.stringify(report,null,2));}
await pipeline.dispose();
