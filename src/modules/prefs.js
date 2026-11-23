/* Network Atlas v0.6 — learner profiles, accessibility settings, read-aloud, break reminders.
 * Everything stays in this browser. The grown-up PIN is a light lock, not security.
 */
(function(){'use strict';
const PK='network-atlas-profiles-v6';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sysReduce=false;try{sysReduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
const DEF={fontSize:0,theme:'dark',easyFont:false,reduceMotion:sysReduce,calm:false,literal:false,rate:0.95,breakMins:0,longMessages:true,minWords:12,sameDay:false,modes:{type:true,say:true,pick:true,adult:true}};
let profiles=null;try{profiles=JSON.parse(localStorage.getItem(PK)||'null');}catch(e){}
if(!profiles||!Array.isArray(profiles.list)||!profiles.list.length)profiles={active:'p1',list:[{id:'p1',name:'Learner 1'}],pin:''};
profiles.list=profiles.list.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string').slice(0,20);
if(!profiles.list.length)profiles.list=[{id:'p1',name:'Learner 1'}];
if(!profiles.list.some(p=>p.id===profiles.active))profiles.active=profiles.list[0].id;
if(typeof profiles.pin!=='string')profiles.pin='';
const suffix=()=>profiles.active==='p1'?'':'::'+profiles.active;
const prefKey=()=>'network-atlas-prefs-v6'+suffix();
let prefs={...DEF,modes:{...DEF.modes}};
try{const raw=JSON.parse(localStorage.getItem(prefKey())||'null');if(raw&&typeof raw==='object')prefs={...DEF,...raw,modes:{...DEF.modes,...(raw.modes||{})}};}catch(e){}
let unlocked=false;
const saveProfiles=()=>{try{localStorage.setItem(PK,JSON.stringify(profiles));}catch(e){}};
const savePrefs=()=>{try{localStorage.setItem(prefKey(),JSON.stringify(prefs));}catch(e){}};
const me=()=>profiles.list.find(p=>p.id===profiles.active);
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';

function apply(){const h=document.documentElement;
 [1,2,3].forEach(n=>h.classList.toggle('fs-'+n,prefs.fontSize===n));
 ['contrast','light'].forEach(t=>h.classList.toggle('t-'+t,prefs.theme===t));
 h.classList.toggle('f-easy',!!prefs.easyFont);h.classList.toggle('rm',!!prefs.reduceMotion);
 h.classList.toggle('calm',!!prefs.calm);h.classList.toggle('literal',!!prefs.literal);
 const av=document.querySelector('.user-avatar');if(av){av.textContent=initials(me().name);av.title='Learner: '+me().name;}
}

/* ---------- read aloud ---------- */
const canSpeak='speechSynthesis' in window;
function clean(t){return String(t||'').replace(/[✓✕↗⌁✦◉◈⇄↻↺✺⚒⌘◫☷▤→←·•○●★■🔊]/g,' ').replace(/\s+/g,' ').trim();}
function speak(text){if(!canSpeak)return false;speechSynthesis.cancel();const parts=clean(text).split(/(?<=[.!?:])\s+/).filter(Boolean);
 const voices=speechSynthesis.getVoices();const v=voices.find(x=>/^en[-_]US/i.test(x.lang)&&x.localService)||voices.find(x=>/^en/i.test(x.lang));
 parts.forEach(p=>{const u=new SpeechSynthesisUtterance(p);u.rate=prefs.rate;if(v)u.voice=v;speechSynthesis.speak(u);});return true;}
function stop(){if(canSpeak)speechSynthesis.cancel();}
function speaking(){return canSpeak&&(speechSynthesis.speaking||speechSynthesis.pending);}
const rateLabel=r=>r<0.8?'Slow':r<1.05?'Normal':'Fast';

/* ---------- break reminders ---------- */
let sessionStart=Date.now(),breakOpen=false,hiddenAt=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>5*60000){sessionStart=Date.now();}});
setInterval(()=>{if(!prefs.breakMins||breakOpen||document.hidden)return;if(Date.now()-sessionStart>=prefs.breakMins*60000)showBreak();},15000);
function showBreak(){breakOpen=true;stop();let m=document.getElementById('break-modal');if(!m){m=document.createElement('div');m.id='break-modal';m.className='modal-backdrop';m.innerHTML='<div class="definition-panel break-panel" role="dialog" aria-modal="true" aria-labelledby="break-title"><div class="break-icon">🌿</div><h2 id="break-title">Break time</h2><p id="break-text"></p><p>Stand up, stretch, get some water. Your progress is saved.</p><button class="primary-btn" id="break-done">I\'m back</button></div>';document.body.append(m);m.querySelector('#break-done').addEventListener('click',()=>{m.classList.add('hidden');breakOpen=false;sessionStart=Date.now();});}
 m.querySelector('#break-text').textContent=`You have been learning for ${prefs.breakMins} minutes. Nice focus!`;m.classList.remove('hidden');m.querySelector('#break-done').focus();}

