// One-time: split original single-file app into src/ (kept for reference).
const fs=require('fs'),path=require('path');
const [,,inFile,outDir]=process.argv;
const L=fs.readFileSync(inFile,'utf8').split('\n');
const names={style:['base','components','labs','app'],script:['modules/prefs.js','data/topics.js','data/lessons.js','data/glossary.js','data/exams.js','modules/legacy-lab.js','modules/simulator.js','vendor/jspdf-2.5.1.js','data/final-bank.js','modules/final-exam.js','modules/app.js']};
let si=0,ci=0,out=[];
for(let i=0;i<L.length;i++){
  const t=L[i].trim();
  if(t==='<style>'||t==='<script>'){
    const isStyle=t==='<style>',close=isStyle?'</style>':'</script>';
    let j=i+1;while(L[j].trim()!==close)j++;
    const rel=isStyle?'styles/'+names.style[si++]+'.css':names.script[ci++];
    fs.mkdirSync(path.dirname(path.join(outDir,rel)),{recursive:true});
    fs.writeFileSync(path.join(outDir,rel),L.slice(i+1,j).join('\n'));
    out.push(L[i],'<!--@include '+rel+'-->',L[j]);i=j;
  } else out.push(L[i]);
}
fs.writeFileSync(path.join(outDir,'index.html'),out.join('\n'));
console.log('styles',si,'scripts',ci);
