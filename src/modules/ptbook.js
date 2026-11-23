/* Network Atlas — Packet Tracer lab book view. Data: window.ATLAS_PT_LABS. Progress: network-atlas-ptbook-v1<suffix>. */
(function(){
'use strict';
var KEY='network-atlas-ptbook-v1'+(window.ATLAS_PREFS&&window.ATLAS_PREFS.profileSuffix?window.ATLAS_PREFS.profileSuffix():'');
var LABS=window.ATLAS_PT_LABS||[];
var open;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function load(){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');return{done:o.done||{},steps:o.steps||{}};}catch(e){return{done:{},steps:{}};}}
function store(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
function app(){return window.ATLAS_APP;}
function learned(id){var A=app();return !!(A&&A.progress.completed.indexOf(id)>=0);}
function unlocked(l){return l.lessons.every(learned);}
function title(id){var A=app();return A&&A.byId[id]?A.byId[id].title:id;}
function nextDue(){var s=load();return LABS.find(function(l){return unlocked(l)&&!s.done[l.id];})||null;}

var GUIDE=[
 ['Get it','Packet Tracer is free from Cisco Networking Academy (netacad.com). Make a free account, then download it from the Resources page.'],
 ['The screen','Bottom-left: device groups (Network Devices, End Devices, Connections). Middle: your workspace. Bottom-right: Realtime and Simulation buttons.'],
 ['Cables','The lightning bolt picks the right cable for you. Learn the real ones too: straight-through = different devices (PC to switch, router to switch). Cross-over = same kind (switch to switch, router to router, PC to router).'],
 ['Link lights','Green = up. Orange = the switch port is still starting (spanning tree, about 30 s). Click Fast Forward Time to skip. Red = down or shut down. Router ports start red until you type no shutdown.'],
 ['PCs','Click a PC → Desktop tab. IP Configuration sets the IP, mask, gateway and DNS. Command Prompt has ping, ipconfig, tracert and ssh.'],
 ['Routers and switches','Click the device → CLI tab. This is real-looking IOS. Answer no to the "initial configuration dialog". The Config tab has buttons, but the exam uses commands, so use the CLI tab.'],
 ['Simulation mode','Click Simulation, then send a ping and press Play. You see each ARP and ICMP packet move. Click a packet envelope to see its layers. This is the same idea as the packet journey in this app.'],
 ['Save often','File → Save As (.pkt). Packet Tracer can crash. In IOS, also type copy running-config startup-config.'],
 ['How this app helps','Turn on Packet Tracer mode in the Virtual network lab. Then the app answers exactly like IOS, with no hints. If you can do a mission there in Packet Tracer mode, you are ready to build it here.']];

function render(el){
  if(open===undefined)open=(nextDue()||{}).id||null;
  var s=load(),A=app(),doneN=LABS.filter(function(l){return s.done[l.id];}).length;
  var next=nextDue();
  el.innerHTML='<div class="section-top"><div><span class="eyebrow">REAL PRACTICE</span><h1>Packet Tracer lab book</h1><p>'+LABS.length+' labs to build in Cisco Packet Tracer, in the same order as your lessons. A lab opens when you have learned its lessons. '+doneN+' of '+LABS.length+' done.</p></div><button class="secondary-btn" data-action="simulator">Practice in the app lab</button></div>'+
  '<details class="panel pt-guide"'+(doneN?'':' open')+'><summary><b>Packet Tracer in 10 minutes</b> · read this before lab 1</summary><ol>'+GUIDE.map(function(g){return'<li><b>'+esc(g[0])+'.</b> '+esc(g[1])+'</li>';}).join('')+'</ol></details>'+
  '<ol class="pt-list">'+LABS.map(function(l,i){
    var un=unlocked(l),dn=!!s.done[l.id],isOpen=open===l.id,st=s.steps[l.id]||[];
    var head='<button class="pt-head" data-pt-open="'+l.id+'" aria-expanded="'+isOpen+'"'+(un?'':' disabled')+'><span class="pt-num'+(dn?' done':'')+'">'+(dn?'✓':i+1)+'</span><span class="pt-title"><b>'+esc(l.title)+'</b><small>'+(un?(dn?'Done':next&&next.id===l.id?'Ready · do this one next':'Ready'):'Opens after: '+l.lessons.filter(function(x){return!learned(x);}).map(title).map(esc).join(', '))+'</small></span><span class="pt-state">'+(un?(isOpen?'−':'+'):'🔒')+'</span></button>';
    if(!isOpen||!un)return'<li class="pt-lab'+(dn?' done':'')+(un?'':' locked')+'">'+head+'</li>';
    return'<li class="pt-lab open'+(dn?' done':'')+'">'+head+'<div class="pt-body">'+
      '<p class="pt-lessons">Uses: '+l.lessons.map(function(x){return'<button class="text-btn" data-topic="'+x+'">'+esc(title(x))+'</button>';}).join(' · ')+(l.mission?' · <button class="text-btn" data-pt-mission="'+l.mission+'">Try it in the app lab first ↗</button>':'')+'</p>'+
      '<h3>1. Build it</h3><ul>'+l.build.map(function(b){return'<li>'+esc(b)+'</li>';}).join('')+'</ul>'+
      '<h3>2. Configure it</h3><p class="small-print">Type every command yourself. Do not copy and paste — your fingers need the practice for the exam. Short forms like conf t and int g0/0 are fine.</p><ol class="pt-steps">'+l.steps.map(function(x,k){var ok=st.indexOf(k)>=0;return'<li class="'+(ok?'ok':'')+'"><label><input type="checkbox" data-pt-step="'+l.id+'" data-k="'+k+'"'+(ok?' checked':'')+'> <span>'+esc(x[0])+'</span></label>'+(x[1]?'<pre class="pt-code">'+esc(x[1])+'</pre>':'')+'</li>';}).join('')+'</ol>'+
      '<h3>3. Check it</h3><table class="pt-verify"><thead><tr><th>Type this</th><th>You should see</th></tr></thead><tbody>'+l.verify.map(function(v){return'<tr><td><code>'+esc(v[0])+'</code></td><td>'+esc(v[1])+'</td></tr>';}).join('')+'</tbody></table>'+
      '<h3>If it does not work</h3><ul>'+l.mistakes.map(function(m){return'<li>'+esc(m)+'</li>';}).join('')+'</ul>'+
      '<button class="'+(dn?'secondary-btn':'primary-btn')+'" data-pt-done="'+l.id+'">'+(dn?'Mark as not done':'I built it and the checks worked ✓')+'</button></div></li>';
  }).join('')+'</ol><p class="small-print">Packet Tracer is a Cisco product. Network Atlas is not affiliated with Cisco.</p>';
  el.querySelectorAll('[data-pt-open]').forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-pt-open');open=open===id?null:id;render(el);var n=el.querySelector('.pt-lab.open');if(n&&n.scrollIntoView)n.scrollIntoView({block:'start'});});});
  el.querySelectorAll('[data-pt-step]').forEach(function(c){c.addEventListener('change',function(){var o=load(),id=c.getAttribute('data-pt-step'),k=+c.getAttribute('data-k');var a=o.steps[id]=o.steps[id]||[];var i=a.indexOf(k);if(c.checked&&i<0)a.push(k);if(!c.checked&&i>=0)a.splice(i,1);store(o);c.closest('li').classList.toggle('ok',c.checked);});});
  el.querySelectorAll('[data-pt-done]').forEach(function(b){b.addEventListener('click',function(){var o=load(),id=b.getAttribute('data-pt-done');if(o.done[id])delete o.done[id];else{o.done[id]=new Date().toISOString().slice(0,10);open=null;}store(o);render(el);});});
  el.querySelectorAll('[data-pt-mission]').forEach(function(b){b.addEventListener('click',function(ev){ev.stopPropagation();if(app())app().jump('simulator');if(window.ATLAS_LAB&&window.ATLAS_LAB.open)window.ATLAS_LAB.open(b.getAttribute('data-pt-mission'));});});
}
window.ATLAS_PTBOOK={render:render,nextDue:nextDue,openLab:function(id){open=id;}};
})();