/* ---------- settings page ---------- */
function seg(key,opts){return `<div class="seg" role="group">${opts.map(([v,label])=>`<button type="button" data-pref="${key}" data-val='${JSON.stringify(v)}' aria-pressed="${prefs[key]===v}" class="${prefs[key]===v?'on':''}">${label}</button>`).join('')}</div>`;}
function tog(key,label,help){return `<button type="button" class="tog ${prefs[key]?'on':''}" data-pref="${key}" data-val='${JSON.stringify(!prefs[key])}' aria-pressed="${!!prefs[key]}"><span class="tog-track"><span></span></span><span class="tog-text"><b>${label}</b>${help?`<small>${help}</small>`:''}</span></button>`;}
function renderSettings(el){if(!el)return;const locked=Boolean(profiles.pin)&&!unlocked,cur=me();
 el.innerHTML=`<div class="section-top"><div><span class="eyebrow">MAKE IT FIT THE LEARNER</span><h1>Settings & learners</h1><p>These settings belong to <b>${esc(cur.name)}</b>. Each learner on this device keeps their own settings and progress.</p></div></div>
 <div class="set-grid">
 <section class="panel set-section"><h2>👤 Learner</h2><div class="learner-list">${profiles.list.map(p=>`<div class="learner-row ${p.id===profiles.active?'on':''}"><span class="user-avatar">${esc(initials(p.name))}</span><b>${esc(p.name)}</b>${p.id===profiles.active?'<span class="pill">ACTIVE</span>':`<button class="secondary-btn" data-profile-switch="${p.id}">Switch</button>${locked?'':`<button class="text-btn inline" data-profile-remove="${p.id}">Remove</button>`}`}</div>`).join('')}</div>
 <div class="inline-form"><input id="new-learner" maxlength="24" placeholder="New learner's name" aria-label="New learner's name"><button class="secondary-btn" data-profile-add>Add learner</button></div>
 <div class="inline-form"><input id="rename-learner" maxlength="24" value="${esc(cur.name)}" aria-label="Rename this learner"><button class="secondary-btn" data-profile-rename>Rename</button></div></section>
 <section class="panel set-section"><h2>👀 Seeing</h2><h4>Text size</h4>${seg('fontSize',[[0,'Normal'],[1,'Large'],[2,'Larger'],[3,'Largest']])}<h4>Colors</h4>${seg('theme',[['dark','Dark'],['contrast','High contrast'],['light','Light']])}
 ${tog('easyFont','Easier-reading font','Simpler letter shapes and more space between words and lines.')}${tog('reduceMotion','Less motion','Turns off sliding and fading effects.')}${tog('calm','Calm screen','Hides scores, percentages and the busy graph.')}${tog('literal','Literal mode','Hides “Picture it like this” comparisons, for learners who prefer things said exactly.')}</section>
 <section class="panel set-section"><h2>🔊 Listening</h2><p class="small-print">${canSpeak?'Tap 🔊 next to any section to hear it. “Read page” at the top reads the whole screen. Tap again to stop.':'This browser cannot read aloud. Try Chrome, Edge or Safari.'}</p><h4>Reading speed</h4><div class="rate-row"><input type="range" id="pref-rate" min="0.6" max="1.4" step="0.05" value="${prefs.rate}" aria-label="Reading speed"><span id="rate-label">${rateLabel(prefs.rate)}</span><button class="secondary-btn" data-voice-test>Test voice</button></div></section>
 <section class="panel set-section"><h2>⏱ Breaks & messages</h2><h4>Remind me to take a break after</h4>${seg('breakMins',[[0,'Off'],[10,'10 min'],[15,'15 min'],[20,'20 min'],[30,'30 min']])}${tog('longMessages','Keep messages on screen longer','Pop-up messages stay for 9 seconds instead of 3.')}</section>
 <section class="panel set-section set-wide"><h2>🧑‍🏫 For grown-ups</h2>${locked?`<p>These settings are locked with a PIN.</p><div class="inline-form"><input id="pin-unlock" type="password" inputmode="numeric" maxlength="8" placeholder="PIN" aria-label="PIN"><button class="primary-btn small" data-pin-unlock>Unlock</button></div>`:`
 <h4>Ways a learner can show what they know</h4><p class="small-print">Every way checks the same key ideas. Turn off any that don't suit this learner.</p><div class="tog-grid">${[['type','✏️ Type it'],['say','🎤 Say it (speech to text)'],['pick','🧩 Pick the ideas'],['adult','🧑‍🏫 Tell a grown-up']].map(([k,label])=>`<button type="button" class="tog ${prefs.modes[k]?'on':''}" data-mode-toggle="${k}" aria-pressed="${!!prefs.modes[k]}"><span class="tog-track"><span></span></span><span class="tog-text"><b>${label}</b></span></button>`).join('')}</div>
 <h4>Fewest words when typing or talking</h4>${seg('minWords',[[0,'No minimum'],[5,'5 words'],[12,'12 words'],[25,'25 words']])}
 ${tog('sameDay','Allow come-back checks on the same day','For teachers trying out the app. Learning sticks best when the check happens on a different day.')}
 <h4>Grown-up PIN</h4><p class="small-print">${profiles.pin?'A PIN is set.':'No PIN set.'} The PIN locks this section, removing learners, and the “Tell a grown-up” check. It is a light lock saved on this device, not real security.</p><div class="inline-form"><input id="pin-new" type="password" inputmode="numeric" maxlength="8" placeholder="${profiles.pin?'New PIN (4–8 digits)':'Choose a PIN (4–8 digits)'}" aria-label="New PIN"><button class="secondary-btn" data-pin-save>Save PIN</button>${profiles.pin?'<button class="text-btn inline" data-pin-clear>Remove PIN</button><button class="text-btn inline" data-pin-lock>Lock now</button>':''}</div>`}</section>
 </div>`;}
