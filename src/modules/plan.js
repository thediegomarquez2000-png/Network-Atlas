/* Network Atlas — "Today" study plan.
 * Turns the whole CCNA path into one small daily list: come-back checks, ONE next step, flashcards.
 * Phase 1 (most weeks): learn every lesson in order and pass each subject exam.
 * Phase 2 (last 2 weeks): full practice exams (forms A, B, C) and weak-spot review.
 * Stored per learner in network-atlas-plan-v1<suffix> (a new key; no existing key is renamed).
 * Reads app state through window.ATLAS_APP (set by the main app) and final-exam attempts from localStorage.
 */
(function(){
'use strict';
var KEY='network-atlas-plan-v1'+(window.ATLAS_PREFS&&window.ATLAS_PREFS.profileSuffix?window.ATLAS_PREFS.profileSuffix():'');
var FINAL_KEY='network-atlas-final-v1'+(window.ATLAS_PREFS&&window.ATLAS_PREFS.profileSuffix?window.ATLAS_PREFS.profileSuffix():'');
var PRACTICE_WEEKS=2,TARGET=825;
function load(){try{var o=JSON.parse(localStorage.getItem(KEY)||'null');return o&&typeof o==='object'?o:null;}catch(e){return null;}}
function store(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parse(s){var p=String(s||'').split('-').map(Number);return new Date(p[0],(p[1]||1)-1,p[2]||1);}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
function daysBetween(a,b){return Math.round((parse(ymd(b))-parse(ymd(a)))/864e5);}
function nice(d){return d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function finalAttempts(){try{var o=JSON.parse(localStorage.getItem(FINAL_KEY)||'{}');return Array.isArray(o.attempts)?o.attempts:[];}catch(e){return[];}}

/* The ordered list of milestones: every CCNA lesson, with each subject exam after its subject. */
function milestones(A){
  var out=[],keys=[];
  A.topics.filter(function(t){return t.track==='ccna'&&A.lessons[t.id];}).forEach(function(t){
    var k=A.groupKey(t);if(keys.indexOf(k)<0)keys.push(k);
    out.push({type:'lesson',id:t.id,title:t.title,group:k,domain:t.domain});
  });
  var withExams=[];keys.forEach(function(k){
    out.filter(function(m){return m.group===k;}).forEach(function(m){withExams.push(m);});
    if(A.subjectExams[k])withExams.push({type:'exam',id:k,title:A.subjectExams[k].title,group:k,domain:k.split('||')[1]});
  });
  return withExams;
}
function isDone(A,m){var p=A.progress;return m.type==='lesson'?p.completed.indexOf(m.id)>=0:p.subjectPassed.indexOf(m.id)>=0;}

/* Map a calendar date to "study day number" given study days per week (Sunday is the rest day for 6, Sat+Sun for 5). */
function isStudyDay(d,perWeek){var w=d.getDay();if(perWeek>=7)return true;if(perWeek===6)return w!==0;return w!==0&&w!==6;}
function studyDaysBetween(start,end,perWeek){var n=0;for(var d=parse(ymd(start));d<=end;d=addDays(d,1))if(isStudyDay(d,perWeek))n++;return n;}

function compute(A,plan,now){
  var ms=milestones(A),total=ms.length,done=ms.filter(function(m){return isDone(A,m);}).length;
  var start=parse(plan.start),weeks=plan.weeks,examDate=addDays(start,weeks*7-1);
  var learnEnd=addDays(start,(weeks-PRACTICE_WEEKS)*7-1);
  var learnSlots=studyDaysBetween(start,learnEnd,plan.perWeek);
  var dayIx=studyDaysBetween(start,addDays(now,-1),plan.perWeek); // study days finished before today
  var expected=Math.min(total,Math.ceil(Math.min(dayIx,learnSlots)*total/learnSlots));
  var weekNo=Math.max(1,Math.min(weeks,Math.floor(daysBetween(start,now)/7)+1));
  var practice=now>learnEnd;
  // Milestones planned for each week, for the week map.
  var perWeekPlan=[];for(var w=0;w<weeks-PRACTICE_WEEKS;w++){
    var a=studyDaysBetween(start,addDays(start,w*7-1),plan.perWeek),b=studyDaysBetween(start,addDays(start,w*7+6),plan.perWeek);
    var from=Math.ceil(a*total/learnSlots),to=Math.min(total,Math.ceil(b*total/learnSlots));perWeekPlan.push(ms.slice(from,to));}
  return {ms:ms,total:total,done:done,expected:expected,behind:expected-done,start:start,examDate:examDate,learnEnd:learnEnd,weekNo:weekNo,weeks:weeks,practice:practice,perWeekPlan:perWeekPlan,daysLeft:Math.max(0,daysBetween(now,examDate)),today:isStudyDay(now,plan.perWeek)};
}

function readiness(A,c){
  var ccna=A.topics.filter(function(t){return t.track==='ccna';});
  var mastered=ccna.filter(function(t){return A.progress.mastered&&A.progress.mastered[t.id];}).length;
  var latest={};finalAttempts().forEach(function(a){latest[a.form]=a;});
  var forms=['A','B','C'].map(function(f){return{form:f,score:latest[f]?latest[f].scaled:null};});
  var ready=forms.every(function(f){return f.score!=null&&f.score>=TARGET;});
  return{mastered:mastered,of:ccna.length,forms:forms,ready:ready};
}

/* Today's tasks: never more than three, in the order to do them. */
function tasks(A,c,plan,r){
  var list=[],due=A.dueRechecks().length,next=c.ms.find(function(m){return!isDone(A,m);});
  if(due)list.push({id:'comeback',icon:'↺',title:'Come-back check'+(due>1?'s ('+due+')':''),why:'Quick memory check of lessons from before. No hints. Do this first, while your mind is fresh.',action:'comeback',mins:5*due});
  if(next&&(!c.practice||c.done<c.total)){
    if(next.type==='exam'){
      var pend=A.pendingSubjectExam();
      list.push({id:'main',icon:'✺',title:next.title,why:pend?'You finished every lesson in this subject. Pass this test to open the next subject.':'First, get every lesson in this subject to Mastered ★ (come-back checks). Then this test opens.',action:pend?'continue':'comeback',mins:20});
    } else list.push({id:'main',icon:'▶',title:'Lesson: '+next.title,why:'Your one new lesson for today. Go slowly. Use read-aloud and the lab button. Finish all four steps.',action:'continue',mins:40});
  } else {
    var miss=r.forms.find(function(f){return f.score==null||f.score<TARGET;});
    list.push({id:'main',icon:'🎓',title:miss?'Practice exam · Form '+miss.form:'Practice exam (any form) + review',why:miss?'Take a full practice exam. Use extra time if you need it. Then read every explanation you missed.':'You reached the practice target on all three forms. Keep one form fresh each week until your real exam.',action:'final',mins:120});
  }
  var pt=window.ATLAS_PTBOOK&&window.ATLAS_PTBOOK.nextDue();
  if(pt)list.push({id:'pt',icon:'▦',title:'Packet Tracer: '+pt.title,why:'Build what you learned in real Packet Tracer. Follow the steps and type every command yourself.',action:'ptbook',mins:45});
  list.push({id:'flash',icon:'◈',title:'Flashcards · 10 minutes',why:'Small and often beats long and rare. Say each answer out loud before you flip.',action:'flashcards',mins:10});
  return list.slice(0,3);
}

function weekMap(A,c){
  var html='';for(var w=0;w<c.weeks;w++){
    var practice=w>=c.weeks-PRACTICE_WEEKS,items=practice?[]:c.perWeekPlan[w]||[];
    var done=practice?false:items.length&&items.every(function(m){return isDone(A,m);});
    var cur=w+1===c.weekNo,label=practice?'Practice exams':items.length?esc(shortDomain(items[0].domain))+(items.length?'':''):'Catch-up';
    html+='<li class="plan-week'+(done?' done':'')+(cur?' current':'')+'" title="'+esc(items.map(function(m){return m.title;}).join(', '))+'"><b>W'+(w+1)+'</b><span>'+label+'</span><small>'+(practice?'A · B · C':items.length+' step'+(items.length===1?'':'s'))+'</small>'+(done?'<i aria-label="done">✓</i>':'')+'</li>';
  }
  return '<ol class="plan-weeks" aria-label="Week by week plan">'+html+'</ol>';
}
function shortDomain(d){return({'Foundations':'Foundations','Infrastructure & connectivity':'Infrastructure','Switching & network access':'Switching','IP routing':'Routing','Services & security':'Security','AI & network operations':'Operations'})[d]||d;}

function setupHTML(plan){
  var p=plan||{start:ymd(new Date()),weeks:16,perWeek:6};
  return '<div class="section-top"><div><span class="eyebrow">YOUR STUDY PLAN</span><h1>Let’s make your plan</h1><p>Three easy choices. You can change them any time.</p></div></div>'+
  '<div class="panel plan-setup">'+
  '<label class="plan-field"><b>1. When do you start?</b><input type="date" id="plan-start" value="'+esc(p.start)+'"></label>'+
  '<fieldset class="plan-field"><legend><b>2. How many weeks until your exam?</b></legend>'+[16,20,24].map(function(w){return'<label class="plan-choice"><input type="radio" name="plan-weeks" value="'+w+'"'+(p.weeks===w?' checked':'')+'> '+w+' weeks'+(w===16?' (about 4 months)':w===20?' (about 5 months, more relaxed)':' (about 6 months, slow and steady)')+'</label>';}).join('')+'</fieldset>'+
  '<fieldset class="plan-field"><legend><b>3. How many days a week will you study?</b></legend>'+[5,6,7].map(function(d){return'<label class="plan-choice"><input type="radio" name="plan-days" value="'+d+'"'+(p.perWeek===d?' checked':'')+'> '+d+' days'+(d===6?' (recommended: about 1 hour a day, rest on Sunday)':d===5?' (weekdays; days are a little longer)':' (every day)')+'</label>';}).join('')+'</fieldset>'+
  '<button class="primary-btn" data-plan="save">Save my plan ↗</button></div>';
}

function render(el){
  var A=window.ATLAS_APP;if(!A){el.innerHTML='<div class="notice-card">The plan could not load.</div>';return;}
  var plan=load(),now=new Date();
  if(!plan||plan.editing){el.innerHTML=setupHTML(plan);bind(el,A);return;}
  var c=compute(A,plan,now),r=readiness(A,c),list=tasks(A,c,plan,r);
  var ticks=(plan.ticks&&plan.ticks[ymd(now)])||[];
  var status=c.practice?'<span class="plan-status ok">Practice phase</span>':c.behind<=0?'<span class="plan-status ok">✓ On track'+(c.behind<0?' · '+(-c.behind)+' ahead':'')+'</span>':c.behind<=3?'<span class="plan-status warn">'+c.behind+' step'+(c.behind>1?'s':'')+' behind · that’s OK, keep going</span>':'<span class="plan-status bad">'+c.behind+' steps behind · think about a longer plan</span>';
  var pct=Math.round(c.done/c.total*100);
  el.innerHTML='<div class="section-top"><div><span class="eyebrow">TODAY · '+esc(nice(now).toUpperCase())+'</span><h1>'+(c.today?'Your 3 jobs for today':'Rest day 🌙')+'</h1><p>Week '+c.weekNo+' of '+c.weeks+' · '+c.daysLeft+' days until your target exam date ('+esc(nice(c.examDate))+'). '+status+'</p></div><button class="secondary-btn" data-plan="edit">Change plan</button></div>'+
  (c.today?'':'<div class="notice-card">Today is a rest day in your plan. Resting helps your brain keep what you learned. If you want, you can still do the tasks below.</div>')+
  '<ol class="plan-tasks">'+list.map(function(t,i){var ok=ticks.indexOf(t.id)>=0;return'<li class="plan-task'+(ok?' done':'')+'"><button class="plan-tick" data-plan="tick" data-task="'+t.id+'" aria-pressed="'+ok+'" aria-label="Mark '+esc(t.title)+' as done">'+(ok?'✓':i+1)+'</button><div><b>'+t.icon+' '+esc(t.title)+'</b><p>'+esc(t.why)+'</p><small>About '+t.mins+' min</small></div><button class="primary-btn small" data-action="'+t.action+'">Go ↗</button></li>';}).join('')+'</ol>'+
  (list.every(function(t){return ticks.indexOf(t.id)>=0;})?'<div class="feedback good">All done for today. Great work. Stop here and rest. Your brain saves what you learned while you sleep.</div>':'')+
  '<div class="panel"><div class="section-top"><div><h2>Your road to the CCNA</h2><p>'+c.done+' of '+c.total+' steps finished ('+pct+'%). Each step is one lesson or one subject test.</p></div></div>'+
  '<div class="plan-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+c.total+'" aria-valuenow="'+c.done+'"><span style="width:'+pct+'%"></span><i style="left:'+Math.round(c.expected/c.total*100)+'%" title="Where the plan expects you today"></i></div>'+
  weekMap(A,c)+'</div>'+
  '<div class="panel"><h2>Am I ready to book the real exam?</h2><p>Book the real CCNA only when all three practice forms score '+TARGET+' or higher. These are practice estimates: Cisco does not publish its pass mark, and this app is not affiliated with Cisco.</p>'+
  '<ul class="plan-ready"><li class="'+(r.mastered===r.of?'ok':'')+'">'+(r.mastered===r.of?'✓':'○')+' Lessons mastered: '+r.mastered+' of '+r.of+'</li>'+r.forms.map(function(f){return'<li class="'+(f.score!=null&&f.score>=TARGET?'ok':'')+'">'+(f.score!=null&&f.score>=TARGET?'✓':'○')+' Practice Form '+f.form+': '+(f.score==null?'not taken yet':'latest '+f.score)+'</li>';}).join('')+'</ul>'+
  (r.ready?'<div class="feedback good">You hit the practice target on all three forms. You are ready to book your exam.</div>':'')+'</div>';
  bind(el,A);
}

function bind(el,A){
  var root=el;root.querySelectorAll('[data-plan]').forEach(function(b){b.addEventListener('click',function(ev){
    var what=b.getAttribute('data-plan'),plan=load()||{};
    if(what==='edit'){plan.editing=true;store(plan);render(el);return;}
    if(what==='save'){
      var s=root.querySelector('#plan-start').value||ymd(new Date());
      var w=+((root.querySelector('input[name=plan-weeks]:checked')||{}).value||16);
      var d=+((root.querySelector('input[name=plan-days]:checked')||{}).value||6);
      store({start:s,weeks:w,perWeek:d,ticks:plan.ticks||{}});render(el);return;}
    if(what==='tick'){var day=ymd(new Date()),id=b.getAttribute('data-task');plan.ticks=plan.ticks||{};
      var t=plan.ticks[day]=plan.ticks[day]||[];var i=t.indexOf(id);if(i>=0)t.splice(i,1);else t.push(id);
      // Keep only the last 60 days of ticks.
      Object.keys(plan.ticks).sort().slice(0,-60).forEach(function(k){delete plan.ticks[k];});
      store(plan);render(el);}
  });});
}

window.ATLAS_PLAN={render:render,_test:{compute:compute,milestones:milestones,tasks:tasks,readiness:readiness,KEY:KEY}};
})();
