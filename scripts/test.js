// Runs every check against dist/index.html. Set CHROME to a Chromium binary for the browser tests.
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),dist=path.join(root,'dist','index.html'),shots=path.join(root,'shots');
fs.mkdirSync(shots,{recursive:true});
const runs=[['node',['tests/validate_bank.js',dist]],['node',['tests/validate_lessons.js',dist]],['node',['tests/test_plan.js',dist,shots]],['node',['tests/test_ios.js',dist,shots]],['node',['tests/test_sync.js',dist,shots]],
  ...['test_v6','test_anim','test_fx'].map(t=>['python3',['tests/'+t+'.py',dist,shots+'/']])];
let bad=0;
for(const [cmd,args] of runs){
  if(!fs.existsSync(path.join(root,args[0]))){console.log('skip',args[0]);continue;}
  const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8'});const out=(r.stdout||'')+(r.stderr||'');
  const errLines=out.split('\n').filter(l=>/^\s*errors?\b/i.test(l)&&!/errors?:?\s*(\[\]|0)\s*$/i.test(l));
  const ok=r.status===0&&!errLines.length&&!/Traceback/.test(out);
  console.log((ok?'PASS ':'FAIL ')+args[0]);if(!ok){bad++;console.log(out.split('\n').slice(-25).join('\n'));}
}
process.exit(bad?1:0);
