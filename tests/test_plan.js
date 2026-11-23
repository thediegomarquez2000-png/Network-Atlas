// Browser test: Today plan + the subject gate chain through the new CCNA lessons.
// Usage: node tests/test_plan.js dist/index.html [shotsDir]   (set CHROME to a Chromium binary if needed)
let pw;try{pw=require('playwright');}catch(e){pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');}
const {chromium}=pw;
const path=require('path'),fs=require('fs');
const file='file://'+path.resolve(process.argv[2]);const shots=process.argv[3]||'shots';fs.mkdirSync(shots,{recursive:true});
const errors=[];const check=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)errors.push(m);};
(async()=>{
  const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
  const pg=await b.newPage({viewport:{width:1280,height:900}});
  pg.on('pageerror',e=>errors.push('pageerror '+e.message));pg.on('console',m=>{if(m.type()==='error')errors.push('console '+m.text());});
  await pg.goto(file);await pg.waitForTimeout(300);
  check(await pg.isVisible('text=Let’s make your plan'),'fresh learner lands on plan setup');
  await pg.screenshot({path:shots+'/plan-01-setup.png'});
  await pg.click('[data-plan="save"]');await pg.waitForTimeout(150);
  const tasks=await pg.$$eval('.plan-task b',n=>n.map(x=>x.textContent));
  check(tasks.length===2&&/What is a network/.test(tasks[0])&&/Flashcards/.test(tasks[1]),'day 1 tasks: first lesson + flashcards → '+tasks.join(' | '));
  check(await pg.isVisible('.plan-status.ok'),'on track on day 1');
  check((await pg.$$('.plan-week')).length===16,'16 week chips');
  await pg.screenshot({path:shots+'/plan-02-today.png',fullPage:true});
  await pg.click('.plan-tick[data-task="flash"]');await pg.waitForTimeout(100);
  check(await pg.isVisible('.plan-task.done'),'tick marks a task done');
  await pg.click('.plan-task >> nth=0 >> [data-action="continue"]');await pg.waitForTimeout(200);
  check((await pg.textContent('#main')).includes('What is a network'),'Go opens the first lesson');

  // Foundations finished and mastered, 40 days into the plan → subject exam task + behind status.
  const F=Array.from({length:15},(_,i)=>'n0'+String(i+1).padStart(2,'0'));
  const mastered=Object.fromEntries(F.map(id=>[id,'2026-01-01']));
  const s=new Date(Date.now()-40*864e5).toISOString().slice(0,10);
  await pg.evaluate(([F,m,s])=>{localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:F,mastered:m,subjectPassed:[],recheckDue:{}}));
    localStorage.setItem('network-atlas-plan-v1',JSON.stringify({start:s,weeks:16,perWeek:6,ticks:{}}));},[F,mastered,s]);
  await pg.reload();await pg.waitForTimeout(300);
  const t2=await pg.$$eval('.plan-task b',n=>n.map(x=>x.textContent));
  check(/Foundations subject exam/.test(t2[0]),'subject exam is the next step → '+t2[0]);
  check(await pg.isVisible('.plan-status.warn, .plan-status.bad'),'shows behind status after 40 days with 15 steps');
  await pg.screenshot({path:shots+'/plan-03-behind.png',fullPage:true});

  // Pass Foundations → the next lesson must be n016 and open.
  await pg.evaluate(([F,m])=>localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:F,mastered:m,subjectPassed:['ccna||Foundations'],recheckDue:{}})),[F,mastered]);
  await pg.reload();await pg.waitForTimeout(300);
  const t3=await pg.textContent('.plan-task b');check(/Cabling fault diagnosis/.test(t3),'after Foundations exam the next lesson is n016 → '+t3);
  await pg.click('.plan-task >> nth=0 >> [data-action="continue"]');await pg.waitForTimeout(200);
  const main=await pg.textContent('#main');
  check(main.includes('Cabling fault diagnosis')&&main.includes('CRC'),'n016 lesson renders with its content');
  await pg.screenshot({path:shots+'/plan-04-n016.png',fullPage:true});

  // Every CCNA subject: finish its lessons → its exam renders with one question per topic.
  const groups=await pg.evaluate(()=>{const A=window.ATLAS_APP;const g={};A.topics.filter(t=>t.track==='ccna').forEach(t=>{(g[A.groupKey(t)]=g[A.groupKey(t)]||[]).push(t.id);});return g;});
  let done=[];const passed=[];
  for(const [k,ids] of Object.entries(groups)){
    done=done.concat(ids);const m=Object.fromEntries(done.map(id=>[id,'2026-01-01']));
    await pg.evaluate(([d,m,p])=>localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:d,mastered:m,subjectPassed:p,recheckDue:{}})),[done,m,passed]);
    await pg.reload();await pg.waitForTimeout(250);
    await pg.click('.plan-task >> nth=0 >> [data-action="continue"]');await pg.waitForTimeout(200);
    const n=(await pg.$$('.question-card')).length;
    check(n===ids.length,k+': subject exam shows '+n+' questions for '+ids.length+' topics');
    passed.push(k);
  }
  // All passed → practice exam task.
  await pg.evaluate(([d,p])=>localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:d,mastered:Object.fromEntries(d.map(i=>[i,'x'])),subjectPassed:p,recheckDue:{}})),[done,passed]);
  await pg.reload();await pg.waitForTimeout(250);
  check(/Practice exam · Form A/.test(await pg.textContent('.plan-task b')),'all subjects passed → practice exam Form A');
  await pg.setViewportSize({width:390,height:844});await pg.screenshot({path:shots+'/plan-05-mobile.png',fullPage:true});
  const overflow=await pg.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);check(!overflow,'no horizontal scroll at phone width');
  await b.close();
  console.log('errors:',JSON.stringify(errors));process.exit(errors.length?1:0);
})();