function rerenderSettings(){const main=document.getElementById('main');if(!main||!main.querySelector('.set-grid'))return;const y=scrollY;renderSettings(main);scrollTo(0,y);}
function note(msg){const n=document.getElementById('toast');if(!n)return;n.textContent=msg;n.classList.add('show');clearTimeout(note.t);note.t=setTimeout(()=>n.classList.remove('show'),prefs.longMessages?9000:3500);}

document.addEventListener('click',ev=>{
 const toast=ev.target.closest('#toast');if(toast){toast.classList.remove('show');return;}
 const b=ev.target.closest('button');if(!b)return;
 if(b.id==='say-page'){if(speaking()){stop();return;}const main=document.getElementById('main');if(!speak(main?main.innerText:''))note('This browser cannot read aloud.');return;}
 if(b.dataset.sayDef!==undefined){const m=document.getElementById('definition-modal');speak([m.querySelector('.definition-term').textContent,m.querySelector('.definition-meaning').textContent,'For example: '+m.querySelector('.definition-example').textContent].join('. '));return;}
 if(b.dataset.pref){let v;try{v=JSON.parse(b.dataset.val);}catch(e){return;}if(['minWords','sameDay'].includes(b.dataset.pref)&&profiles.pin&&!unlocked)return;prefs[b.dataset.pref]=v;savePrefs();apply();if(b.dataset.pref==='breakMins')sessionStart=Date.now();rerenderSettings();return;}
 if(b.dataset.modeToggle){if(profiles.pin&&!unlocked)return;const k=b.dataset.modeToggle;const next={...prefs.modes,[k]:!prefs.modes[k]};if(!Object.values(next).some(Boolean)){note('Keep at least one way to show it turned on.');return;}prefs.modes=next;savePrefs();rerenderSettings();return;}
 if(b.dataset.voiceTest!==undefined){if(!speak('Hi '+me().name+'. This is how fast I will read. A network lets devices share information.'))note('This browser cannot read aloud.');return;}
 if(b.dataset.profileSwitch){if(!profiles.list.some(p=>p.id===b.dataset.profileSwitch))return;profiles.active=b.dataset.profileSwitch;saveProfiles();stop();location.reload();return;}
 if(b.dataset.profileAdd!==undefined){const inp=document.getElementById('new-learner');const name=(inp?.value||'').trim()||('Learner '+(profiles.list.length+1));if(profiles.list.length>=20){note('That is the most learners for one device.');return;}profiles.list.push({id:'p'+Date.now().toString(36),name:name.slice(0,24)});saveProfiles();rerenderSettings();note(name+' was added. Tap Switch to use their profile.');return;}
 if(b.dataset.profileRename!==undefined){const v=(document.getElementById('rename-learner')?.value||'').trim();if(!v)return;me().name=v.slice(0,24);saveProfiles();apply();rerenderSettings();note('Renamed.');return;}
 if(b.dataset.profileRemove){if(profiles.pin&&!unlocked)return;const p=profiles.list.find(x=>x.id===b.dataset.profileRemove);if(!p||p.id===profiles.active)return;if(!(()=>{try{return window.self!==window.top}catch(e){return true}})()&&!window.confirm('Remove '+p.name+' from this device list? Their saved data stays in the browser but will no longer be shown.'))return;profiles.list=profiles.list.filter(x=>x.id!==p.id);saveProfiles();rerenderSettings();return;}
 if(b.dataset.pinUnlock!==undefined){const v=document.getElementById('pin-unlock')?.value||'';if(api.unlock(v)){rerenderSettings();note('Unlocked.');}else note('That PIN is not right.');return;}
 if(b.dataset.pinSave!==undefined){const v=(document.getElementById('pin-new')?.value||'').trim();if(!/^\d{4,8}$/.test(v)){note('Use 4 to 8 digits for the PIN.');return;}profiles.pin=v;unlocked=true;saveProfiles();rerenderSettings();note('PIN saved.');return;}
 if(b.dataset.pinClear!==undefined){profiles.pin='';saveProfiles();rerenderSettings();note('PIN removed.');return;}
 if(b.dataset.pinLock!==undefined){unlocked=false;rerenderSettings();note('Grown-up settings locked.');return;}
});
document.addEventListener('input',ev=>{if(ev.target.id==='pref-rate'){prefs.rate=Number(ev.target.value)||0.95;savePrefs();const l=document.getElementById('rate-label');if(l)l.textContent=rateLabel(prefs.rate);}});
if(canSpeak&&speechSynthesis.onvoiceschanged!==undefined)speechSynthesis.onvoiceschanged=()=>{};

async function saveFile(name,data,mime){
 if(window.claude&&typeof window.claude.use==='function'){let d=null;try{d=await window.claude.use('downloads');}catch(e){}
  if(d){try{await d.save({filename:name,data});return 'saved';}catch(e){const c=e&&e.code;if(c==='declined'){note('Download cancelled.');return 'declined';}if(c==='rate_limited'){note('Another download is waiting for your answer.');return 'busy';}if(c==='rejected_extension'||c==='extension_not_enabled'){note('That file type cannot be saved here.');return 'blocked';}}}}
 const blob=data instanceof Blob?data:new Blob([data],{type:mime||'application/octet-stream'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);return 'fallback';}
const api={saveFile,get:k=>prefs[k],profileSuffix:suffix,profileName:()=>me().name,speak,stop,speaking,canSpeak,
 hasPin:()=>Boolean(profiles.pin),unlocked:()=>!profiles.pin||unlocked,unlock:v=>{if(profiles.pin&&String(v)===profiles.pin){unlocked=true;return true;}return !profiles.pin;},
 renderSettings,msgMs:()=>prefs.longMessages?9000:3500};
window.ATLAS_PREFS=api;
apply();
})();
