/* Network Atlas — Final CCNA exam (200-301 v2.0 style). Three parallel forms test the same 50 skills in different ways:
 * A Classic (concepts), B Troubleshoot (exhibits), C Hands-on (typed IOS, ordering, matching). 100 questions, 120 minutes.
 * Practice instrument only: not affiliated with Cisco; the scaled score is an estimate. */
(function(){'use strict';
const BANK=window.FX_BANK||[];const root=document.getElementById('main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P=()=>window.ATLAS_PREFS;const KEY='network-atlas-final-v1'+(window.ATLAS_PREFS?.profileSuffix()||'');
const DOMAINS={1:['Network Infrastructure & Connectivity',25],2:['Switching & Network Access',25],3:['IP Routing',20],4:['Network Services & Security',20],5:['AI, Network Operations & Management',10]};
const FORMS={A:{name:'Classic',icon:'📘',desc:'Real-exam style: concepts, definitions, choose the best answer.'},B:{name:'Troubleshoot',icon:'🩺',desc:'Read show output, logs and configs from a clinic network and find the fault.'},C:{name:'Hands-on',icon:'⌨️',desc:'Type real IOS commands and answers, order steps, match items. Fewer options to lean on.'}};
const TYPE_NAMES={mc:'Single answer',multi:'Choose N',input:'Typed answer / CLI',order:'Put in order',match:'Matching'};
let store={attempts:[],cur:null,notes:'',time:120,allowBack:false,showTimer:true};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')store={...store,...s,attempts:Array.isArray(s.attempts)?s.attempts.slice(-30):[]};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}};
let view='lobby',viewAttempt=null,warnSkip=false,confirmEnd=false,tick=null,lastTick=0;
function toast(m){const n=document.getElementById('toast');if(!n)return;n.textContent=m;n.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove('show'),P()?.msgMs()||4000);}

/* ---------- seeded randomness ---------- */
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
function shuf(arr,r){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- IPv4 / IPv6 helpers ---------- */
const ip2n=s=>s.split('.').reduce((a,o)=>(a*256)+Number(o),0);
const n2ip=n=>[24,16,8,0].map(b=>Math.floor(n/2**b)%256).join('.');
const maskOf=p=>n2ip(2**32-2**(32-p));
function sub(ip,p){const n=ip2n(ip),size=2**(32-p),net=n-(n%size);return{net:n2ip(net),bc:n2ip(net+size-1),first:n2ip(net+1),last:n2ip(net+size-2),size,netn:net};}
function v6expand(s){s=String(s).toLowerCase().trim().replace(/\/\d+$/,'');if(!/^[0-9a-f:]+$/.test(s)||(s.match(/::/g)||[]).length>1)return null;let[h,t]=s.split('::');const H=h?h.split(':'):[],T=t!==undefined&&t?t.split(':'):[];if(t===undefined){if(H.length!==8)return null;}const fill=8-H.length-T.length;if(fill<0||(t===undefined&&fill!==0))return null;const g=[...H,...Array(t===undefined?0:fill).fill('0'),...T];if(g.some(x=>!/^[0-9a-f]{1,4}$/.test(x)))return null;return g.map(x=>parseInt(x,16)).join(':');}
const hex=n=>n.toString(16);

/* ---------- generated skills: subnetting, EUI-64, longest prefix match ---------- */
function genSubnet(form,n,r){const p=ri(r,20,29),o1=[10,172,192][ri(r,0,2)],o2=o1===172?ri(r,16,31):o1===192?168:ri(r,0,255);const ip=`${o1}.${o2}.${ri(r,0,255)}.${ri(r,1,254)}`;const s=sub(ip,p);const nxt=n2ip(s.netn+s.size+Math.min(5,s.size-2));const prv=n2ip(Math.max(0,s.netn-s.size+1));
 const inside=n2ip(s.netn+1+((ip2n(ip)-s.netn+Math.max(1,Math.floor(s.size/3)))%(s.size-2)));
 const base={skill:'ipv4-subnet',dom:1,topic:'1.3',sname:'IPv4 subnet math'};const w=`/${p} = mask ${maskOf(p)}, block size ${s.size}. Network ${s.net}, usable ${s.first}–${s.last}, broadcast ${s.bc}.`;
 if(form==='A'&&n===0)return{...base,t:'mc',q:`What is the broadcast address of the subnet that contains ${ip}/${p}?`,o:[s.bc,s.net,s.last,n2ip(s.netn+2*s.size-1)],w};
 if(form==='A')return{...base,t:'mc',q:`What is the last usable host address in the subnet that contains ${ip}/${p}?`,o:[s.last,s.bc,s.first,n2ip(Math.max(1,s.netn-2))],w};
 if(form==='B'&&n===0)return{...base,t:'mc',x:`C:\\> ipconfig\n   IPv4 Address. . . : ${ip}\n   Subnet Mask . . . : ${maskOf(p)}\n   Default Gateway . : ${s.first}`,q:'Which address is on the same subnet as this host (reachable without a router)?',o:[inside===ip?s.last:inside,nxt,prv,n2ip((ip2n(ip)+2**24)%2**32)],w};
 if(form==='B'){const bad=n2ip(s.netn+s.size+1);return{...base,t:'mc',x:`Clinic PC settings\n   IP address : ${ip}\n   Mask       : ${maskOf(p)}\n   Gateway    : ${bad}`,q:'The PC can reach local devices but nothing else. Why?',o:[`The gateway ${bad} is outside the PC's subnet (${s.net}–${s.bc})`,`The mask ${maskOf(p)} is not a valid mask`,`${ip} is the subnet's broadcast address`,`${ip} is the subnet's network address`],w};}
 if(n===0)return{...base,t:'input',v:'ipv4',q:`Type the network address of the subnet that contains ${ip}/${p}.`,i:[s.net],w};
 return{...base,t:'input',v:'ipv4',q:`Type the broadcast address of the subnet that contains ${ip} with mask ${maskOf(p)}.`,i:[s.bc],w};}
function genEui(form,n,r){const b=Array.from({length:6},()=>ri(r,0,255));b[0]&=0xfc;const mac=b.map(x=>x.toString(16).padStart(2,'0'));const dotted=`${mac[0]}${mac[1]}.${mac[2]}${mac[3]}.${mac[4]}${mac[5]}`;
 const iid=[hex(((b[0]^2)<<8)|b[1]),hex((b[2]<<8)|0xff),hex((0xfe<<8)|b[3]),hex((b[4]<<8)|b[5])];const noflip=[hex((b[0]<<8)|b[1]),iid[1],iid[2],iid[3]];const wrongIns=[iid[0],hex((b[2]<<8)|b[3]),'fffe',hex((b[4]<<8)|b[5])];const swap=[iid[0],hex((b[2]<<8)|0xfe),hex((0xff<<8)|b[3]),iid[3]];
 const g3=hex(ri(r,1,0xffff)),pre=`2001:db8:${g3}:${hex(ri(r,0,0xff))}`;const full=x=>`${pre}:${x.join(':')}`;
 const base={skill:'eui64',dom:1,topic:'1.4',sname:'Modified EUI-64'};const w=`Split the MAC ${dotted} in half, insert FFFE, and flip the 7th bit of the first byte (${mac[0]} → ${(b[0]^2).toString(16).padStart(2,'0')}). Interface ID = ${iid.join(':')}.`;
 if(form==='A'&&n===0)return{...base,t:'mc',q:`Which interface ID does modified EUI-64 build from MAC address ${dotted}?`,o:[iid.join(':'),noflip.join(':'),wrongIns.join(':'),swap.join(':')],w};
 if(form==='A')return{...base,t:'mc',q:'In modified EUI-64, what is inserted into the middle of the 48-bit MAC address, and which bit is inverted?',o:['FFFE is inserted, and the 7th bit (universal/local bit) of the first byte is inverted','FFFF is inserted, and the first bit is inverted','FFFE is inserted, and the last bit is inverted','0000 is inserted, and no bit changes'],w:'EUI-64 inserts FFFE between the OUI and the device half, and flips the U/L bit (the 7th bit of the first byte).'};
 if(form==='B'&&n===0)return{...base,t:'mc',x:`R1# show interfaces Gi0/0 | include address\n  Hardware is iGbE, address is ${dotted} (bia ${dotted})\nR1(config-if)# ipv6 address ${pre}::/64 eui-64`,q:'Which global unicast address does Gi0/0 receive?',o:[full(iid),full(noflip),full(wrongIns),full(swap)],w};
 if(form==='B'){const m=x=>x.join(':');const macv=[dotted,`${(b[0]^2).toString(16).padStart(2,'0')}${mac[1]}.${mac[2]}${mac[3]}.${mac[4]}${mac[5]}`,`${mac[0]}${mac[1]}.${mac[2]}ff.fe${mac[3]}`,`${mac[1]}${mac[0]}.${mac[3]}${mac[2]}.${mac[5]}${mac[4]}`];return{...base,t:'mc',x:`R2# show ipv6 interface brief\nGigabitEthernet0/1   [up/up]\n    FE80::${m(iid).toUpperCase()}`,q:'This link-local address was built with modified EUI-64. Which MAC address does the interface have?',o:macv,w:`Reverse it: remove FFFE and flip the 7th bit back. ${w}`};}
 if(n===0)return{...base,t:'input',v:'ipv6',q:`Interface MAC is ${dotted}. Type the full IPv6 address created by "ipv6 address ${pre}::/64 eui-64".`,i:[full(iid)],w};
 return{...base,t:'input',v:'iid',q:`Type the 64-bit modified EUI-64 interface ID (four hex groups separated by colons) for MAC ${dotted}.`,i:[iid.join(':')],w};}
function genLpm(form,n,r){const o2=ri(r,10,250),o3=ri(r,1,250),s27=ri(r,0,7)*32;const routes=[{p:`10.${o2}.0.0/16`,nh:'10.0.1.2',if:'Gi0/0',c:'O'},{p:`10.${o2}.${o3}.0/24`,nh:'10.0.2.2',if:'Gi0/1',c:'O'},{p:`10.${o2}.${o3}.${s27}/27`,nh:'10.0.3.2',if:'Gi0/2',c:'S'},{p:'0.0.0.0/0',nh:'203.0.113.1',if:'Gi0/3',c:'S*'}];
 const lvl=(ri(r,0,3)+n*2)%4;let d;if(lvl===0)d=`10.${o2}.${o3}.${s27+ri(r,1,30)}`;else if(lvl===1)d=`10.${o2}.${o3}.${(s27+32+ri(r,1,30))%256||5}`;else if(lvl===2)d=`10.${o2}.${(o3+ri(r,1,4))%256}.${ri(r,1,254)}`;else d=`10.${(o2+ri(r,1,3))%256}.${ri(r,0,255)}.${ri(r,1,254)}`;
 const inR=(ip,pf)=>{const[nw,l]=pf.split('/');return Math.floor(ip2n(ip)/2**(32-l))===Math.floor(ip2n(nw)/2**(32-l));};const best=routes.filter(x=>inR(d,x.p)).sort((a,b)=>b.p.split('/')[1]-a.p.split('/')[1])[0];
 const base={skill:'lpm',dom:3,topic:'3.1',sname:'Longest prefix match'};const w=`${d} matches ${routes.filter(x=>inR(d,x.p)).map(x=>x.p).join(', ')}. The longest (most specific) prefix, ${best.p}, wins, so the next hop is ${best.nh}.`;
 const table=routes.map(x=>`${x.c.padEnd(3)} ${x.p.padEnd(18)} [${x.c==='O'?'110/20':'1/0'}] via ${x.nh}, ${x.if}`).join('\n');const opts=[best.nh,...routes.map(x=>x.nh).filter(x=>x!==best.nh)];
 if(form==='A')return{...base,t:'mc',q:`A router has these routes: ${routes.map(x=>`${x.p} via ${x.nh}`).join('; ')}. Which next hop does it use for a packet to ${d}?`,o:opts,w};
 if(form==='B')return{...base,t:'mc',x:`R1# show ip route\nGateway of last resort is 203.0.113.1 to network 0.0.0.0\n${table}`,q:`A packet arrives for ${d}. Which next hop does R1 use?`,o:opts,w};
 return{...base,t:'input',v:'ipv4',x:`R1# show ip route\n${table}`,q:`Type the next-hop address R1 uses for a packet destined to ${d}.`,i:[best.nh],w};}

/* ---------- build a form ---------- */
function normalize(it){const t=it.t||(it.i?'input':it.ord?'order':it.pr?'match':it.k?'multi':'mc');return{...it,t};}
function buildForm(form,seed){const r=rng(seed);const items=[];
 for(const sk of BANK)for(const it of sk.forms[form]||[])items.push(normalize({...it,skill:sk.id,dom:sk.dom,topic:sk.topic,sname:sk.name}));
 for(const n of [0,1]){items.push(normalize(genSubnet(form,n,r)),normalize(genEui(form,n,r)),normalize(genLpm(form,n,r)));}
 const ordered=shuf(items,r);ordered.forEach((it,ix)=>{it.n=ix;if(it.t==='mc'||it.t==='multi')it.view=shuf(it.o.map((_,i)=>i),r);if(it.t==='order')it.view=shuf(it.ord.map((_,i)=>i),r);if(it.t==='match'){it.rights=shuf([...new Set(it.pr.map(p=>p[1]))],r);}});return ordered;}
let curItems=null;const items=()=>{if(!store.cur)return[];if(!curItems||curItems.seed!==store.cur.seed){curItems=buildForm(store.cur.form,store.cur.seed);curItems.seed=store.cur.seed;}return curItems;};

/* ---------- grading ---------- */
const normTxt=s=>String(s??'').toLowerCase().replace(/[“”]/g,'"').replace(/\s+/g,' ').trim().replace(/[.;]$/,'')
 .replace(/\b(g|gi|gig|giga|gigabit|gigabitethernet) ?(\d+(?:\/\d+)+)/g,'gigabitethernet$2').replace(/\b(f|fa|fas|fast|fastethernet) ?(\d+(?:\/\d+)+)/g,'fastethernet$2').replace(/\b(lo|loop|loopback) ?(\d+)\b/g,'loopback$2');
function tokEq(u,e){if(u===e)return true;if(/^[a-z-]+$/.test(e)&&u.length>=2&&e.startsWith(u))return true;if(e.includes(':')&&u.includes(':')){const a=v6expand(u),b=v6expand(e);if(a&&a===b&&(u.split('/')[1]||'')===(e.split('/')[1]||''))return true;}return false;}
function inputOk(ans,it){const u=String(ans||'').trim();if(!u)return false;
 if(it.v==='ipv4')return it.i.some(x=>u.replace(/\s/g,'')===x);
 if(it.v==='ipv6')return it.i.some(x=>v6expand(u)&&v6expand(u)===v6expand(x));
 if(it.v==='mac')return it.i.some(x=>u.toLowerCase().replace(/[.:\-\s]/g,'')===x.toLowerCase().replace(/[.:\-]/g,''));
 if(it.v==='iid'){const g=s=>s.toLowerCase().replace(/\s/g,'').split(':').map(h=>/^[0-9a-f]{1,4}$/.test(h)?parseInt(h,16):NaN).join(',');return it.i.some(x=>g(u)===g(x));}
 const U=normTxt(u).split(' ');return it.i.some(x=>{const E=normTxt(x).split(' ');return E.length===U.length&&E.every((e,k)=>tokEq(U[k],e));});}
function isRight(it,a){if(a===undefined||a===null)return false;if(it.t==='mc')return a===0;if(it.t==='multi')return Array.isArray(a)&&a.length===it.k&&a.every(x=>x<it.k);if(it.t==='input')return inputOk(a,it);if(it.t==='order')return Array.isArray(a)&&a.length===it.ord.length&&a.every((v,i)=>v===i);if(it.t==='match')return Array.isArray(a)&&it.pr.every((p,i)=>a[i]===p[1]);return false;}
function answered(it,a){if(a===undefined||a===null)return false;if(it.t==='mc')return true;if(it.t==='multi')return a.length===it.k;if(it.t==='input')return String(a).trim().length>0;if(it.t==='order')return a.length===it.ord.length;if(it.t==='match')return it.pr.every((_,i)=>a[i]);return false;}
function ansText(it,a){if(!answered(it,a))return '(no answer)';if(it.t==='mc')return it.o[a];if(it.t==='multi')return a.map(i=>it.o[i]).join(' + ');if(it.t==='input')return String(a);if(it.t==='order')return a.map(i=>it.ord[i]).join(' > ');return it.pr.map((p,i)=>`${p[0]} = ${a[i]||'?'}`).join('; ');}
function rightText(it){if(it.t==='mc')return it.o[0];if(it.t==='multi')return it.o.slice(0,it.k).join(' + ');if(it.t==='input')return it.i[0];if(it.t==='order')return it.ord.join(' > ');return it.pr.map(p=>`${p[0]} = ${p[1]}`).join('; ');}

/* ---------- exam flow ---------- */
function start(form){const limit=store.time?store.time*60000:0;store.cur={form,seed:(Math.random()*2**31)>>>0,i:0,answers:{},elapsed:0,limit,allowBack:!!store.allowBack,startedAt:new Date().toISOString(),max:0};curItems=null;save();view='exam';warnSkip=false;confirmEnd=false;render();}
function finish(auto){accrue();const c=store.cur;if(!c)return;const its=items();const res=its.map(it=>{const a=c.answers[it.n];return{skill:it.skill,sname:it.sname,dom:it.dom,topic:it.topic,t:it.t,ok:isRight(it,a),q:it.q,x:it.x||'',given:ansText(it,a),right:rightText(it),w:it.w||''};});
 const ok=res.filter(x=>x.ok).length,raw=ok/res.length;const att={id:Date.now().toString(36),form:c.form,date:new Date().toISOString(),limit:c.limit,used:c.elapsed,allowBack:c.allowBack,auto:!!auto,raw,scaled:Math.round(300+700*raw),results:res};
 store.attempts.push(att);store.attempts=store.attempts.slice(-30);store.cur=null;curItems=null;save();stopTick();viewAttempt=att.id;view='results';render();toast(auto?'Time is up. Your exam was submitted.':'Exam submitted.');}
function accrue(){const c=store.cur;if(c&&lastTick){const now=Date.now();if(!document.hidden)c.elapsed+=now-lastTick;lastTick=now;}}
function startTick(){if(tick)return;lastTick=Date.now();tick=setInterval(()=>{const c=store.cur;if(!c||view!=='exam'||!root.querySelector('.fx-exam')){stopTick();save();return;}accrue();
 const left=c.limit?c.limit-c.elapsed:null;const el=document.getElementById('fx-timer');if(el)el.textContent=clock(c);if(left!==null){if(left<=0){finish(true);return;}if(left<=600000&&!c.w10){c.w10=1;toast('10 minutes left.');}if(left<=300000&&!c.w5){c.w5=1;toast('5 minutes left.');}}
 if(Math.floor(c.elapsed/1000)%5===0)save();},1000);}
function stopTick(){accrue();if(tick)clearInterval(tick);tick=null;lastTick=0;}
const mmss=ms=>{const s=Math.max(0,Math.round(ms/1000));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0');};
const clock=c=>c.limit?mmss(c.limit-c.elapsed)+' left':mmss(c.elapsed)+' used';

/* ---------- rendering ---------- */
function render(el=root){if(!el)return;if(view==='exam'&&!store.cur)view='lobby';
 el.innerHTML=`<div class="fx-app">${view==='exam'?examHTML():view==='results'?resultsHTML():lobbyHTML()}</div>`;
 if(view==='exam'){startTick();const inp=el.querySelector('#fx-input');if(inp)inp.focus({preventScroll:true});}else stopTick();}
function latestByForm(){const m={};for(const a of store.attempts)m[a.form]=a;return m;}
function lobbyHTML(){const last=latestByForm(),c=store.cur;
 return `<section class="fx-hero"><span class="eyebrow">FINAL EXAM · CCNA 200-301 v2.0 STYLE</span><h1>How ready are you, really?</h1><p>Three full-length practice exams. Each one tests the same 50 CCNA skills in a different way, so you can tell what you truly know from what you guessed. Pass all three ways and you know it for sure.</p>
 <div class="fx-facts"><span><b>120</b> minutes</span><span><b>100</b> questions</span><span><b>5</b> domains, weighted like the blueprint</span><span><b>No</b> going back</span><span><b>300–1000</b> scaled score</span></div></section>
 ${c?`<div class="fx-resume"><div><b>Exam in progress: Form ${c.form} · ${FORMS[c.form].name}</b><small>Question ${c.i+1} of ${items().length} · ${clock(c)}. The timer pauses while the exam screen is closed.</small></div><button class="primary-btn" data-fx="resume">Resume exam →</button><button class="text-btn inline" data-fx="abandon">${confirmEnd?'Tap again to discard':'Discard'}</button></div>`:''}
 <div class="fx-forms">${Object.entries(FORMS).map(([k,f])=>{const a=last[k];return `<div class="fx-form"><div class="fx-form-top"><span class="fx-form-icon">${f.icon}</span><div><small>FORM ${k}</small><h3>${f.name}</h3></div></div><p>${f.desc}</p>${a?`<div class="fx-last"><b>${a.scaled}</b><span>${Math.round(a.raw*100)}% · ${new Date(a.date).toLocaleDateString()}</span><button class="inline-link" data-fx="open" data-id="${a.id}">See results</button></div>`:'<div class="fx-last empty">Not taken yet</div>'}<button class="primary-btn" data-fx="start" data-form="${k}" ${c?'disabled':''}>${a?'Retake':'Start'} Form ${k}</button></div>`;}).join('')}</div>
 <section class="panel fx-settings"><h3>Exam settings</h3><div class="fx-set-row"><span>Time limit</span><div class="seg">${[[120,'Standard · 120 min'],[180,'Extended · 180 min'],[240,'Double · 240 min'],[0,'Untimed']].map(([v,l])=>`<button class="${store.time===v?'on':''}" aria-pressed="${store.time===v}" data-fx="time" data-v="${v}">${l}</button>`).join('')}</div></div>
 <button class="tog ${store.allowBack?'on':''}" data-fx="back-toggle" aria-pressed="${store.allowBack}"><span class="tog-track"><span></span></span><span class="tog-text"><b>Allow going back to earlier questions</b><small>The real exam does not allow this. Leave it off for a true readiness check.</small></span></button>
 <button class="tog ${store.showTimer?'on':''}" data-fx="timer-toggle" aria-pressed="${store.showTimer}"><span class="tog-track"><span></span></span><span class="tog-text"><b>Show the countdown</b><small>Turn off if a ticking clock adds stress. Time still runs out.</small></span></button>
 <p class="small-print">Extended time mirrors the testing accommodations Pearson VUE can grant on request. Scores here are practice estimates, not an official result.</p></section>
 ${store.attempts.length?mapHTML()+reportHTML():''}`;}
function examHTML(){const c=store.cur,its=items(),it=its[c.i],a=c.answers[it.n];const done=Object.keys(c.answers).filter(k=>answered(its.find(x=>x.n==k),c.answers[k])).length;
 let body='';
 if(it.t==='mc'||it.t==='multi'){const sel=it.t==='mc'?[a]:(a||[]);body=`${it.t==='multi'?`<p class="fx-choose">Choose ${it.k}. (${sel.filter(x=>x!==undefined).length} selected)</p>`:''}<div class="options">${it.view.map((oi,j)=>`<button class="option ${sel.includes(oi)?'selected':''}" data-fx="pick" data-v="${oi}" aria-pressed="${sel.includes(oi)}"><span class="option-letter">${'ABCDEF'[j]}</span><span class="opt-txt">${esc(it.o[oi])}</span></button>`).join('')}</div>`;}
 if(it.t==='input')body=`<label class="fx-input-label">Your answer<input id="fx-input" class="fx-input" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(a||'')}" placeholder="Type here"></label><p class="small-print">Commands may be abbreviated the way IOS allows (for example, sh ip int br).</p>`;
 if(it.t==='order'){const chosen=a||[];body=`<p class="fx-choose">Tap the items in the correct order. Tap a numbered item to remove it.</p><div class="fx-order"><div><h4>Your order</h4>${chosen.length?chosen.map((oi,k)=>`<button class="fx-chip on" data-fx="unorder" data-k="${k}"><span>${k+1}</span>${esc(it.ord[oi])}</button>`).join(''):'<p class="small-print">Nothing yet.</p>'}</div><div><h4>Items</h4>${it.view.filter(oi=>!chosen.includes(oi)).map(oi=>`<button class="fx-chip" data-fx="order" data-v="${oi}">${esc(it.ord[oi])}</button>`).join('')||'<p class="small-print">All placed.</p>'}</div></div>`;}
 if(it.t==='match'){const m=a||[];body=`<div class="fx-match">${it.pr.map((p,k)=>`<label class="fx-match-row"><span>${esc(p[0])}</span><select data-fx-match="${k}"><option value="">Choose…</option>${it.rights.map(r=>`<option ${m[k]===r?'selected':''}>${esc(r)}</option>`).join('')}</select></label>`).join('')}</div>`;}
 const last=c.i===its.length-1;
 return `<div class="fx-exam"><div class="fx-bar"><b>Form ${c.form} · ${FORMS[c.form].name}</b><span>Question ${c.i+1} of ${its.length}</span>${store.showTimer||(c.limit&&c.limit-c.elapsed<300000)?`<span class="fx-timer" id="fx-timer" role="timer">${clock(c)}</span>`:''}<button class="say-btn" data-fx="say" aria-label="Read this question out loud">🔊</button></div>
 <div class="fx-progress"><div style="width:${(c.i)/its.length*100}%"></div></div>
 <div class="question-card fx-q">${it.x?`<div class="fx-exhibit"><small>EXHIBIT</small><pre>${esc(it.x)}</pre></div>`:''}<div class="q-title">${esc(it.q)}</div>${body}</div>
 ${warnSkip?`<div class="feedback hint" role="alert">You have not answered this question. It will count as incorrect. Tap Next again to move on anyway.</div>`:''}
 <div class="fx-nav">${c.allowBack&&c.i>0?`<button class="secondary-btn" data-fx="prev">← Back</button>`:'<span class="small-print">No going back, like the real exam.</span>'}<span class="small-print">${done} answered</span><button class="primary-btn" data-fx="next">${last?'Finish exam ✓':'Next →'}</button></div>
 <div class="fx-end"><button class="text-btn inline" data-fx="end">${confirmEnd?'Tap again to end now and score what you answered':'End exam early'}</button><button class="text-btn inline" data-fx="pause">Pause and leave</button></div></div>`;}
function domRows(res){return Object.keys(DOMAINS).map(d=>{const r=res.filter(x=>x.dom==d),ok=r.filter(x=>x.ok).length;return{d,name:DOMAINS[d][0],w:DOMAINS[d][1],ok,n:r.length,pct:r.length?Math.round(ok/r.length*100):0};});}
function typeRows(res){return Object.keys(TYPE_NAMES).map(t=>{const r=res.filter(x=>x.t===t),ok=r.filter(x=>x.ok).length;return{t,name:TYPE_NAMES[t],ok,n:r.length,pct:r.length?Math.round(ok/r.length*100):0};}).filter(x=>x.n);}
function resultsHTML(){const a=store.attempts.find(x=>x.id===viewAttempt)||store.attempts.at(-1);if(!a){view='lobby';return lobbyHTML();}const pass=a.scaled>=825;const miss=a.results.filter(x=>!x.ok);
 return `<div class="section-top"><div><span class="eyebrow">FORM ${a.form} · ${FORMS[a.form].name.toUpperCase()} · ${new Date(a.date).toLocaleString()}</span><h1>Your results</h1></div><button class="secondary-btn" data-fx="lobby">← Final exam home</button></div>
 <div class="fx-score ${pass?'pass':'fail'}"><div><small>ESTIMATED SCALED SCORE</small><b>${a.scaled}</b><span>${a.results.filter(x=>x.ok).length} of ${a.results.length} correct (${Math.round(a.raw*100)}%)</span></div><div class="fx-verdict"><b>${pass?'At or above the 825 target':'Below the 825 target'}</b><p>Cisco does not publish the passing score; 825 is a commonly cited community estimate. Time used: ${mmss(a.used)}${a.limit?' of '+mmss(a.limit):' (untimed)'}${a.allowBack?' · going back allowed':''}.</p></div></div>
 <div class="fx-two"><section class="panel"><h3>By domain</h3>${domRows(a.results).map(r=>`<div class="fx-bar-row"><span>${r.d}.0 ${esc(r.name)} <small>(${r.w}% of exam)</small></span><div class="fx-meter"><div style="width:${r.pct}%" class="${r.pct>=80?'good':r.pct>=60?'mid':'low'}"></div></div><b>${r.pct}%</b></div>`).join('')}</section>
 <section class="panel"><h3>By question style</h3>${typeRows(a.results).map(r=>`<div class="fx-bar-row"><span>${esc(r.name)} <small>(${r.n})</small></span><div class="fx-meter"><div style="width:${r.pct}%" class="${r.pct>=80?'good':r.pct>=60?'mid':'low'}"></div></div><b>${r.pct}%</b></div>`).join('')}</section></div>
 ${reportHTML()}
 <section class="panel" style="margin-top:16px"><h3>Review missed questions (${miss.length})</h3>${miss.length?miss.map(x=>`<details class="fx-review"><summary><span class="pill neutral">${esc(x.topic)}</span> ${esc(x.q.length>110?x.q.slice(0,110)+'…':x.q)}</summary>${x.x?`<pre>${esc(x.x)}</pre>`:''}<p><b>Your answer:</b> ${esc(x.given)}</p><p><b>Correct:</b> ${esc(x.right)}</p><p class="small-print">${esc(x.w)}</p></details>`).join(''):'<p>Perfect score. Nothing to review.</p>'}</section>
 ${mapHTML()}`;}
function skillMap(){const last=latestByForm();const forms=Object.keys(FORMS);const skills=[];const seen=new Map();
 for(const f of forms){const a=last[f];if(!a)continue;for(const r of a.results){if(!seen.has(r.skill)){seen.set(r.skill,{id:r.skill,name:r.sname,dom:r.dom,topic:r.topic,by:{}});skills.push(seen.get(r.skill));}const s=seen.get(r.skill);s.by[f]=s.by[f]||[0,0];s.by[f][1]++;if(r.ok)s.by[f][0]++;}}
 for(const s of skills){const t=Object.values(s.by).reduce((a,b)=>[a[0]+b[0],a[1]+b[1]],[0,0]);s.ok=t[0];s.n=t[1];const nf=Object.keys(s.by).length;const ratio=s.n?s.ok/s.n:0;
  s.rating=ratio===1?(nf>=3?'Solid':'Looks solid'):ratio>=0.5?'Shaky':'Gap';const weak=Object.entries(s.by).filter(([f,v])=>v[0]<v[1]).map(([f])=>FORMS[f].name);s.note=weak.length&&weak.length<nf?'Missed in '+weak.join(', '):'';}
 const order={Gap:0,Shaky:1,'Looks solid':2,Solid:3};skills.sort((a,b)=>order[a.rating]-order[b.rating]||a.dom-b.dom);return{skills,last};}
function mapHTML(){const{skills,last}=skillMap();if(!skills.length)return '';const cnt=r=>skills.filter(s=>s.rating===r).length;
 return `<section class="panel fx-map"><h3>Your skills map</h3><p class="small-print">Built from your latest attempt of each form. A skill is <b>Solid</b> only when you get it right in all three ways. "Missed in…" shows which way of asking tripped you up.</p>
 <div class="fx-legend"><span class="r-gap">Gap ${cnt('Gap')}</span><span class="r-shaky">Shaky ${cnt('Shaky')}</span><span class="r-ok">Looks solid ${cnt('Looks solid')}</span><span class="r-solid">Solid ${cnt('Solid')}</span></div>
 <div class="scroll"><table class="fx-table"><thead><tr><th>Skill</th><th>Topic</th>${Object.keys(FORMS).map(f=>`<th>${f}</th>`).join('')}<th>Rating</th></tr></thead><tbody>${skills.map(s=>`<tr><td>${esc(s.name)}${s.note?`<small>${esc(s.note)}</small>`:''}</td><td>${esc(s.topic)}</td>${Object.keys(FORMS).map(f=>`<td class="num">${s.by[f]?s.by[f].join('/'):(last[f]?'–':'·')}</td>`).join('')}<td><span class="fx-rate r-${s.rating==='Gap'?'gap':s.rating==='Shaky'?'shaky':s.rating==='Solid'?'solid':'ok'}">${s.rating}</span></td></tr>`).join('')}</tbody></table></div></section>`;}
function reportHTML(){return `<section class="panel fx-report"><h3>Take your results to an AI tutor</h3><p>Get a PDF built for Claude, ChatGPT or another AI tutor. It has your scores, your skills map, every missed question with your answer, and a ready-made prompt asking the tutor to plan your study around your gaps.</p>
 <label class="fx-notes">How I learn best (optional, included in the report)<textarea id="fx-notes" placeholder="For example: I learn by talking it through, I need diagrams, I can follow along but struggle to repeat it back, quiz me one term at a time…">${esc(store.notes)}</textarea></label>
 <div class="btn-row"><button class="primary-btn" data-fx="pdf">⇩ Download PDF report</button><button class="secondary-btn" data-fx="copy">Copy report as text</button><button class="secondary-btn" data-fx="md">⇩ Download as Markdown</button></div></section>`;}

/* ---------- report ---------- */
function reportText(){const{skills,last}=skillMap();const name=P()?.profileName()||'Learner';const lines=[];const L=s=>lines.push(s);
 L('# Network Atlas: CCNA 200-301 v2.0 practice exam report');L(`Learner: ${name} · Generated ${new Date().toLocaleString()}`);L('Practice results from Network Atlas, not affiliated with Cisco. Scaled scores are estimates: 300 + 700 × fraction correct. 825 is a community-estimated pass mark.');L('');
 L('## How the exam works');L('Three parallel forms test the same 50 skills from the CCNA v2.0 blueprint, two questions per skill per form (100 questions, 120-minute standard limit, no going back):');Object.entries(FORMS).forEach(([k,f])=>L(`- Form ${k} (${f.name}): ${f.desc}`));L('A skill counts as Solid only if it was answered correctly in all three forms.');L('');
 L('## Scores (latest attempt per form)');Object.keys(FORMS).forEach(f=>{const a=last[f];L(a?`- Form ${f} ${FORMS[f].name}: scaled ${a.scaled} (${Math.round(a.raw*100)}% correct), ${new Date(a.date).toLocaleDateString()}, time ${mmss(a.used)}${a.limit?' of '+mmss(a.limit):' untimed'}${a.allowBack?', back allowed':''}${a.auto?', ran out of time':''}`:`- Form ${f} ${FORMS[f].name}: not taken`);});
 const all=store.attempts.length;if(all>Object.keys(last).length)L(`- Total attempts on record: ${all}`);L('');
 L('## Domain scores (% correct)');L('| Domain (weight) | '+Object.keys(FORMS).map(f=>'Form '+f).join(' | ')+' |');Object.keys(DOMAINS).forEach(d=>L(`| ${d}.0 ${DOMAINS[d][0]} (${DOMAINS[d][1]}%) | `+Object.keys(FORMS).map(f=>{const a=last[f];if(!a)return '-';const r=domRows(a.results).find(x=>x.d==d);return r.pct+'%';}).join(' | ')+' |'));L('');
 L('## Question-style scores (% correct, latest attempts combined)');const comb=Object.values(last).flatMap(a=>a.results);typeRows(comb).forEach(r=>L(`- ${r.name}: ${r.pct}% (${r.ok}/${r.n})`));L('');
 L('## Skills map');L('Columns show correct/asked per form. Gap = under 50%; Shaky = 50–99%; Looks solid = 100% but not tested in all three forms; Solid = 100% across all three forms.');L('| Rating | Skill | Blueprint topic | Form A | Form B | Form C | Notes |');skills.forEach(s=>L(`| ${s.rating} | ${s.name} | ${s.topic} | ${['A','B','C'].map(f=>s.by[f]?s.by[f].join('/'):'-').join(' | ')} | ${s.note} |`));L('');
 L('## Missed questions (latest attempt per form)');Object.keys(FORMS).forEach(f=>{const a=last[f];if(!a)return;const miss=a.results.filter(x=>!x.ok);L(`### Form ${f} (${FORMS[f].name}): ${miss.length} missed`);miss.forEach((x,i)=>{L(`${i+1}. [${x.topic} ${x.sname}] ${x.q}`);if(x.x)L('   Exhibit: '+x.x.replace(/\n/g,' / ').slice(0,400));L('   My answer: '+x.given);L('   Correct: '+x.right);if(x.w)L('   Why: '+x.w);});L('');});
 const pr=P();L('## About me as a learner');if(store.notes.trim())L(store.notes.trim());else L('(No notes added.)');if(pr){const acc=[];if(pr.get('fontSize'))acc.push('larger text');if(pr.get('easyFont'))acc.push('easier-reading font');if(pr.get('calm'))acc.push('calm screen');if(pr.get('literal'))acc.push('literal language (no analogies)');if(pr.get('reduceMotion'))acc.push('less motion');if(store.time>120)acc.push('extended exam time ('+store.time+' min)');if(store.time===0)acc.push('untimed exams');if(acc.length)L('Settings I use in the app: '+acc.join(', ')+'.');}L('');
 const gaps=skills.filter(s=>s.rating==='Gap').map(s=>s.name),shaky=skills.filter(s=>s.rating==='Shaky').map(s=>s.name);
 L('## Prompt for my AI tutor');L(`You are my CCNA 200-301 v2.0 tutor. Use this report to build my study plan. Start with my Gap skills${gaps.length?' ('+gaps.slice(0,8).join('; ')+(gaps.length>8?'; …':'')+')':''}, then my Shaky skills${shaky.length?' ('+shaky.slice(0,6).join('; ')+(shaky.length>6?'; …':'')+')':''}. For each skill: look at the questions I missed and figure out whether I misunderstand the concept, misread show output, or can't produce the command myself (compare Forms A, B and C). Teach one skill at a time, check my understanding with a few questions before moving on, and have me explain it back in my own words. Follow the learner notes above. Finish with a weekly plan that weights topics by the exam domain weights and by my weak areas.`);
 return lines.join('\n');}
function pdfSafe(s){return String(s).replace(/[→⇢]/g,'->').replace(/[←]/g,'<-').replace(/[↔]/g,'<->').replace(/[✓✔]/g,'OK').replace(/[✕✗×]/g,'x').replace(/[–—]/g,'-').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/…/g,'...').replace(/µ/g,'u').replace(/≈/g,'~').replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/g,'');}
function loadJsPDF(){return new Promise((res,rej)=>{if(window.jspdf)return res(window.jspdf);const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=()=>window.jspdf?res(window.jspdf):rej(new Error('jsPDF missing'));s.onerror=()=>rej(new Error('jsPDF failed to load'));document.head.append(s);});}
async function buildPdf(){const {jsPDF}=await loadJsPDF();const doc=new jsPDF({unit:'mm',format:'letter'});const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=16;let y=M;
 const need=h=>{if(y+h>H-M){doc.addPage();y=M;}};
 const write=(txt,{size=9.5,bold=false,mono=false,color=[30,30,30],indent=0,gap=1.2}={})=>{doc.setFont(mono?'courier':'helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);const lines=doc.splitTextToSize(pdfSafe(txt),W-2*M-indent);const lh=size*0.42+gap;for(const ln of lines){need(lh);doc.text(ln,M+indent,y+size*0.35);y+=lh;}};
 for(const raw of reportText().split('\n')){if(raw.startsWith('# ')){write(raw.slice(2),{size:17,bold:true,color:[8,80,65],gap:2.5});y+=2;continue;}if(raw.startsWith('## ')){y+=3;need(10);doc.setDrawColor(77,200,170);doc.setLineWidth(0.5);doc.line(M,y,W-M,y);y+=2.5;write(raw.slice(3),{size:12.5,bold:true,color:[8,60,90],gap:1.8});y+=1;continue;}
  if(raw.startsWith('### ')){y+=1.5;write(raw.slice(4),{size:10.5,bold:true});continue;}if(raw.startsWith('|')){if(/^\|\s*-/.test(raw))continue;write(raw.replace(/^\||\|$/g,'').split('|').map(c=>c.trim()).join('  |  '),{size:7.6,mono:true,gap:0.9});continue;}
  if(!raw.trim()){y+=2;continue;}if(/^\s{3}/.test(raw)){write(raw.trim(),{size:8.6,indent:6,color:[70,70,70]});continue;}write(raw,{size:9.5});}
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(140,140,140);doc.text(`Network Atlas · CCNA practice report · page ${i} of ${pages}`,M,H-8);}
 return doc.output('arraybuffer');}
async function download(kind){if(!store.attempts.length){toast('Take at least one form first.');return;}const stamp=new Date().toISOString().slice(0,10);
 try{if(kind==='pdf'){toast('Building your PDF…');const buf=await buildPdf();const r=await P()?.saveFile(`ccna-practice-report-${stamp}.pdf`,buf,'application/pdf');if(r==='saved'||r==='fallback')toast('PDF ready. Upload it to your AI tutor along with the prompt inside.');}
  else{const r=await P()?.saveFile(`ccna-practice-report-${stamp}.md`,reportText(),'text/markdown');if(r)toast('Report saved.');}}
 catch(e){if(kind==='pdf'){toast('Could not build the PDF here (no internet for the PDF library?). Saving a Markdown copy instead.');try{await P()?.saveFile(`ccna-practice-report-${stamp}.md`,reportText(),'text/markdown');}catch(_){}}}}

/* ---------- events ---------- */
function speakQ(){const c=store.cur,it=items()[c.i];let t=(it.x?'Exhibit. '+it.x.replace(/\n/g,'. ')+'. ':'')+'Question. '+it.q+' ';if(it.t==='mc'||it.t==='multi')t+=it.view.map((oi,j)=>'Answer '+'ABCDEF'[j]+': '+it.o[oi]+'.').join(' ');if(it.t==='order')t+='Items: '+it.view.map(oi=>it.ord[oi]).join('. ');if(it.t==='match')t+='Match: '+it.pr.map(p=>p[0]).join('. ')+'. Choices: '+it.rights.join('. ');const p=P();if(p?.speaking())p.stop();else if(!p?.speak(t))toast('This browser cannot read aloud.');}
root.addEventListener('click',ev=>{if(!root.querySelector('.fx-app'))return;const b=ev.target.closest('[data-fx]');if(!b)return;const act=b.dataset.fx,c=store.cur;
 if(act!=='end')confirmEnd=act==='abandon'?confirmEnd:false;
 if(act==='start'){start(b.dataset.form);return;}
 if(act==='resume'){view='exam';render();return;}
 if(act==='abandon'){if(!confirmEnd){confirmEnd=true;render();return;}store.cur=null;curItems=null;confirmEnd=false;save();render();toast('Exam discarded.');return;}
 if(act==='time'){store.time=Number(b.dataset.v);save();render();return;}
 if(act==='back-toggle'){store.allowBack=!store.allowBack;save();render();return;}
 if(act==='timer-toggle'){store.showTimer=!store.showTimer;save();render();return;}
 if(act==='open'){viewAttempt=b.dataset.id;view='results';render();scrollTo(0,0);return;}
 if(act==='lobby'){view='lobby';render();scrollTo(0,0);return;}
 if(act==='pdf'||act==='md'){download(act);return;}
 if(act==='copy'){const t=reportText();(navigator.clipboard?.writeText(t)||Promise.reject()).then(()=>toast('Report copied. Paste it into your AI tutor chat.')).catch(()=>toast('Copy was blocked. Use Download instead.'));return;}
 if(!c)return;const its=items(),it=its[c.i];
 if(act==='say'){speakQ();return;}
 if(act==='pick'){const v=Number(b.dataset.v);if(it.t==='mc')c.answers[it.n]=v;else{let s=c.answers[it.n]||[];s=s.includes(v)?s.filter(x=>x!==v):s.length<it.k?[...s,v]:s;c.answers[it.n]=s;}warnSkip=false;save();rerender();return;}
 if(act==='order'){c.answers[it.n]=[...(c.answers[it.n]||[]),Number(b.dataset.v)];warnSkip=false;save();rerender();return;}
 if(act==='unorder'){const s=[...(c.answers[it.n]||[])];s.splice(Number(b.dataset.k),1);c.answers[it.n]=s;save();rerender();return;}
 if(act==='next'){captureInput();if(!answered(it,c.answers[it.n])&&!warnSkip){warnSkip=true;rerender();return;}warnSkip=false;if(c.i>=its.length-1){finish(false);return;}c.i++;save();P()?.stop();render();scrollTo(0,0);return;}
 if(act==='prev'){captureInput();if(c.allowBack&&c.i>0){c.i--;warnSkip=false;save();render();scrollTo(0,0);}return;}
 if(act==='end'){if(!confirmEnd){confirmEnd=true;rerender();return;}captureInput();finish(false);return;}
 if(act==='pause'){captureInput();save();view='lobby';render();scrollTo(0,0);toast('Exam paused. The timer stops while you are away.');return;}
});
function captureInput(){const c=store.cur;if(!c)return;const inp=root.querySelector('#fx-input');if(inp){const it=items()[c.i];c.answers[it.n]=inp.value;}}
function rerender(){const y=scrollY;render();scrollTo(0,y);}
root.addEventListener('input',ev=>{if(!root.querySelector('.fx-app'))return;if(ev.target.id==='fx-input'){const c=store.cur;if(!c)return;c.answers[items()[c.i].n]=ev.target.value;warnSkip=false;}if(ev.target.id==='fx-notes'){store.notes=ev.target.value.slice(0,3000);save();}});
root.addEventListener('change',ev=>{if(!root.querySelector('.fx-app'))return;const s=ev.target.closest('[data-fx-match]');if(!s)return;const c=store.cur;if(!c)return;const it=items()[c.i];const m=[...(c.answers[it.n]||it.pr.map(()=>''))];m[Number(s.dataset.fxMatch)]=s.value;c.answers[it.n]=m;warnSkip=false;save();});
root.addEventListener('keydown',ev=>{if(ev.target.id==='fx-input'&&ev.key==='Enter'){ev.preventDefault();root.querySelector('[data-fx="next"]')?.click();}});
window.ATLAS_FINAL={render:el=>{if(store.cur&&view!=='results')view=view==='exam'?'exam':'lobby';render(el);},hasActive:()=>!!store.cur};
window.ATLAS_FINAL_TEST={buildForm,isRight,inputOk,reportText,skillMap,store:()=>store,BANK};
})();
