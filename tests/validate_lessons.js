// Checks every authored lesson and subject exam: shape, unique options, one exam question per topic minimum,
// every CCNA topic authored, and the gate chain is passable (each domain with lessons has a subject exam).
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
const scripts=[...html.matchAll(/<script>\n([\s\S]*?)\n<\/script>/g)].map(m=>m[1]);
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
for(const s of scripts.filter(s=>/ATLAS_TOPICS=|ATLAS_LESSONS=|ATLAS_EXAMS=|ATLAS_CCNA/.test(s)&&!/ATLAS_PREFS=|FX_BANK/.test(s))){vm.runInContext(s,ctx);}
const W=ctx.window,T=W.ATLAS_TOPICS,LS=W.ATLAS_LESSONS,EX=W.ATLAS_EXAMS;const errs=[];
const uniq=(a,where)=>{if(new Set(a.map(x=>String(x).trim())).size!==a.length)errs.push(where+': duplicate options');};
for(const t of T.filter(t=>t.track==='ccna')){
  const l=LS[t.id];if(!l){errs.push(t.id+': no lesson');continue;}
  if(!t.ready)errs.push(t.id+': not ready');
  ['hook','analogy','teach'].forEach(f=>{if(!l[f])errs.push(t.id+': missing '+f);});
  if(!(l.paragraphs.length>=2))errs.push(t.id+': paragraphs');if(!(l.key.length>=3))errs.push(t.id+': key');
  if(l.terms.length<3||l.terms.some(g=>!g.length||g.some(w=>w!==w.toLowerCase())))errs.push(t.id+': terms must be 3+ lowercase groups');
  if(l.quiz.length!==3)errs.push(t.id+': quiz length');
  [l.lab,...l.quiz].forEach((q,i)=>{if(q.options.length!==4)errs.push(t.id+' q'+i+': need 4 options');uniq(q.options,t.id+' q'+i);if(!(q.answer>=0&&q.answer<q.options.length))errs.push(t.id+': answer index');});
  // The teach-back rubric must be passable from the lesson's own key facts.
  const txt=(l.key.join(' ')+' '+l.paragraphs.join(' ')).toLowerCase();
  l.terms.forEach((g,i)=>{if(!g.some(w=>txt.includes(w)))errs.push(t.id+': term group '+i+' not found in lesson text');});
}
const keys=[...new Set(T.filter(t=>t.track==='ccna').map(t=>t.track+'||'+t.domain))];
for(const k of keys){const e=EX[k];if(!e){errs.push(k+': no subject exam');continue;}
  const ids=T.filter(t=>t.track+'||'+t.domain===k).map(t=>t.id);
  ids.forEach(id=>{if(!e.questions.some(q=>q.topic===id))errs.push(k+': no exam question for '+id);});
  if(e.questionCount!==ids.length)errs.push(k+': questionCount '+e.questionCount+' vs '+ids.length);
  // Passing must allow exactly one miss at most, never zero misses required with tiny exams being too strict:
  const needed=Math.ceil(e.minimumPercent/100*e.questionCount);if(e.questionCount-needed<1)errs.push(k+': pass mark allows no mistakes ('+needed+'/'+e.questionCount+')');
  e.questions.forEach(q=>{uniq(q.options,q.id);if(q.options.length!==4)errs.push(q.id+': need 4 options');});
  if(new Set(e.questions.map(q=>q.id)).size!==e.questions.length)errs.push(k+': duplicate question ids');
}
const n=T.filter(t=>t.track==='ccna'&&LS[t.id]).length;
console.log('ccna lessons',n,'subject exams',keys.filter(k=>EX[k]).length+'/'+keys.length,'exam questions',keys.reduce((a,k)=>a+(EX[k]?.questions.length||0),0));
errs.forEach(e=>console.log(' -',e));console.log('errors',errs.length);process.exit(errs.length?1:0);
