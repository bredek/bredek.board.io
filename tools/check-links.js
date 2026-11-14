#!/usr/bin/env node
// Перевіряє, що всі посилання з literature.js відповідають HTTP 200.
// Запуск: node tools/check-links.js
// Потрібен Node 18+ (вбудований fetch). Код literature.js власний, тому виконується через new Function.
const fs=require('fs');
const path=require('path');

const src=fs.readFileSync(path.join(__dirname,'..','literature.js'),'utf8');
const LIT=new Function(src+';return LIT')();

const UA='Mozilla/5.0 (compatible; bredek-board-link-check)';
async function check(url){
  for(const method of ['HEAD','GET']){
    try{
      const r=await fetch(url,{method,redirect:'follow',headers:{'user-agent':UA},signal:AbortSignal.timeout(30000)});
      if(r.ok)return{ok:true,status:r.status};
      if(method==='GET')return{ok:false,status:r.status};
    }catch(e){
      if(method==='GET')return{ok:false,status:String(e.cause?.code||e.message)};
    }
  }
}

(async()=>{
  const keys=Object.keys(LIT);
  let bad=0;
  for(const k of keys){
    const res=await check(LIT[k].url);
    console.log((res.ok?'OK  ':'FAIL')+' '+res.status+'  '+k+'  '+LIT[k].url);
    if(!res.ok)bad++;
  }
  console.log(`\nПеревірено: ${keys.length}, з помилками: ${bad}`);
  process.exit(bad?1:0);
})();
