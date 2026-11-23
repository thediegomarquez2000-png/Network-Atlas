// Browser test: the lab's IOS command line behaves like Packet Tracer (abbreviations, errors, ping format, modes).
// Usage: node tests/test_ios.js dist/index.html [shotsDir]
let pw;try{pw=require('playwright');}catch(e){pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');}
const path=require('path'),fs=require('fs');
const file='file://'+path.resolve(process.argv[2]);const shots=process.argv[3]||'shots';fs.mkdirSync(shots,{recursive:true});
const errors=[];const check=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)errors.push(m);};
(async()=>{
  const b=await pw.chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
  const pg=await b.newPage({viewport:{width:1280,height:900}});
  pg.on('pageerror',e=>errors.push('pageerror '+e.message));
  await pg.goto(file);await pg.waitForTimeout(300);
  const R=(mission,dev,cmds)=>pg.evaluate(([mission,dev,cmds])=>{const E=window.ATLAS_EMULATOR_TEST;if(mission)E.setState(E.setup(mission));
    const n=E.getState().devices.find(d=>d.label===dev);E.selectDevice(n.id);return cmds.map(c=>E.iosCmd(n,c));},[mission,dev,cmds]);
  // Missing return route mission, typed the way people type in Packet Tracer.
  let o=await R('static','R-2',['en','conf t','ip route 192.168.10.0 255.255.255.0 10.0.0.1','end','sh ip route','wr']);
  check(/S\s+192\.168\.10\.0\/24 \[1\/0\] via 10\.0\.0\.1/.test(o[4]),'abbreviated static route installs and shows in IOS format');
  check(/Gateway of last resort is not set/.test(o[4])&&/^L\s+/m.test(o[4]),'route table has L routes and gateway-of-last-resort line');
  check(/Building configuration...\n\[OK\]/.test(o[5]),'wr prints Building configuration [OK]');
  const pc=await pg.evaluate(()=>{const E=window.ATLAS_EMULATOR_TEST;const s=E.getState();const pcs=s.devices.filter(d=>d.type==='pc');const a=pcs[0],z=pcs[pcs.length-1];E.selectDevice(a.id);return [E.iosCmd(a,'ping '+z.ports[0].ip),E.iosCmd(a,'ping '+z.ports[0].ip)];});
  check(/Request timed out\.\nReply from/.test(pc[0])&&/Received = 3, Lost = 1 \(25% loss\)/.test(pc[0]),'first PC ping loses one reply (ARP), like Packet Tracer');
  check(/Received = 4, Lost = 0 \(0% loss\)/.test(pc[1]),'second PC ping gets all 4 replies');
  // Disabled interface mission with short forms.
  o=await R('routerdown','R-1',['en','conf t','int g0/1','no shut','end','sh ip int br']);
  check(/GigabitEthernet0\/1\s+\S+\s+YES manual up\s+up/.test(o[5]),'no shut via "int g0/1" brings Gi0/1 up/up');
  o=await R(null,'R-1',['ping 192.168.10.1','ping 192.168.10.1']);
  check(/!!!!!\nSuccess rate is 100 percent \(5\/5\)/.test(o[1]),'router ping prints !!!!! and success rate');
  // IOS error messages.
  o=await R(null,'R-1',['s','sh ip','conf t','hostnme R1','int g9/9','router ospf 1','do sh ip int br','exit','exit','shwo']);
  check(/% Ambiguous command:\s+"s"/.test(o[0]),'single letter is ambiguous');
  check(/% Incomplete command\./.test(o[1]),'incomplete command message');
  check(/\n% Invalid input detected at '\^' marker\./.test(o[3])&&/^\s+\^/.test(o[3]),'invalid input with caret');
  check(/%Invalid interface type and number/.test(o[4]),'bad interface name message');
  check(/does not model/.test(o[5]),'unmodeled real command is not called invalid');
  check(/GigabitEthernet0\/0/.test(o[6]),'do runs exec commands from config mode');
  check(/Translating "shwo"/.test(o[9]),'typo in exec mode triggers domain lookup like IOS');
  // enable secret prompts for a password; show run hides it.
  o=await R(null,'R-1',['en','conf t','enable secret class','no ip domain-lookup','line con 0','pass cisco','login','end','disable','en','nope','class','sh run','shwo']);
  check(o[9]==='Password: '&&o[10]==='Password: '&&o[11]==='','enable asks for the secret and retries');
  check(/enable secret 5 \$1\$/.test(o[12])&&/line con 0\n password cisco\n login/.test(o[12])&&!/enable secret class/.test(o[12]),'show run shows hashed secret and line config');
  check(/^Translating "shwo"\n%/.test(o[13]),'no ip domain-lookup skips the DNS wait');
  // Tab completion and ? help.
  const tab=await pg.evaluate(()=>{const E=window.ATLAS_EMULATOR_TEST;const n=E.getState().devices.find(d=>d.label==='R-1');return [E.iosComplete(n,'sh ip int'),E.iosCmd(n,'sh ip ?')];});
  check(tab[0]==='sh ip interface ','Tab completes a word');
  check(/arp/.test(tab[1])&&/interface/.test(tab[1])&&/route/.test(tab[1]),'? lists the next keywords');
  // Switch: VLAN with abbreviations.
  o=await R('vlan','SW-1',['en','conf t','vlan 10','name SALES','exit','int fa0/2','sw mode acc','sw acc vlan 10','end','sh vlan br']);
  check(!o.slice(0,9).some(x=>/%/.test(x)),'switch VLAN config with abbreviations has no errors');
  // UI: Packet Tracer mode toggle hides hints.
  await pg.evaluate(()=>window.ATLAS_LAB.open('routerdown'));await pg.waitForTimeout(300);
  await pg.evaluate(()=>{const E=window.ATLAS_EMULATOR_TEST;const s=E.getState();E.selectDevice(s.devices.find(d=>d.type==='router').id);s.inspector='terminal';window.ATLAS_LAB.render(document.getElementById('main'));});
  await pg.waitForTimeout(200);
  const term=await pg.$('#em-command');
  if(term){
    await pg.check('#em-ptmode');await pg.waitForTimeout(150);
    await pg.fill('#em-command','sh ip intx');await pg.press('#em-command','Enter');await pg.waitForTimeout(150);
    const txt=await pg.textContent('#em-console');
    check(/Invalid input/.test(txt)&&!/Lab tip/.test(txt.split('sh ip intx').pop()),'Packet Tracer mode: real error, no hint');
    await pg.screenshot({path:shots+'/ios-01-ptmode.png'});
  } else check(false,'terminal visible in lab');
  // Packet Tracer lab book: data integrity, unlocking, step ticks, done, Today task.
  const integ=await pg.evaluate(()=>{const A=window.ATLAS_APP,L=window.ATLAS_PT_LABS,ms=['first','cable','route','gateway','vlan','routerdown','static','blank'];const bad=[];
    L.forEach(l=>{l.lessons.forEach(id=>{if(!A.lessons[id])bad.push(l.id+' lesson '+id);});if(l.mission&&!ms.includes(l.mission))bad.push(l.id+' mission');if(!l.build.length||!l.steps.length||!l.verify.length||!l.mistakes.length)bad.push(l.id+' empty part');});
    if(new Set(L.map(l=>l.id)).size!==L.length)bad.push('dup ids');return {n:L.length,bad};});
  check(integ.n>=14&&!integ.bad.length,'lab book has '+integ.n+' labs with valid lessons/missions '+integ.bad.join(','));
  const F=Array.from({length:15},(_,i)=>'n0'+String(i+1).padStart(2,'0'));
  await pg.evaluate(F=>{localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:F,mastered:Object.fromEntries(F.map(i=>[i,'x'])),subjectPassed:[],recheckDue:{}}));localStorage.setItem('network-atlas-plan-v1',JSON.stringify({start:new Date().toISOString().slice(0,10),weeks:16,perWeek:7,ticks:{}}));},F);
  await pg.reload();await pg.waitForTimeout(300);
  const tl=await pg.$$eval('.plan-task b',n=>n.map(x=>x.textContent));
  check(tl.some(t=>/Packet Tracer: Your first network/.test(t)),'Today offers the first Packet Tracer lab once its lessons are learned');
  await pg.click('[data-view="ptbook"]');await pg.waitForTimeout(200);
  check(await pg.isVisible('.pt-lab.open'),'lab book opens the next due lab');
  check((await pg.$$('.pt-lab.locked')).length>=10,'later labs are locked');
  await pg.check('[data-pt-step="pt01"][data-k="0"]');
  await pg.click('[data-pt-done="pt01"]');await pg.waitForTimeout(150);
  const st=await pg.evaluate(()=>JSON.parse(localStorage.getItem('network-atlas-ptbook-v1')));
  check(st.done.pt01&&st.steps.pt01.includes(0),'step tick and lab done are saved');
  await pg.setViewportSize({width:390,height:844});await pg.click('[data-pt-open="pt01"]');await pg.waitForTimeout(150);
  await pg.screenshot({path:shots+'/ios-02-ptbook-mobile.png',fullPage:true});
  check(!(await pg.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)),'lab book has no horizontal scroll on a phone');
  await b.close();console.log('errors:',JSON.stringify(errors));process.exit(errors.length?1:0);
})();
