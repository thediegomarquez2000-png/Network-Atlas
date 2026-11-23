/* Network Atlas v0.4.1: self-contained browser NETWORK SIMULATOR (not Cisco IOS binary emulation).
 * Model scope: Ethernet links, IPv4, ARP, VLAN access/trunk bridging, MAC learning,
 * directly connected and static IPv4 routes, ICMP echo request/reply, limited IOS-like CLI.
 * Out of scope: STP, DTP, CDP, real packet timing, NAT, DHCP, OSPF, IPv6, wireless.
 */
(function(){'use strict';
const root=document.getElementById('main');
const STORE='network-atlas-virtual-lab-v4'+(window.ATLAS_PREFS?.profileSuffix()||'');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const nIP=s=>{const parts=String(s??'').split('.');if(parts.length!==4||parts.some(t=>!/^\d{1,3}$/.test(t)||Number(t)>255))return null;const a=parts.map(Number);return (((a[0]<<24)>>>0)+(a[1]<<16)+(a[2]<<8)+a[3])>>>0;};
const strIP=n=>[24,16,8,0].map(sh=>(n>>>sh)&255).join('.');
const maskNum=p=>p===0?0:(0xffffffff<<(32-p))>>>0;
const prefixOK=p=>/^\d+$/.test(String(p))&&Number(p)>=1&&Number(p)<=30;
const range=(ip,p)=>{const a=nIP(ip);if(a===null||!prefixOK(p))return null;const m=maskNum(Number(p)),nw=(a&m)>>>0,bc=(nw|(~m>>>0))>>>0;return {network:strIP(nw),broadcast:strIP(bc),mask:strIP(m),first:strIP((nw+1)>>>0),last:strIP((bc-1)>>>0),p:Number(p),nw,bc};};
const onNet=(i,ip,p)=>{const a=nIP(i),b=nIP(ip);return a!==null&&b!==null&&prefixOK(p)&&((a&maskNum(Number(p)))>>>0)===((b&maskNum(Number(p)))>>>0);};
const hostOK=(ip,p)=>{const a=nIP(ip),s=range(ip,p);return a!==null&&s&&a!==s.nw&&a!==s.bc;};
const maskToPrefix=m=>{const n=nIP(m);if(n===null)return null;if(n===0)return 0;const b=n.toString(2).padStart(32,'0');return /^1+0*$/.test(b)?b.indexOf('0')<0?32:b.indexOf('0'):null;};
const asMAC=k=>'02:AA:54:'+[(k>>>16)&255,(k>>>8)&255,k&255].map(v=>v.toString(16).padStart(2,'0')).join(':').toUpperCase();
const entryDict=(window.ATLAS_GLOSSARY||[]);const quick=['ip address','subnet','default gateway','mac address','arp','ethernet','switch','router','vlan','trunk','ping','packet','frame','icmp','static route','routing table','broadcast','port','interface'];
const terms=entryDict.filter(t=>quick.includes(String(t.term).toLowerCase())).sort((a,b)=>b.term.length-a.term.length);
const re=new RegExp('\\b(?:'+terms.map(t=>String(t.term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
const defs=s=>{const raw=String(s??'');let at=0,out='';re.lastIndex=0;for(const m of raw.matchAll(re)){const t=terms.find(k=>k.term.toLowerCase()===m[0].toLowerCase());if(!t)continue;out+=esc(raw.slice(at,m.index))+`<span class="glossary-link" tabindex="0" role="button" data-glossary="${esc(t.id)}">${esc(m[0])}</span>`;at=m.index+m[0].length;}return out+esc(raw.slice(at));};
let nextId=10;
const mkPort=(name,type,k,props={})=>({name,mac:asMAC(k),ip:'',prefix:24,gateway:'',vlan:1,mode:'access',allowed:'1,10,20,30,99',admin:true,...props});
function device(type,label,x,y){const id=type+(nextId++),k=nextId*100;return {id,type,label,x,y,routes:[],vlans:[1],ports:type==='pc'?[mkPort('Eth0',type,k,{ip:''})]:type==='switch'?Array.from({length:8},(_,i)=>mkPort('Fa0/'+(i+1),type,k+i)):Array.from({length:4},(_,i)=>mkPort('Gi0/'+i,type,k+i,{admin:false}))};}
function addLink(d,a,ap,b,bp){const da=d.devices.find(n=>n.id===a),db=d.devices.find(n=>n.id===b);if(!da||!db||a===b)return false;if(!da.ports.some(p=>p.name===ap)||!db.ports.some(p=>p.name===bp))return false;if(d.links.some(l=>(l.a===a&&l.ap===ap)||(l.b===a&&l.bp===ap)||(l.a===b&&l.ap===bp)||(l.b===b&&l.bp===bp)))return false;d.links.push({id:'c'+(nextId++),a,ap,b,bp});return true;}
function setup(key){nextId=10;const d={devices:[],links:[],mission:key,selected:'',from:'',dest:'',wiring:false,firstWire:'',inspector:'settings',trace:null,step:0,consoleLines:{},consoleMode:{},completed:{},help:false,showExtras:false,savedAt:null};
  const add=(type,name,x,y)=>{const n=device(type,name,x,y);d.devices.push(n);return n;};
  if(key==='blank'){const p=add('pc','PC-1',130,205);d.selected=p.id;d.from=p.id;return d;}
  const a=add('pc','PC-A',140,200),s=add('switch','SW-1',410,200),b=add('pc','PC-B',760,200);
  a.ports[0].ip='192.168.10.10';b.ports[0].ip='192.168.10.20';
  addLink(d,a.id,'Eth0',s.id,'Fa0/1');if(key!=='cable')addLink(d,s.id,'Fa0/2',b.id,'Eth0');
  if(key==='gateway'||key==='route'||key==='routerdown'||key==='static'){
    d.links=[];b.x=860;s.x=295;b.y=190;a.y=190;
    const r=add('router','R-1',500,330),s2=add('switch','SW-2',700,190);r.ports[0].ip='192.168.10.1';r.ports[0].admin=true;r.ports[1].ip='192.168.20.1';r.ports[1].admin=true;
    a.ports[0].gateway=key==='gateway'?'192.168.10.254':'192.168.10.1';b.ports[0].ip='192.168.20.20';b.ports[0].gateway='192.168.20.1';
    addLink(d,a.id,'Eth0',s.id,'Fa0/1');addLink(d,s.id,'Fa0/2',r.id,'Gi0/0');addLink(d,r.id,'Gi0/1',s2.id,'Fa0/1');addLink(d,s2.id,'Fa0/2',b.id,'Eth0');
    if(key==='routerdown')r.ports[1].admin=false;
    if(key==='static'){
      // Two routers, three directly connected IPv4 networks, one intentionally missing static route.
      d.links=[];b.x=860;s.x=240;s2.x=745;r.x=420;r.y=300;
      r.ports[1].ip='10.0.0.1';r.ports[1].prefix=30;
      const r2=add('router','R-2',615,300);r2.ports[0].ip='10.0.0.2';r2.ports[0].prefix=30;r2.ports[0].admin=true;r2.ports[1].ip='192.168.20.1';r2.ports[1].admin=true;
      r.routes.push({network:'192.168.20.0',prefix:24,nextHop:'10.0.0.2'});
      addLink(d,a.id,'Eth0',s.id,'Fa0/1');addLink(d,s.id,'Fa0/2',r.id,'Gi0/0');addLink(d,r.id,'Gi0/1',r2.id,'Gi0/0');addLink(d,r2.id,'Gi0/1',s2.id,'Fa0/1');addLink(d,s2.id,'Fa0/2',b.id,'Eth0');
    }
  }
  if(key==='vlan'){s.ports[0].vlan=10;s.ports[1].vlan=20;}
  d.selected=a.id;d.from=a.id;d.dest=b.ports[0].ip;return d;
}
const MISSIONS=[
{id:'first',icon:'🌱',level:'1 · Start here',title:'My first network',summary:'Two computers talk through a switch.',goal:'Send a successful ping and watch every step.',hint:'Everything is already connected. Choose Run ping, then Next step.'},
{id:'cable',icon:'🔌',level:'2 · Connect',title:'Repair a cable',summary:'Find the missing connection and plug it in.',goal:'Connect SW-1 to PC-B, then ping PC-B.',hint:'Tap Connect cable, select SW-1, then PC-B. Each link uses the first available port.'},
{id:'route',icon:'🧭',level:'3 · Route',title:'Travel to another network',summary:'Watch a router link two different subnets.',goal:'Get a successful ping through the router.',hint:'Both PCs have gateway addresses pointing to R-1. Send a ping and follow the return path.'},
{id:'gateway',icon:'🧩',level:'4 · Diagnose',title:'Wrong default gateway',summary:'A computer knows the wrong path out.',goal:'Fix PC-A’s gateway and reach PC-B.',hint:'Select PC-A. Its gateway should be 192.168.10.1, the IP of R-1 facing PC-A.'},
{id:'vlan',icon:'🧱',level:'5 · Switch',title:'VLAN separation',summary:'Both PCs are wired, but live in separate LANs.',goal:'Put the access ports in the same VLAN and ping.',hint:'Select SW-1. Change Fa0/2 from access VLAN 20 to VLAN 10, then Apply.'},
{id:'routerdown',icon:'🔧',level:'6 · Router',title:'Disabled interface',summary:'One router interface is administratively shut down.',goal:'Bring up R-1 Gi0/1 and ping successfully.',hint:'Select R-1, open the terminal, enter enable, conf t, interface gi0/1, no shutdown, end.'},
{id:'static',icon:'🗺️',level:'7 · Advanced',title:'Missing return route',summary:'Two routers need a route back.',goal:'Add R-2’s missing static route and ping.',hint:'On R-2: enable → conf t → ip route 192.168.10.0 255.255.255.0 10.0.0.1 → end.'},
{id:'blank',icon:'🛠️',level:'Free build',title:'Build anything',summary:'Add devices and cables and configure them yourself.',goal:'Create a working network from scratch.',hint:'Add a switch and second PC. Connect them, then set IP addresses on the same subnet.'}
];
let state=setup('first');
try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved&&Array.isArray(saved.devices)&&Array.isArray(saved.links)&&saved.devices.length<=25&&saved.links.length<=60&&saved.devices.every(n=>['pc','router','switch'].includes(n.type))){state={...setup('first'),...saved,trace:null,step:0,wiring:false,firstWire:'',help:false,inspector:'settings'};nextId=Math.max(100,...state.devices.map(d=>parseInt(String(d.id).match(/\d+/)?.[0]||'0',10)+1));}}catch(_){}
let screen='lab';let modal=null;let actionMode='move';
const commandHistory={};const commandHistoryCursor={};
const get=id=>state.devices.find(n=>n.id===id);
const port=(id,p)=>get(id)?.ports.find(x=>x.name===p);
const linkFor=(id,p)=>state.links.find(l=>(l.a===id&&l.ap===p)||(l.b===id&&l.bp===p));
const active=(id,p)=>!!port(id,p)?.admin&&!!linkFor(id,p)&&!!port(linkFor(id,p).a,linkFor(id,p).ap)?.admin&&!!port(linkFor(id,p).b,linkFor(id,p).bp)?.admin;
const identity=(n,p)=>n.id+':'+p.name;
const vlanKey=(id,v)=>id+':vlan:'+v;
const allowVlan=(p,v)=>String(p.allowed).split(',').map(s=>Number(s.trim())).includes(Number(v));
function graph(){const adj=new Map();const endpoints=new Map();
 const addVertex=(k,ep)=>{if(!adj.has(k))adj.set(k,[]);if(ep)endpoints.set(k,ep);};
 const wire=(x,y,xp,yp,id)=>{addVertex(x);addVertex(y);adj.get(x).push({to:y,fromPort:xp,toPort:yp,link:id});adj.get(y).push({to:x,fromPort:yp,toPort:xp,link:id});};
 for(const n of state.devices){if(n.type!=='switch')for(const p of n.ports)if(p.admin)addVertex(identity(n,p),{node:n,port:p});}
 for(const l of state.links){const a=get(l.a),b=get(l.b),pa=port(l.a,l.ap),pb=port(l.b,l.bp);if(!a||!b||!pa||!pb||!pa.admin||!pb.admin)continue;
   if(a.type!=='switch'&&b.type!=='switch'){wire(identity(a,pa),identity(b,pb),pa.name,pb.name,l.id);continue;}
   if(a.type==='switch'&&b.type==='switch'){
      if(pa.mode==='access'&&pb.mode==='access')wire(vlanKey(a.id,pa.vlan),vlanKey(b.id,pb.vlan),pa.name,pb.name,l.id);
      else if(pa.mode==='trunk'&&pb.mode==='trunk')for(let v=1;v<=4094;v++)if(allowVlan(pa,v)&&allowVlan(pb,v))wire(vlanKey(a.id,v),vlanKey(b.id,v),pa.name,pb.name,l.id);
      continue; // Mixed access / trunk switch-switch links are intentionally unsupported.
   }
   const sn=a.type==='switch'?a:b,sp=a.type==='switch'?pa:pb,on=a.type==='switch'?b:a,op=a.type==='switch'?pb:pa;
   if(sp.mode==='access')wire(vlanKey(sn.id,sp.vlan),identity(on,op),sp.name,op.name,l.id);
 }
 return {adj,endpoints};}
function explore(g,start){const seen=new Set([start]),paths=new Map([[start,{nodes:[start],links:[]}]]),queue=[start];for(let i=0;i<queue.length;i++){const node=queue[i];for(const e of g.adj.get(node)||[])if(!seen.has(e.to)){seen.add(e.to);paths.set(e.to,{nodes:[...paths.get(node).nodes,e.to],links:[...paths.get(node).links,e]});queue.push(e.to);}}return paths;}
function pathTo(g,start,end){return explore(g,start).get(end)||null;}
function nodesOn(path){return [...new Set((path?.nodes||[]).map(k=>k.split(':')[0]))];}
function learnOn(path,mac){if(!path)return;for(let i=1;i<path.nodes.length;i++){const k=path.nodes[i];if(!k.includes(':vlan:'))continue;const id=k.split(':')[0],ingress=path.links[i-1].toPort,vlan=Number(k.split(':vlan:')[1]);runtime.mac[id]??={};runtime.mac[id][mac]={port:ingress,vlan};}}
let runtime={arp:{},mac:{},lastSuccess:false};
function resetRuntime(){runtime={arp:{},mac:{},lastSuccess:false};state.trace=null;state.step=0;}
const ev=(events,type,title,detail,path=[],l2=null,ip=null,status='info')=>events.push({type,title,detail,path,status,l2,ip});
function routeFor(router,dest){const choices=[];for(const p of router.ports){if(!active(router.id,p.name)||!hostOK(p.ip,p.prefix))continue;if(onNet(dest,p.ip,p.prefix))choices.push({out:p,nextHop:dest,prefix:Number(p.prefix),route:'Connected network'});}
 for(const r of router.routes||[]){if(!validRoute(r)||!onRoute(dest,r))continue;for(const p of router.ports){if(!active(router.id,p.name)||!hostOK(p.ip,p.prefix))continue;if(onNet(r.nextHop,p.ip,p.prefix))choices.push({out:p,nextHop:r.nextHop,prefix:Number(r.prefix),route:'Static route via '+r.nextHop});}}
 choices.sort((a,b)=>b.prefix-a.prefix||(Number(b.route.startsWith('Connected'))-Number(a.route.startsWith('Connected'))));return choices[0]||null;}
function onRoute(dest,r){const a=nIP(dest),b=nIP(r.network);return a!==null&&b!==null&&((a&maskNum(Number(r.prefix)))>>>0)===((b&maskNum(Number(r.prefix)))>>>0);}
function validRoute(r){return r&&nIP(r.network)!==null&&Number.isInteger(Number(r.prefix))&&Number(r.prefix)>=0&&Number(r.prefix)<=32&&nIP(r.nextHop)!==null&&((nIP(r.network)&maskNum(Number(r.prefix)))>>>0)===nIP(r.network);}
function findIP(ip){return state.devices.flatMap(n=>n.type==='switch'?[]:n.ports.filter(p=>p.ip===ip).map(p=>({node:n,port:p}))).filter(e=>hostOK(e.port.ip,e.port.prefix));}
function ping(sourceId,destIp){const events=[],g=graph(),src=get(sourceId);const failure=(detail,path=[])=>{ev(events,'error','The packet stopped',detail,path,null,null,'bad');return {success:false,events,reason:detail};};
 if(!src||src.type==='switch')return failure('Choose a PC or router as the source. Layer 2 switches have no management IP in this simplified model.');
 if(nIP(destIp)===null)return failure('That destination is not a valid IPv4 address. Try 192.168.10.20.');
 const srcInterfaces=src.ports.filter(p=>active(src.id,p.name)&&hostOK(p.ip,p.prefix));if(!srcInterfaces.length)return failure(src.label+' does not have an active, correctly addressed interface. Check cables, power state, and IPv4 settings.');
 let chosen=src.type==='pc'?srcInterfaces[0]:routeFor(src,destIp)?.out;
 if(!chosen)return failure(src.label+' has no route to '+destIp+'. Set a connected interface or an appropriate static route.');
 const originIP=chosen.ip;
 const attempt=(origin,dst,which)=>{
 let current=origin,visited=new Set();let carried=0;
 ev(events,'start',which==='request'?'Echo request begins':'Echo reply begins',origin.node.label+' prepares an ICMP '+(which==='request'?'Echo Request':'Echo Reply')+' from '+origin.ip+' to '+dst+'. The IP destination stays the same while Ethernet addresses can change at each hop.',[origin.node.id],null,{src:origin.ip,dst});
 for(let hops=0;hops<16;hops++){
  const n=current.node;let out,nextIP;if(n.type==='pc'){
   const p=n.ports[0];if(!active(n.id,p.name)||!hostOK(p.ip,p.prefix))return {error:n.label+' has a disconnected or invalid Ethernet interface.',path:[n.id]};
   out=p;const same=onNet(dst,p.ip,p.prefix);nextIP=same?dst:p.gateway;
   if(!same&&nIP(nextIP)===null)return {error:n.label+' has no valid default gateway; it cannot reach '+dst+'.',path:[n.id]};
   if(!onNet(nextIP,p.ip,p.prefix))return {error:n.label+' thinks gateway '+nextIP+' is on another subnet. Configure a gateway on its local network.',path:[n.id]};
  }else if(n.type==='router'){
   if(n.ports.some(p=>p.ip===dst&&active(n.id,p.name))){ev(events,'receive','Router destination reached',n.label+' owns the destination IPv4 address '+dst+'.',[n.id]);return {at:{node:n,port:n.ports.find(p=>p.ip===dst)},ip:dst};}
   const choice=routeFor(n,dst);if(!choice)return {error:n.label+' has no connected or static route to '+dst+'. Check show ip route.',path:[n.id]};
   out=choice.out;nextIP=choice.nextHop;
   ev(events,'route','Route lookup on '+n.label,n.label+' chooses '+out.name+' ('+choice.route+') for '+dst+'. A router forwards using the destination IPv4 address, not the end host’s MAC.',[n.id],null,{src:origin.ip,dst});
  }else return {error:'A Layer 2 switch cannot act as an IP router.',path:[n.id]};
  const signature=n.id+':'+out.name+'>'+nextIP+':'+which;if(visited.has(signature))return {error:'Routing loop detected. The same router/next-hop decision repeated.',path:[n.id]};visited.add(signature);
  const start=identity(n,out),paths=explore(g,start),peers=[];
  for(const [v,tracePath] of paths){const ep=g.endpoints.get(v);if(ep&&v!==start&&ep.port.ip===nextIP&&active(ep.node.id,ep.port.name))peers.push({ep,path:tracePath});}
  if(!peers.length){ev(events,'arp','ARP request: who has '+nextIP+'?',n.label+' broadcasts on '+out.name+' for the next-hop IP '+nextIP+'. No connected device on this Layer 2 network answers. Check VLANs, cabling, shutdown state, gateway or next-hop address.',[n.id],null,{src:origin.ip,dst},'bad');return {error:'ARP for '+nextIP+' received no reply from '+n.label+'. The devices are not in the same reachable Ethernet/VLAN segment, or the address is wrong.',path:[n.id]};}
  if(peers.length>1)return {error:'Duplicate IPv4 address '+nextIP+' is configured on this Layer 2 segment.',path:[n.id]};
  const {ep,path}=peers[0];const cache=runtime.arp[identity(n,out)]||{};
  if(cache[nextIP]===ep.port.mac){ev(events,'cache','ARP cache hit',n.label+' already learned that '+nextIP+' uses MAC '+ep.port.mac+'. No ARP request is necessary for this hop.',nodesOn(path),null,{src:origin.ip,dst});}
  else {
   ev(events,'arp','Broadcast: Who has '+nextIP+'?',n.label+' sends ARP on its local VLAN or Ethernet segment. Switches flood the request within that Layer 2 segment, and learn the sender’s MAC on their incoming ports.',nodesOn(path),{src:out.mac,dst:'FF:FF:FF:FF:FF:FF'},{src:origin.ip,dst});
   learnOn(path,out.mac);const reverse={nodes:path.nodes.slice().reverse(),links:path.links.slice().reverse().map(l=>({toPort:l.fromPort,fromPort:l.toPort}))};learnOn(reverse,ep.port.mac);
   runtime.arp[identity(n,out)]??={};runtime.arp[identity(n,out)][nextIP]=ep.port.mac;
   ev(events,'arp','ARP reply: '+nextIP+' is '+ep.port.mac,ep.node.label+' responds with its MAC address. '+n.label+' saves the answer in its ARP cache.',nodesOn(path).slice().reverse(),{src:ep.port.mac,dst:out.mac},{src:origin.ip,dst});
  }
  ev(events,'frame','Ethernet frame carries the IPv4 packet',n.label+' sends toward '+ep.node.label+' ('+ep.port.mac+'). The Ethernet MAC addresses identify THIS hop. The IPv4 source '+origin.ip+' and destination '+dst+' still identify the original endpoints.',nodesOn(path),{src:out.mac,dst:ep.port.mac},{src:origin.ip,dst});
  carried++;
  if(ep.port.ip===dst){ev(events,'receive',ep.node.label+' received '+(which==='request'?'the request':'the reply'),ep.node.label+' accepts the packet because '+dst+' matches its IPv4 address.',[ep.node.id],{src:out.mac,dst:ep.port.mac},{src:origin.ip,dst},'good');return {at:ep,ip:dst};}
  if(ep.node.type!=='router')return {error:ep.node.label+' received this frame but is not an IPv4 router and does not own '+dst+'.',path:[ep.node.id]};
  if(carried>=16)return {error:'The hop limit was exceeded (simplified TTL check).',path:[ep.node.id]};
  ev(events,'router',ep.node.label+' will forward the packet',ep.node.label+' removes the incoming Ethernet header, decreases IPv4 TTL, checks its routing table, and builds a NEW Ethernet header for the next hop.',[ep.node.id],null,{src:origin.ip,dst});
  current={node:ep.node,port:ep.port};
 }
 return {error:'The simulated hop limit was reached.',path:[current.node.id]};
 };
 const first=attempt({node:src,port:chosen,ip:originIP},destIp,'request');if(first.error)return failure(first.error,first.path);
 const reply=attempt({node:first.at.node,port:first.at.port,ip:destIp},originIP,'reply');if(reply.error)return failure('The request arrived, but the return path failed: '+reply.error,reply.path);
 ev(events,'success','Ping successful!','The Echo Reply returned to '+src.label+'. Both the forward path and the return path are working. On later pings, cached ARP entries can reduce broadcasts.',[src.id,first.at.node.id],null,{src:originIP,dst:destIp},'good');
 return {success:true,events,reason:'Echo Reply received from '+destIp};
}
function runPing(from,dest){const res=ping(from,dest);state.trace=res;state.step=0;startRoute(res);runtime.lastSuccess=!!res.success;if(res.success)state.completed[state.mission]=true;save();return res;}
function save(){try{const snapshot={...state,trace:null,wiring:false,firstWire:'',consoleLines:Object.fromEntries(Object.entries(state.consoleLines||{}).map(([k,v])=>[k,String(v).slice(-8500)])),savedAt:new Date().toISOString()};localStorage.setItem(STORE,JSON.stringify(snapshot));}catch(_){}}
const selected=()=>get(state.selected);
const chosenConsole=()=>{const n=selected();if(!n)return null;state.consoleMode[n.id]??={mode:'user',iface:'',vlan:1};state.consoleLines[n.id]??='';return state.consoleMode[n.id];};
function prompt(n){const m=chosenConsole();if(n.type==='pc')return n.label+'>';return n.label+(m.mode==='user'?'>':m.mode==='priv'?'#':m.mode==='config'?'(config)#':m.mode==='vlan'?'(config-vlan)#':m.mode==='line'?'(config-line)#':'(config-if)#');}
function execCmd(n,line){const raw=String(line).trim(),cmd=raw.replace(/\s+/g,' '),low=cmd.toLowerCase(),m=chosenConsole();if(!raw)return '';if(low==='?'||low==='help')return n.type==='pc'?'Try: ipconfig /all | ping 192.168.10.20 | arp -a':n.type==='switch'?'Try: enable | conf t | interface fa0/2 | switchport mode access | switchport access vlan 10 | show vlan brief | show mac address-table | show interfaces status | show running-config': 'Try: enable | conf t | interface gi0/0 | ip address 192.168.10.1 255.255.255.0 | no shutdown | ip route 192.168.20.0 255.255.255.0 10.0.0.2 | show ip route | show ip interface brief | show arp';
 if(low==='clear'||low==='cls'){state.consoleLines[n.id]='';return '(cleared console)';}
 if(n.type==='pc'){
   if(low==='ipconfig'||low==='ipconfig /all')return 'Ethernet adapter Eth0:\n   IPv4 Address: '+(n.ports[0].ip||'Unassigned')+'\n   Subnet Mask: '+(range(n.ports[0].ip,n.ports[0].prefix)?.mask||'Unassigned')+'\n   Default Gateway: '+(n.ports[0].gateway||'Not configured')+'\n   Physical Address: '+n.ports[0].mac;
   if(low==='arp -a')return Object.entries(runtime.arp[identity(n,n.ports[0])]||{}).map(([ip,mac])=>ip.padEnd(18)+mac).join('\n')||'(ARP cache empty)';
   if(low.startsWith('ping ')){const dest=cmd.slice(5).trim(),result=runPing(n.id,dest);return result.success?'Pinging '+dest+' with 32 bytes of data:\nReply from '+dest+': bytes=32 (simulated round-trip)\n\nPackets: Sent = 1, Received = 1, Lost = 0':'Pinging '+dest+' with 32 bytes of data:\nRequest failed: '+result.reason+'\n\nPackets: Sent = 1, Received = 0, Lost = 1';}
   if(/^(enable|conf(?:igure)?(?: terminal)?|interface|show |switchport|ip route|no shutdown|shutdown|vlan )/i.test(raw))return 'This is a PC, not a Cisco router or switch. Select a router or switch on the diagram, then open its Terminal tab. On this PC, try ipconfig /all, ping ADDRESS, or arp -a.';
   return 'The PC received your command, but this learning terminal does not implement it yet. Type ? to see the supported PC commands.';
 }
 if(low==='exit'){if(m.mode==='iface'||m.mode==='vlan'){m.mode='config';m.iface='';}else if(m.mode==='config')m.mode='priv';else if(m.mode==='priv')m.mode='user';return '';}
 if(low==='end'&&['config','iface','vlan'].includes(m.mode)){m.mode='priv';m.iface='';return '';}
 if(low==='enable'&&m.mode==='user'){m.mode='priv';return '';}
 if(low==='disable'&&m.mode==='priv'){m.mode='user';return '';}
 if(['configure terminal','conf t'].includes(low)&&m.mode==='priv'){m.mode='config';return 'Enter configuration commands, one per line. End with Ctrl+Z.';}
 if(low.startsWith('hostname ')&&m.mode==='config'){const v=cmd.slice(9);if(!/^[a-z][a-z0-9-]{0,20}$/i.test(v))return '% Invalid hostname.';n.label=v;return '';}
 if(low.startsWith('interface ')&&m.mode==='config'){const v=low.slice(10).replace(/^(gigabitethernet|gig|gi)/,'gi').replace(/^(fastethernet|fast|fa)/,'fa');const p=n.ports.find(p=>p.name.toLowerCase()===v);if(!p)return '% Unknown interface. Try '+n.ports[0].name+'.';m.mode='iface';m.iface=p.name;return '';}
 if(n.type==='switch'&&low.startsWith('vlan ')&&m.mode==='config'){const v=Number(cmd.slice(5));if(!Number.isInteger(v)||v<1||v>4094)return '% VLAN number must be between 1 and 4094.';n.vlans??=[1];if(!n.vlans.includes(v))n.vlans.push(v);m.mode='vlan';m.vlan=v;return '';}
 if(n.type==='switch'&&m.mode==='iface'&&low.startsWith('switchport ')){
   const p=n.ports.find(p=>p.name===m.iface);if(!p)return '% Select interface first.';
   if(low==='switchport mode access'){p.mode='access';resetRuntime();return '';}
   if(low==='switchport mode trunk'){p.mode='trunk';resetRuntime();return '';}
   const v=low.match(/^switchport access vlan (\d+)$/);if(v){if(p.mode!=='access')return '% Set switchport mode access first.';if(+v[1]<1||+v[1]>4094)return '% Invalid VLAN.';p.vlan=+v[1];if(!n.vlans.includes(p.vlan))n.vlans.push(p.vlan);resetRuntime();return '';}
   const allowed=low.match(/^switchport trunk allowed vlan ([\d,]+)$/);if(allowed){const arr=allowed[1].split(',').map(Number);if(!arr.length||arr.some(v=>!Number.isInteger(v)||v<1||v>4094))return '% Allowed VLAN list is invalid.';p.allowed=[...new Set(arr)].join(',');resetRuntime();return '';}
 }
 if(n.type==='router'&&low.startsWith('ip address ')&&m.mode==='iface'){
   const parts=cmd.split(' ');if(parts.length!==4)return '% Use: ip address A.B.C.D 255.255.255.0';const pre=maskToPrefix(parts[3]);if(pre===null||pre<1||pre>30||!hostOK(parts[2],pre))return '% Invalid host IPv4 address or contiguous mask (/1–/30 supported).';const p=n.ports.find(p=>p.name===m.iface);p.ip=parts[2];p.prefix=pre;resetRuntime();return '';
 }
 if(m.mode==='iface'&&['shutdown','no shutdown'].includes(low)){const p=n.ports.find(p=>p.name===m.iface);if(!p)return '% Choose an interface first.';p.admin=low==='no shutdown';resetRuntime();return 'Interface '+p.name+' is now '+(p.admin?'administratively enabled':'administratively shut down')+'.';}
 if(n.type==='router'&&m.mode==='config'&&(low.startsWith('ip route ')||low.startsWith('no ip route '))){const no=low.startsWith('no '),args=cmd.slice(no?12:9).split(' ');if(args.length!==3)return '% Use: ip route NETWORK MASK NEXT_HOP';const [network,mask,nextHop]=args,pre=maskToPrefix(mask);if(pre===null||pre>32||nIP(nextHop)===null||nIP(network)===null||((nIP(network)&maskNum(pre))>>>0)!==nIP(network))return '% Invalid route. Use an exact network address, contiguous mask, and valid next hop.';
   n.routes=n.routes.filter(r=>!(r.network===network&&Number(r.prefix)===pre&&r.nextHop===nextHop));if(!no)n.routes.push({network,prefix:pre,nextHop});resetRuntime();return '';
 }
 if(['user','priv'].includes(m.mode)){
   if(low==='show ip interface brief'&&n.type==='router')return 'Interface          IP-Address       Status                  Protocol\n'+n.ports.map(p=>p.name.padEnd(19)+(p.ip||'unassigned').padEnd(17)+(p.admin?(active(n.id,p.name)?'up':'down'):'administratively down').padEnd(24)+(active(n.id,p.name)?'up':'down')).join('\n');
   if(low==='show ip route'&&n.type==='router'){const connected=n.ports.filter(p=>active(n.id,p.name)&&hostOK(p.ip,p.prefix)).map(p=>`C    ${range(p.ip,p.prefix).network}/${p.prefix} is directly connected, ${p.name}\nL    ${p.ip}/32 is directly connected, ${p.name}`);const statics=n.routes.map(r=>`S    ${r.network}/${r.prefix} [1/0] via ${r.nextHop}${routeFor(n,r.network)?.route.startsWith('Static')?'':' (next-hop reachability depends on active interfaces)'}`);return 'Codes: C - connected, L - local, S - static\n'+[...connected,...statics].join('\n')+'\n';}
   if(low==='show arp'||low==='show ip arp')return Object.entries(runtime.arp).filter(([k])=>k.startsWith(n.id+':')).flatMap(([k,v])=>Object.entries(v).map(([ip,mac])=>ip.padEnd(18)+mac+'  '+k.split(':')[1])).join('\n')||'(ARP table empty)';
   if(low==='show vlan brief'&&n.type==='switch')return 'VLAN   Name             Status   Ports\n'+[...new Set([1,...n.vlans,...n.ports.map(p=>p.vlan)])].sort((a,b)=>a-b).map(v=>String(v).padEnd(7)+('VLAN'+v).padEnd(17)+'active   '+n.ports.filter(p=>p.mode==='access'&&p.vlan===v).map(p=>p.name).join(', ')).join('\n');
   if(low==='show interfaces status'&&n.type==='switch')return 'Port     Status      VLAN    Mode\n'+n.ports.map(p=>p.name.padEnd(9)+(active(n.id,p.name)?'connected':'notconnect').padEnd(12)+String(p.vlan).padEnd(8)+p.mode).join('\n');
   if(low==='show interfaces trunk'&&n.type==='switch')return 'Port     Mode    Allowed VLANs\n'+(n.ports.filter(p=>p.mode==='trunk').map(p=>p.name.padEnd(9)+'trunk   '+p.allowed).join('\n')||'(no trunks configured)');
   if((low==='show mac address-table'||low==='show mac-address-table')&&n.type==='switch')return 'VLAN    MAC Address           Type      Port\n'+(Object.entries(runtime.mac[n.id]||{}).map(([mac,e])=>String(e.vlan).padEnd(8)+mac.padEnd(22)+'DYNAMIC   '+e.port).join('\n')||'(table empty; send traffic to learn MACs)');
   if(low==='show running-config'||low==='show run')return 'Building configuration...\n!\nhostname '+n.label+'\n!\n'+n.ports.map(p=>'interface '+p.name+'\n'+(n.type==='router'&&p.ip?' ip address '+p.ip+' '+range(p.ip,p.prefix)?.mask+'\n':'')+(n.type==='switch'?' switchport mode '+p.mode+'\n'+(p.mode==='access'?' switchport access vlan '+p.vlan+'\n':' switchport trunk allowed vlan '+p.allowed+'\n'):'')+' '+(p.admin?'no shutdown':'shutdown')+'\n!').join('\n')+(n.type==='router'?n.routes.map(r=>'ip route '+r.network+' '+strIP(maskNum(Number(r.prefix)))+' '+r.nextHop).join('\n'):'')+'\nend';
   if(low.startsWith('ping ')){if(n.type==='switch')return 'Management SVI is not modeled. Ping from a PC or router instead.';const ip=cmd.slice(5).trim(),result=runPing(n.id,ip);return result.success?'Success rate is 100 percent (1/1) to '+ip:'Success rate is 0 percent (0/1): '+result.reason;}
   if(['copy running-config startup-config','write memory','wr mem'].includes(low)&&m.mode==='priv'){save();return 'Configuration saved to this browser’s local lab state. (Not real IOS NVRAM.)';}
 }
 return '% Command not available in this '+(m.mode==='user'?'basic':m.mode==='priv'?'privileged':m.mode==='config'?'global configuration':m.mode==='iface'?'interface configuration':'VLAN configuration')+' mode, or not implemented in this practice simulator. Type ? to see the supported commands. Tip: Cisco configuration changes generally require enable → configure terminal → interface NAME.';
}
/* ---- v0.8 IOS realism layer: abbreviations, ? help, Tab, do, IOS errors, passwords, Packet Tracer-style output ----
 * Templates: words; '*' = one argument; '**' = rest of line. Prefix R: router only, S: switch only, U: real IOS command
 * this lab does not model yet (it answers honestly and points to the Packet Tracer lab book instead of "invalid input"). */
const IOS_EXEC=['ping *','traceroute *','show ip interface brief','show ip route','show ip arp','show arp','show running-config','show history','R:show interfaces **','S:show vlan brief','S:show interfaces status','S:show interfaces trunk','S:show mac address-table','U:show cdp **','U:show ip ospf **','U:show ip protocols','U:show ip nat **','U:show access-lists **','U:show spanning-tree **','U:show etherchannel **','U:show standby **','U:show port-security **','U:show ip dhcp **','U:show version','U:show startup-config','U:show clock','U:show ipv6 **','U:show ip ssh','U:show logging'];
const IOS_T={
 user:['enable','exit','logout',...IOS_EXEC],
 priv:['enable','disable','exit','configure terminal','configure','copy running-config startup-config','write memory','write','U:reload','U:clock **','U:debug **','U:undebug **','U:erase **','U:copy **',...IOS_EXEC],
 config:['hostname *','interface **','S:vlan *','R:ip route * * *','R:no ip route * * *','enable secret **','enable password **','no enable secret','banner motd **','service password-encryption','no service password-encryption','no ip domain-lookup','ip domain-lookup','ip domain-name *','S:ip default-gateway *','username **','line console 0','line vty * *','cdp run','no cdp run','lldp run','no lldp run','exit','end','do **',
   'U:router **','U:ip dhcp **','U:ip nat **','U:access-list **','U:ip access-list **','U:spanning-tree **','U:crypto **','U:ip ssh **','U:ipv6 **','U:ip routing','U:ntp **','U:logging **','U:snmp-server **','U:aaa **','U:no router **','U:no access-list **','U:ip name-server **','U:clock **'],
 iface:['R:ip address * *','R:no ip address','shutdown','no shutdown','description **','no description','speed *','duplex *','S:switchport mode access','S:switchport mode trunk','S:switchport access vlan *','S:switchport trunk allowed vlan *','S:switchport trunk allowed vlan add *','exit','end','do **','interface **',
   'U:encapsulation **','U:ip helper-address **','U:ip nat **','U:ip ospf **','U:ip access-group **','U:standby **','U:vrrp **','U:channel-group **','U:spanning-tree **','U:switchport port-security **','U:switchport voice **','U:switchport trunk native **','U:switchport trunk encapsulation **','U:switchport nonegotiate','U:ipv6 **','U:no switchport','U:cdp enable','U:no cdp enable','U:storm-control **','U:ip dhcp **','U:ip arp **','U:power inline **'],
 vlan:['name *','exit','end','do **','S:vlan *'],
 line:['password *','login','login local','no login','transport input *','exec-timeout * *','logging synchronous','exit','end','do **','line console 0','line vty * *']};
const IOS_TIP={
 invalid:'Lab tip: type ? to see what you can type here. Use Tab to finish a word.',
 amb:'Lab tip: type a few more letters so only one command matches.',
 incomplete:'Lab tip: the command needs more words. Type the command and then ? to see what comes next.'};
function iosTemplates(n,mode){return (IOS_T[mode]||[]).map(s=>{let flag='';const m=s.match(/^([RSU]):/);if(m){flag=m[1];s=s.slice(2);}return {flag,t:s.split(' ')};}).filter(x=>!(x.flag==='R'&&n.type!=='router')&&!(x.flag==='S'&&n.type!=='switch'));}
function iosParse(n,mode,words){
  let cands=iosTemplates(n,mode);const out=[];
  for(let i=0;i<words.length;i++){
    const w=words[i].toLowerCase();
    const alive=cands.filter(c=>c.t[i]!==undefined);
    const kw=[...new Set(alive.map(c=>c.t[i]).filter(x=>x!=='*'&&x!=='**'))];
    const exact=kw.filter(k=>k===w),pref=kw.filter(k=>k.startsWith(w));
    if(i===0&&w.length<2&&!exact.length&&pref.length)return {err:'amb',at:i};
    const pick=exact[0]||(pref.length===1?pref[0]:null);
    if(!pick&&pref.length>1)return {err:'amb',at:i};
    if(pick){cands=alive.filter(c=>c.t[i]===pick);out.push(pick);continue;}
    const rest=alive.filter(c=>c.t[i]==='**');
    if(rest.length){out.push(words.slice(i).join(' '));const u=rest.find(c=>c.flag!=='U')||rest[0];return {ok:true,line:out.join(' '),flag:u.flag,t:u.t};}
    const one=alive.filter(c=>c.t[i]==='*');
    if(one.length){cands=one;out.push(words[i]);continue;}
    return {err:'invalid',at:i};
  }
  const full=cands.filter(c=>c.t.length===out.length);
  if(!full.length)return {err:'incomplete',next:[...new Set(cands.map(c=>c.t[out.length]).filter(Boolean))]};
  const f=full.find(c=>c.flag!=='U')||full[0];return {ok:true,line:out.join(' '),flag:f.flag,t:f.t};
}
function iosHelp(n,mode,raw){
  const body=raw.replace(/\?$/,''),endsSpace=/\s$/.test(body)||!body.trim(),words=body.trim()?body.trim().split(/\s+/):[];
  const known=endsSpace?words:words.slice(0,-1),partial=endsSpace?'':words.at(-1).toLowerCase();
  let cands=iosTemplates(n,mode);
  for(let i=0;i<known.length;i++){const w=known[i].toLowerCase();const alive=cands.filter(c=>c.t[i]!==undefined);
    const pref=alive.filter(c=>c.t[i]===w||(c.t[i]!=='*'&&c.t[i]!=='**'&&c.t[i].startsWith(w)));
    cands=pref.length?pref:alive.filter(c=>c.t[i]==='*'||c.t[i]==='**');}
  const i=known.length,opts=[...new Set(cands.map(c=>c.t[i]===undefined?'<cr>':c.t[i]==='*'||c.t[i]==='**'?'WORD':c.t[i]))].filter(o=>!partial||o.startsWith(partial)).sort();
  return opts.length?opts.map(o=>'  '+o).join('\n'):'% Unrecognized command';
}
function iosComplete(n,raw){const m=chosenConsole();if(!m||n.type==='pc')return raw;const words=raw.split(/\s+/);const last=words.pop();if(!last)return raw;
  let cands=iosTemplates(n,m.mode);words.forEach((w,i)=>{const lw=w.toLowerCase();const alive=cands.filter(c=>c.t[i]!==undefined);const p=alive.filter(c=>c.t[i]===lw||(c.t[i].length>1&&c.t[i]!=='**'&&c.t[i].startsWith(lw)));cands=p.length?p:alive.filter(c=>c.t[i]==='*'||c.t[i]==='**');});
  const kw=[...new Set(cands.map(c=>c.t[words.length]).filter(k=>k&&k!=='*'&&k!=='**'&&k.startsWith(last.toLowerCase())))];
  return kw.length===1?[...words,kw[0]].join(' ')+' ':raw;}
const ifFull=s=>String(s).replace(/^Gi/,'GigabitEthernet').replace(/^Fa/,'FastEthernet');
function normIf(arg){const a=String(arg).toLowerCase().replace(/\s+/g,'');return a.replace(/^g(?:i(?:g(?:a(?:b(?:i(?:t(?:e(?:t(?:h(?:e(?:r(?:n(?:e(?:t)?)?)?)?)?)?)?)?)?)?)?)?)?)?/,'gi').replace(/^f(?:a(?:s(?:t(?:e(?:t(?:h(?:e(?:r(?:n(?:e(?:t)?)?)?)?)?)?)?)?)?)?)?/,'fa');}
function fakeHash(s){let h=5381;for(const c of String(s))h=((h<<5)+h+c.charCodeAt(0))>>>0;return '$1$'+h.toString(36).slice(0,4)+'$'+(h*2654435761>>>0).toString(36)+h.toString(36);}
function extraOf(n){n.extra??={global:{},iface:{},line:{}};return n.extra;}
function iosRunningConfig(n,base){
  const x=extraOf(n),enc=!!x.global['service password-encryption'];
  const g=Object.values(x.global).map(v=>typeof v==='function'?v():v).filter(Boolean);
  let lines=base.split('\n').map(l=>l.replace(/^interface (Gi|Fa)/,(q,a)=>'interface '+ifFull(a)));const hi=lines.findIndex(l=>l.startsWith('hostname '));
  if(hi>=0)lines.splice(hi+1,0,...g.filter(l=>!/^(banner|username)/.test(l)),...(g.some(l=>/^username/.test(l))?['!']:[]),...g.filter(l=>/^username/.test(l)));
  Object.entries(x.iface).forEach(([name,ls])=>{const k=lines.findIndex(l=>l==='interface '+name||l==='interface '+ifFull(name));if(k>=0)lines.splice(k+1,0,...Object.values(ls).map(v=>' '+v));});
  const banner=g.find(l=>/^banner/.test(l));
  const lineBlocks=Object.entries(x.line).map(([nm,ls])=>'line '+nm+'\n'+Object.values(ls).map(v=>' '+(enc?String(v).replace(/^password (?!7 )(.*)$/,(m,p)=>'password 7 '+fakeHash(p).slice(3,15).toUpperCase()):v)).join('\n'));
  let end=lines.lastIndexOf('end');if(end<0){lines.push('end');end=lines.length-1;}
  lines.splice(end,0,...(banner?[banner,'!']:[]),...lineBlocks.flatMap(b=>[b,'!']));
  return lines.join('\n');
}
function pingIOS(n,dest,res){
  const first=!(runtime.pinged??={})[n.id+'>'+dest];if(res.success)runtime.pinged[n.id+'>'+dest]=true;
  const s=res.success?(first?'.!!!!':'!!!!!'):'.....',ok=(s.match(/!/g)||[]).length;
  return 'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to '+dest+', timeout is 2 seconds:\n'+s+'\nSuccess rate is '+ok*20+' percent ('+ok+'/5)'+(ok?', round-trip min/avg/max = 1/1/2 ms':'')+(res.success?'':(state.ptMode?'':'\nLab tip: '+res.reason));
}
function pingPC(n,dest,res){
  const first=!(runtime.pinged??={})[n.id+'>'+dest];if(res.success)runtime.pinged[n.id+'>'+dest]=true;
  const replies=res.success?(first?['Request timed out.','r','r','r']:['r','r','r','r']):['Request timed out.','Request timed out.','Request timed out.','Request timed out.'];
  const got=replies.filter(r=>r==='r').length,lost=4-got;
  return 'Pinging '+dest+' with 32 bytes of data:\n\n'+replies.map(r=>r==='r'?'Reply from '+dest+': bytes=32 time<1ms TTL=128':r).join('\n')+'\n\nPing statistics for '+dest+':\n    Packets: Sent = 4, Received = '+got+', Lost = '+lost+' ('+lost*25+'% loss),'+(got?'\nApproximate round trip times in milli-seconds:\n    Minimum = 0ms, Maximum = 0ms, Average = 0ms':'')+(res.success||state.ptMode?'':'\n\nLab tip: '+res.reason);
}
function routeTableIOS(n){
  const act=n.ports.filter(p=>active(n.id,p.name)&&hostOK(p.ip,p.prefix));
  const def=n.routes.find(r=>r.network==='0.0.0.0'&&Number(r.prefix)===0);
  const rows=[];act.forEach(p=>{const r=range(p.ip,p.prefix);rows.push({k:r.nw,line:'C        '+r.network+'/'+p.prefix+' is directly connected, '+ifFull(p.name)});rows.push({k:r.nw+0.5,line:'L        '+p.ip+'/32 is directly connected, '+ifFull(p.name)});});
  n.routes.filter(r=>r!==def).forEach(r=>rows.push({k:nIP(r.network),line:'S        '+r.network+'/'+r.prefix+' [1/0] via '+r.nextHop}));
  rows.sort((a,b)=>a.k-b.k);
  return 'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP\n       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area\n       * - candidate default, U - per-user static route\n\n'+(def?'Gateway of last resort is '+def.nextHop+' to network 0.0.0.0\n\n':'Gateway of last resort is not set\n\n')+rows.map(r=>r.line).join('\n')+(def?'\nS*    0.0.0.0/0 [1/0] via '+def.nextHop:'')+'\n';
}
function iosCmd(n,raw){
  const m=chosenConsole();
  if(n.type==='pc'){const low=raw.trim().toLowerCase();if(low.startsWith('ping ')){const d=raw.trim().slice(5).trim();return pingPC(n,d,runPing(n.id,d));}return execCmd(n,raw);}
  if(m.await==='enable'){const x=extraOf(n);if(raw.trim()===x.secret){m.await='';m.tries=0;m.mode='priv';return '';}m.tries=(m.tries||0)+1;if(m.tries>=3){m.await='';m.tries=0;return '% Bad secrets';}return 'Password: ';}
  const v=raw.trim();if(!v)return '';
  if(v.endsWith('?'))return iosHelp(n,m.mode,v);
  const words=v.split(/\s+/);
  // "do" runs an EXEC command from any config mode
  if(['config','iface','vlan','line'].includes(m.mode)&&/^do$/i.test(words[0])&&words.length>1){const keep={...m};m.mode='priv';const out=iosCmd(n,words.slice(1).join(' '));Object.assign(m,keep);return out;}
  const p=iosParse(n,m.mode,words);
  if(p.err){
    if(p.err==='invalid'&&p.at===0&&['user','priv'].includes(m.mode)){const x=extraOf(n);return 'Translating "'+words[0]+'"'+(x.global['no ip domain-lookup']?'':'...domain server (255.255.255.255)')+'\n% Unknown command or computer name, or unable to find computer address'+(state.ptMode?'':'\nLab tip: IOS thought this was a computer name. Check the spelling. In config mode, "no ip domain-lookup" stops the long wait.');}
    let msg;if(p.err==='invalid'){const off=v.split(/\s+/).slice(0,p.at).join(' ').length+(p.at?1:0);msg=' '.repeat(prompt(n).length+off)+'^\n% Invalid input detected at \'^\' marker.';}
    else if(p.err==='amb')msg='% Ambiguous command:  "'+v+'"';else msg='% Incomplete command.';
    return msg+(state.ptMode?'':'\n'+IOS_TIP[p.err]);
  }
  const line=p.line,low=line.toLowerCase(),x=extraOf(n);
  if(p.flag==='U')return state.ptMode?'% This practice lab does not model "'+line.split(' ').slice(0,2).join(' ')+'". Use Packet Tracer for this command.':'This is a real IOS command, but this practice lab does not model it yet.\nPractice it in Packet Tracer: open the "Packet Tracer lab book" tab above.';
  if(low==='enable'&&m.mode==='user'){if(x.secret){m.await='enable';return 'Password: ';}m.mode='priv';return '';}
  if(low==='enable')return '';
  if(low==='configure'){m.mode='config';return 'Configuring from terminal, memory, or network [terminal]? \nEnter configuration commands, one per line.  End with CNTL/Z.';}
  if(low==='configure terminal'){m.mode='config';return 'Enter configuration commands, one per line.  End with CNTL/Z.';}
  if(low==='show ip interface brief')return 'Interface              IP-Address      OK? Method Status                Protocol\n'+n.ports.map(q=>{const up=active(n.id,q.name),st=!q.admin?'administratively down':up?'up':'down';return ifFull(q.name).padEnd(23)+(n.type==='router'&&q.ip?q.ip:'unassigned').padEnd(16)+'YES '+(n.type==='router'&&q.ip?'manual':'unset ').padEnd(7)+st.padEnd(22)+(q.admin&&up?'up':'down');}).join('\n');
  if(low==='logout'){m.mode='user';return '';}
  if(low==='write')return execCmd(n,'write memory').replace(/^.*$/,'Building configuration...\n[OK]');
  if(low==='write memory'||low==='copy running-config startup-config'){execCmd(n,'write memory');return (low.startsWith('copy')?'Destination filename [startup-config]? \n':'')+'Building configuration...\n[OK]';}
  if(low==='show history')return (commandHistory[n.id]||[]).slice(-10).map(h=>'  '+h).join('\n');
  if(low==='show ip route'&&n.type==='router')return routeTableIOS(n);
  if(low.startsWith('ping ')){const d=line.slice(5).trim();if(n.type==='switch')return state.ptMode?'% Unrecognized host or address, or protocol not running.':'This practice switch has no management IP (SVI). Ping from a PC or router instead.';return pingIOS(n,d,runPing(n.id,d));}
  if(low.startsWith('traceroute '))return state.ptMode?'% Traceroute is not modeled in this practice lab.':'Traceroute is not modeled here yet. Use ping, then try traceroute in Packet Tracer.';
  if(low==='show running-config')return iosRunningConfig(n,execCmd(n,'show running-config'));
  if(m.mode==='config'){
    if(low.startsWith('interface ')){const r=execCmd(n,'interface '+normIf(line.slice(10)));return r.startsWith('%')?'%Invalid interface type and number'+(state.ptMode?'':'\nLab tip: this device has '+n.ports.map(q=>q.name).join(', ')):r;}
    if(low.startsWith('enable secret ')){x.secret=line.slice(14).trim();x.global['enable secret']='enable secret 5 '+fakeHash(x.secret);return '';}
    if(low==='no enable secret'){delete x.secret;delete x.global['enable secret'];return '';}
    if(low.startsWith('enable password ')){x.global['enable password']='enable password '+line.slice(16).trim();if(!x.secret)x.secret=line.slice(16).trim();return '';}
    if(low.startsWith('banner motd ')){const b=line.slice(12).trim();x.global.banner='banner motd '+b;return '';}
    if(low==='service password-encryption'){x.global['service password-encryption']='service password-encryption';return '';}
    if(low==='no service password-encryption'){delete x.global['service password-encryption'];return '';}
    if(low==='no ip domain-lookup'){x.global['no ip domain-lookup']='no ip domain-lookup';return '';}
    if(low==='ip domain-lookup'){delete x.global['no ip domain-lookup'];return '';}
    if(low.startsWith('ip domain-name ')){x.global['ip domain-name']=line;return '';}
    if(low.startsWith('ip default-gateway ')){if(nIP(line.split(' ')[2])===null)return '% Invalid input detected.';x.global['ip default-gateway']=line;return '';}
    if(low.startsWith('username ')){const u=line.split(' ');x.global['username '+u[1]]=u.length>=4&&/^secret$/i.test(u[2])?'username '+u[1]+' secret 5 '+fakeHash(u.slice(3).join(' ')):line;return '';}
    if(low==='no cdp run'||low==='cdp run'){x.global.cdp=low==='no cdp run'?low:'';return '';}
    if(low==='lldp run'||low==='no lldp run'){x.global.lldp=low==='lldp run'?low:'';return '';}
    if(low==='line console 0'||low.startsWith('line vty ')){m.mode='line';m.line=low==='line console 0'?'con 0':'vty '+line.split(' ').slice(2).join(' ');x.line[m.line]??={};return '';}
  }
  if(m.mode==='line'){
    if(low==='line console 0'||low.startsWith('line vty ')){m.line=low==='line console 0'?'con 0':'vty '+line.split(' ').slice(2).join(' ');x.line[m.line]??={};return '';}
    if(low==='exit'){m.mode='config';return '';}if(low==='end'){m.mode='priv';return '';}
    const L=x.line[m.line]??={};
    if(low.startsWith('password ')){L.password=line;return '';}
    if(low==='login'||low==='login local'){L.login=low;return '';}if(low==='no login'){delete L.login;return '';}
    if(low.startsWith('transport input ')){L.transport=line;return '';}
    if(low.startsWith('exec-timeout ')){L.timeout=line;return '';}
    if(low==='logging synchronous'){L.sync=low;return '';}
  }
  if(m.mode==='iface'){
    if(low.startsWith('interface ')){const r=execCmd(n,'interface '+normIf(line.slice(10)));return r.startsWith('%')?'%Invalid interface type and number':r;}
    const I=x.iface[m.iface]??={};
    if(low.startsWith('description ')){I.description=line;return '';}if(low==='no description'){delete I.description;return '';}
    if(low.startsWith('speed ')){I.speed=line;return '';}if(low.startsWith('duplex ')){I.duplex=line;return '';}
    if(low==='no ip address'&&n.type==='router'){const q=n.ports.find(q=>q.name===m.iface);if(q){q.ip='';resetRuntime();}return '';}
    if(low.startsWith('switchport trunk allowed vlan add ')){const q=n.ports.find(q=>q.name===m.iface);return execCmd(n,'switchport trunk allowed vlan '+[...new Set(String(q?.allowed||'').split(',').concat(line.split(' ').pop().split(',')).filter(Boolean))].join(','));}
    if(low==='shutdown'||low==='no shutdown'){const q=n.ports.find(q=>q.name===m.iface);const out=execCmd(n,low);if(!state.ptMode)return out;const up=q&&q.admin;return up?'\n%LINK-5-CHANGED: Interface '+ifFull(m.iface)+', changed state to up'+(active(n.id,m.iface)?'\n\n%LINEPROTO-5-UPDOWN: Line protocol on Interface '+ifFull(m.iface)+', changed state to up':''):'\n%LINK-5-CHANGED: Interface '+ifFull(m.iface)+', changed state to administratively down';}
  }
  if(m.mode==='vlan'&&low.startsWith('name ')){(n.vlanNames??={})[m.vlan]=line.slice(5).trim();return '';}
  if(m.mode==='vlan'&&low.startsWith('vlan ')){m.mode='config';return execCmd(n,line);}
  if(low==='exit'&&m.mode==='user')return '';
  const out=execCmd(n,line);
  return out.startsWith('% Command not available')?'% Invalid input detected at \'^\' marker.':out;
}
window.ATLAS_EMULATOR_TEST={setup,ping,runPing,graph,routeFor,execCmd,iosCmd,iosComplete,selectDevice:id=>{state.selected=id;},range,onNet,getState:()=>state,setState:d=>{state=d;resetRuntime();},resetRuntime};
const mission=()=>MISSIONS.find(x=>x.id===state.mission)||MISSIONS[0];
function statusText(){if(state.trace?.success)return 'Working connection';if(state.trace&&!state.trace.success)return 'Connection needs repair';return state.links.length?'Ready to test':'Needs cables';}
const field=(n,p,key,label,val,help,extra='')=>`<label class="em-field"><span>${defs(label)}</span><input data-em-field="${key}" data-em-device="${esc(n.id)}" data-em-port="${esc(p.name)}" value="${esc(val)}" ${extra} /><small>${defs(help)}</small></label>`;
const selectField=(n,p,key,label,val,opts,help)=>`<label class="em-field"><span>${defs(label)}</span><select data-em-field="${key}" data-em-device="${esc(n.id)}" data-em-port="${esc(p.name)}">${opts.map(([v,text])=>`<option value="${esc(v)}" ${String(v)===String(val)?'selected':''}>${esc(text)}</option>`).join('')}</select><small>${defs(help)}</small></label>`;
const checkField=(n,p,key,label,val,help)=>`<label class="em-check"><input type="checkbox" data-em-field="${key}" data-em-device="${esc(n.id)}" data-em-port="${esc(p.name)}" ${val?'checked':''}/><span>${esc(label)}<small>${defs(help)}</small></span></label>`;
const portStatus=(n,p)=>`<span class="em-status ${active(n.id,p.name)?'up':'down'}">${active(n.id,p.name)?'● Connected':!p.admin?'○ Shut down':'○ Not connected'}</span>`;
function mapSVG(){const current=state.trace?.events[state.step],highlight=current?.path||[],lineHTML=state.links.map(l=>{const a=get(l.a),b=get(l.b);if(!a||!b)return '';const glow=highlight.includes(l.a)&&highlight.includes(l.b);const up=active(l.a,l.ap)&&active(l.b,l.bp);return `<g data-em-edge="${esc(l.id)}" role="button" tabindex="0" aria-label="Inspect cable between ${esc(a.label)} and ${esc(b.label)}"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="em-wire-hit"/><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="em-wire ${up?'':'disconnected'} ${glow?'hot':''}"/><circle cx="${(a.x+b.x)/2}" cy="${(a.y+b.y)/2}" r="3.5" fill="${up?'#51e5bd':'#ef908f'}"/></g>`;}).join('');
const nodes=state.devices.map(n=>{const highlighted=highlight.includes(n.id),activeSelection=state.selected===n.id;const icon=n.type==='pc'?'▣':n.type==='switch'?'▤':'⬡';const down=n.type==='router'&&!n.ports.some(p=>active(n.id,p.name));return `<g class="em-device ${n.type} ${highlighted?'em-lit':''} ${activeSelection?'em-selected':''}" data-em-node="${esc(n.id)}" role="button" tabindex="0" aria-label="${esc(n.label)} ${esc(n.type)}" transform="translate(${n.x} ${n.y})"><rect x="-62" y="-37" width="124" height="76" rx="16"/><text class="em-device-icon" y="4" text-anchor="middle">${icon}</text><text class="em-device-name" y="29" text-anchor="middle">${esc(n.label)}</text><circle cx="47" cy="-26" r="5" fill="${down?'#ef9a85':'#5ce2b0'}"/><text class="em-kind" y="57" text-anchor="middle">${n.type==='pc'?'COMPUTER':n.type==='switch'?'SWITCH':'ROUTER'}</text></g>`;}).join('');
const travel=(RA&&RA.trace===state.trace&&!RA.manual)?'':current&&current.path?.length>1?(()=>{const pts=current.path.map(get).filter(Boolean);if(pts.length<2)return '';return `<circle r="7" fill="#fff2a5" stroke="#f5bd65" stroke-width="2"><animateMotion path="M${pts.map(p=>p.x+' '+p.y).join(' L')}" dur="${(0.9*(pts.length-1)).toFixed(1)}s" repeatCount="indefinite"/></circle>`;})():'';
return `<svg id="em-svg" class="em-svg" viewBox="0 0 1000 475" role="group" aria-label="Interactive network topology. Select or drag a device; use Connect cable to wire two devices."><defs><pattern id="emGrid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#344d67"/></pattern></defs><rect x="0" y="0" width="1000" height="475" fill="url(#emGrid)" />${lineHTML}${nodes}${travel}</svg>`;}
function missionSelector(){return `<div class="em-mission-scroll" role="group" aria-label="Choose a practice mission">${MISSIONS.map(m=>`<button class="em-mission ${state.mission===m.id?'current':''}" data-em-mission="${m.id}"><span class="em-mission-icon">${m.icon}</span><span><small>${esc(m.level)}${state.completed?.[m.id]?' · ✓ Complete':''}</small><b>${esc(m.title)}</b></span></button>`).join('')}</div>`;}
function settingsHTML(){const n=selected();if(!n)return '<p>Click a device first.</p>';let fields='';
if(n.type==='pc'){
 const p=n.ports[0];fields=`<p class="em-small">This computer needs an IPv4 address to talk to another device. A gateway is needed when the destination is on another network.</p>${field(n,p,'ip','IP address',p.ip,'A unique address, like a street number: 192.168.10.10')}${field(n,p,'prefix','Subnet prefix',p.prefix,'/24 means the first 24 bits identify the network. Type 24, not /24.')}${field(n,p,'gateway','Default gateway',p.gateway,'The local router address for reaching a different IP network. Leave blank on a single LAN.')}${checkField(n,p,'admin','Network cable enabled',p.admin,'An enabled interface can use a connected cable.')}<div class="em-mac">MAC address <code>${esc(p.mac)}</code></div>`;
}else if(n.type==='router'){
fields=`<p class="em-small">A router joins different IP networks. Each wired interface needs an address in its own network and must be enabled.</p>${n.ports.filter(p=>state.showExtras||!!linkFor(n.id,p.name)||!!p.ip||p===n.ports[0]).map(p=>`<section class="em-port-card"><div class="em-port-head"><b>${esc(p.name)}</b>${portStatus(n,p)}</div>${field(n,p,'ip','Interface IPv4',p.ip,'Set the IP address for this side of the router.')}${field(n,p,'prefix','Prefix',p.prefix,'Enter 24 for /24 or 30 for /30.')}${checkField(n,p,'admin','Enable interface (no shutdown)',p.admin,'It still needs a cable to show connected.')}</section>`).join('')}<button class="em-button em-outline em-ports-toggle" data-em="toggle-ports">${state.showExtras?'Show connected ports only':'Show all '+n.ports.length+' interfaces'}</button><div class="em-mini-heading">Static routes (${n.routes.length})</div>${n.routes.map((r,i)=>`<div class="em-route-row"><code>${esc(r.network)}/${r.prefix} → ${esc(r.nextHop)}</code><button data-em-delete-route="${i}" aria-label="Delete static route">×</button></div>`).join('')}<p class="em-small">Add routes in the <b>Terminal</b> with <code>ip route</code>. This helps routers find networks beyond a directly connected interface.</p>`;
}else{
 fields=`<p class="em-small">A switch forwards Ethernet frames. Access ports belong to one VLAN; trunk ports can carry multiple VLANs between switches.</p>${n.ports.filter(p=>state.showExtras||!!linkFor(n.id,p.name)||!!p.ip||p===n.ports[0]).map(p=>`<section class="em-port-card"><div class="em-port-head"><b>${esc(p.name)}</b>${portStatus(n,p)}</div>${selectField(n,p,'mode','Port mode',p.mode,[['access','Access — one VLAN'],['trunk','Trunk — several VLANs']],'Usually access for a PC or router, trunk between switches.')}${p.mode==='access'?field(n,p,'vlan','Access VLAN',p.vlan,'Numbers 1–4094. Devices in different VLANs need routing to communicate.'):field(n,p,'allowed','Allowed VLANs',p.allowed,'Comma-separated list, for example 1,10,20. Both trunk ends must allow the VLAN.')}${checkField(n,p,'admin','Enable port',p.admin,'Shutdown blocks traffic on this port.')}</section>`).join('')}<button class="em-button em-outline em-ports-toggle" data-em="toggle-ports">${state.showExtras?'Show connected ports only':'Show all '+n.ports.length+' ports'}</button><p class="em-small">Trunks are supported only between two switches with trunk ports at both ends. STP and native VLAN mismatches are not modeled.</p>`;
}
return `<div class="em-editor">${fields}<button class="em-button em-primary em-apply" data-em="apply">✓ Apply changes</button>${n.type==='pc'?`<button class="em-button em-quiet" data-em="ping-from">▶ Ping from this PC</button>`:''}</div>`;}
function tableHTML(){const n=selected();if(!n)return '';const print=(headers,rows)=>`<div class="em-table-wrap"><table class="em-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(c=>`<tr>${c.map(v=>`<td><code>${esc(v)}</code></td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">No entries yet. Try sending traffic.</td></tr>`}</tbody></table></div>`;
if(n.type==='switch')return `<h4>Learned MAC addresses</h4><p class="em-small">Switches learn which port an Ethernet source MAC came from.</p>${print(['MAC','VLAN','Port'],Object.entries(runtime.mac[n.id]||{}).map(([mac,e])=>[mac,e.vlan,e.port]))}<h4>Port summary</h4>${print(['Port','Mode','VLAN','Cable'],n.ports.map(p=>[p.name,p.mode,p.vlan,active(n.id,p.name)?'Up':'Down']))}`;
if(n.type==='pc')return `<h4>ARP cache</h4><p class="em-small">ARP remembers which Ethernet MAC belongs to a local IPv4 next-hop.</p>${print(['IPv4 address','MAC'],Object.entries(runtime.arp[identity(n,n.ports[0])]||{}))}`;
const routes=[...n.ports.filter(p=>active(n.id,p.name)&&hostOK(p.ip,p.prefix)).map(p=>['Connected',`${range(p.ip,p.prefix).network}/${p.prefix}`,p.name]),...n.routes.map(r=>['Static',`${r.network}/${r.prefix}`,r.nextHop])];return `<h4>IPv4 routing table</h4>${print(['Type','Network','Interface / next hop'],routes)}<h4>ARP cache</h4>${print(['IPv4 next hop','MAC'],Object.entries(runtime.arp).filter(([k])=>k.startsWith(n.id+':')).flatMap(([,v])=>Object.entries(v)))}`;
}
function commandSuggestions(n,m){
 if(n.type==='pc'){const other=state.devices.find(x=>x.id!==n.id&&x.type==='pc'&&x.ports[0].ip);return ['?','ipconfig /all','ping '+(other?.ports[0]?.ip||'192.168.10.20'),'arp -a'];}
 if(m.mode==='user')return ['?','enable','show running-config',...(n.type==='router'?['show ip interface brief']:['show vlan brief'])];
 if(m.mode==='priv')return ['?','configure terminal','show running-config',...(n.type==='router'?['show ip route','show ip interface brief']:['show vlan brief','show interfaces status'])];
 if(m.mode==='config')return n.type==='router'?['?','interface gi0/0','interface gi0/1','ip route 192.168.20.0 255.255.255.0 10.0.0.2','end']:['?','interface fa0/1','interface fa0/2','vlan 10','end'];
 if(m.mode==='iface')return n.type==='router'?['?','no shutdown','shutdown','ip address 192.168.20.1 255.255.255.0','exit','end']:['?','switchport mode access','switchport access vlan 10','switchport mode trunk','exit','end'];
 return ['?','exit','end'];
}
function consoleHTML(){const n=selected();if(!n)return '';const m=chosenConsole(),cmds=commandSuggestions(n,m);
const context=n.type==='pc'?'Windows-style PC practice terminal. Cisco IOS commands will not work here.':n.type==='switch'?'Cisco-like switch practice terminal. Use enable, then configure terminal to change settings.':'Cisco-like router practice terminal. Use enable, then configure terminal to change settings.';
const mode=n.type==='pc'?'PC command prompt':m.mode==='user'?'User EXEC':m.mode==='priv'?'Privileged EXEC':m.mode==='config'?'Global configuration':m.mode==='iface'?'Interface configuration':'VLAN configuration';
return `<div class="em-terminal-wrap"><div class="em-cli-context"><b>⌨ ${esc(n.label)} · ${n.type==='pc'?'Computer':n.type==='switch'?'Switch':'Router'}</b><span>${esc(mode)} mode</span></div><p class="em-small">${esc(context)} Commands entered here affect <strong>${esc(n.label)}</strong> in the network diagram.</p><div class="em-console" id="em-console" role="log" aria-label="Terminal output" aria-live="polite"><pre>${esc(state.consoleLines[n.id]||'Connected to '+n.label+'. Enter ? and press Run for device-specific help.\n')}</pre></div><form id="em-cmd-form" class="em-command"><label for="em-command">${esc(prompt(n))}</label><input id="em-command" ${chosenConsole()?.await==='enable'?'type="password"':''} placeholder="${n.type==='pc'?'Enter a command, e.g. ?':'Type a command. Tab finishes words. ? shows help.'}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command for ${esc(n.label)}" aria-describedby="em-cli-guide"/><button class="em-button em-primary" type="submit">Run command ↵</button></form>${n.type==='pc'?'':`<label class="em-ptmode"><input type="checkbox" id="em-ptmode" ${state.ptMode?'checked':''}> <b>Packet Tracer mode</b> <span>${state.ptMode?'On: exactly like real IOS. No hints. You must check your work with show commands.':'Off: you get a hint after each command. Turn it on when you feel ready.'}</span></label>`}<p id="em-cli-guide" class="em-cli-guide">Type a command and press <b>Enter</b> or <b>Run command</b>. You can also tap a suggestion below to <b>execute it immediately</b>. ↑ shows previous commands.</p><div class="em-cmd-help"><span>Run a suggested command on ${esc(n.label)}:</span>${cmds.map(c=>`<button type="button" data-em-exec="${esc(c)}" title="Execute ${esc(c)}">▶ ${esc(c)}</button>`).join('')}</div><p class="em-cli-limit">This practice console supports a subset of commands. It does not run actual Cisco IOS. Unsupported commands always display an explanation.</p></div>`;}
function inspectorHTML(){const n=selected();if(!n)return `<section class="em-inspector"><h3>Select a device</h3><p>Click a computer, switch, or router on the canvas.</p></section>`;return `<aside class="em-inspector"><div class="em-device-head"><div class="em-device-avatar">${n.type==='pc'?'▣':n.type==='switch'?'▤':'⬡'}</div><div><small>DEVICE SELECTED</small><h3>${esc(n.label)}</h3><p>${n.type==='pc'?'Computer':n.type==='switch'?'Ethernet switch':'IPv4 router'}</p></div><button data-em="delete-device" class="em-icon-button" title="Remove device" aria-label="Remove selected device">×</button></div><div class="em-inspector-tabs" role="tablist"><button role="tab" aria-selected="${state.inspector==='settings'}" class="${state.inspector==='settings'?'active':''}" data-em-inspector="settings">Settings</button><button role="tab" aria-selected="${state.inspector==='terminal'}" class="${state.inspector==='terminal'?'active':''}" data-em-inspector="terminal">Terminal</button><button role="tab" aria-selected="${state.inspector==='tables'}" class="${state.inspector==='tables'?'active':''}" data-em-inspector="tables">Live tables</button></div><div class="em-inspector-body">${state.inspector==='settings'?settingsHTML():state.inspector==='terminal'?consoleHTML():tableHTML()}</div></aside>`;}
function resultHTML(){const trace=state.trace,step=trace?.events[state.step];return `<section class="em-journey"><div class="em-journey-head"><div><small>WHAT HAPPENED TO THE PACKET?</small><h3>${trace?(trace.success?'✓ Successful network test':'✕ Something blocked the network'):'Your packet journey appears here'}</h3></div>${playControls()}${trace?`<span class="em-chip ${trace.success?'good':'bad'}">${trace.success?'PING SUCCEEDED':'PING FAILED'}</span>`:''}</div>${trace?`<div class="em-trace-layout"><div class="em-events" aria-label="Packet events">${trace.events.map((event,i)=>`<button class="em-event ${i===state.step?'active':''} ${event.status==='bad'?'failed':''}" data-em-step="${i}"><span class="em-step-bullet">${i+1}</span><span><small>${esc(event.type.toUpperCase())}</small><b>${esc(event.title)}</b></span></button>`).join('')}</div><div class="em-event-detail"><div class="em-event-index">Step ${state.step+1} of ${trace.events.length}</div><h4>${esc(step?.title)}</h4><p>${defs(step?.detail)}</p>${step?.ip||step?.l2?`<div class="em-packet-info">${step.ip?`<div><small>IPv4 envelope — end to end</small><span>From <code>${esc(step.ip.src)}</code> → <code>${esc(step.ip.dst)}</code></span></div>`:''}${step.l2?`<div><small>Ethernet envelope — this hop</small><span>MAC <code>${esc(step.l2.src)}</code> → <code>${esc(step.l2.dst)}</code></span></div>`:''}</div>`:''}<div class="em-step-controls"><button class="em-button" data-em="prev" ${state.step===0?'disabled':''}>← Back</button><button class="em-button em-primary" data-em="next" ${state.step===trace.events.length-1?'disabled':''}>Next step →</button></div></div></div>`:`<div class="em-empty-result"><div class="em-empty-icon">✉</div><p><b>Ready when you are.</b> Choose a source and destination below, then click <strong>Run ping</strong>. You'll see ARP, switches, routers, and the reply explained in simple language.</p></div>`}</section>`;}
function controlsHTML(){const devs=state.devices.filter(n=>n.type!=='switch'),options=devs.map(n=>`<option value="${esc(n.id)}" ${state.from===n.id?'selected':''}>${esc(n.label)}</option>`).join('');return `<section class="em-ping-controls"><div class="em-ping-head"><h3>Send a test packet</h3><p>A <span class="glossary-link" data-glossary="${esc(entryDict.find(d=>String(d.term).toLowerCase()==='ping')?.id||'')}" tabindex="0" role="button">ping</span> tests whether a destination can respond. Both directions must work.</p></div><label>Send from<select id="em-from" aria-label="Source device">${options}</select></label><label>To IPv4 address<input id="em-dest" aria-label="Destination IPv4 address" autocomplete="off" spellcheck="false" value="${esc(state.dest||'')}" placeholder="192.168.10.20"/></label><button class="em-button em-primary em-run" data-em="ping">▶ Run ping</button><button class="em-button em-outline" data-em="clear-caches" title="Clear learned ARP and switch MAC tables">Clear tables</button></section>`;}
function renderLab(){const m=mission(),status=statusText();return `<div class="em-app"><div class="em-hero"><div><span class="em-eyebrow"><span class="em-pulse"></span> BROWSER NETWORK LAB · VERSION 0.4.1</span><h1>Build a network. <em>See it work.</em></h1><p>No prior experience needed. Move virtual devices, plug in cables, configure IPv4, and watch every packet hop. Guided or hands-on—your choice.</p></div><a class="em-hero-cta" href="https://developer.cisco.com/docs/modeling-labs/cml-free/" target="_blank" rel="noopener noreferrer">Need actual Cisco IOS? <b>Learn about CML ↗</b></a></div>
 <div class="em-notice"><b>What this is:</b> An interactive, protocol-level <b>network simulator</b> that executes the supported Ethernet, ARP, VLAN, routing, and ICMP rules. It is not a VM running genuine Cisco IOS, and it does not emulate every Packet Tracer feature. <a href="https://www.netacad.com/resources/lab-downloads" target="_blank" rel="noopener noreferrer">Get Cisco Packet Tracer ↗</a></div>
 <div class="em-tabs"><button class="active" data-em-screen="lab">▣ Virtual network lab</button><button data-em-screen="subnet">⌗ Subnetting workout</button><button data-em-screen="real">▤ Real IOS options</button><button data-action="ptbook">▦ Packet Tracer lab book</button></div>
 <div class="em-section-label"><div><small>CHOOSE YOUR PRACTICE</small><h2>Guided missions</h2></div><p>Start left, then move toward more advanced challenges.</p></div>${missionSelector()}
 <div class="em-task"><div class="em-task-icon">${m.icon}</div><div><span class="em-task-kicker">YOUR OBJECTIVE · ${esc(m.level)}</span><h3>${esc(m.title)}</h3><p>${defs(m.goal)}</p><div class="em-task-actions"><button class="em-button em-outline" data-em="help">${state.help?'Hide instructions':'💡 Show me what to do'}</button><span class="em-state ${state.trace?.success?'success':''}">${state.trace?.success?'✓ Objective reached':esc(status)}</span></div>${state.help?`<div class="em-hint">${defs(m.hint)}</div>`:''}</div></div>
 <div class="em-toolbar"><span class="em-toolbar-title">WORKSPACE</span><div><button data-em="add-pc" title="Add a computer">＋ Computer</button><button data-em="add-switch" title="Add a switch">＋ Switch</button><button data-em="add-router" title="Add a router">＋ Router</button><button data-em="wire" class="${state.wiring?'active':''}" title="Select two devices to connect">🔌 ${state.wiring?'Pick two devices':'Connect cable'}</button><button data-em="reset" title="Reset this mission">↺ Reset</button></div><div class="em-toolbar-other"><button data-em="export" title="Download your lab as JSON">↓ Save lab</button><button data-em="import" title="Load a saved lab">↑ Load</button><input hidden type="file" id="em-import" accept="application/json,.json"/></div></div>
 ${state.wiring?`<div class="em-wiring" role="status">${state.firstWire?`Now select the second device to connect to ${esc(get(state.firstWire)?.label||'your first device')}.`:'Select the first device, then the second device. The next available ports will be used.'}<button data-em="cancel-wire">Cancel</button></div>`:''}
 <div class="em-workspace"><div class="em-stage"><div class="em-canvas-help"><span>DRAG TO MOVE DEVICES · CLICK TO EDIT · CLICK CABLE TO UNPLUG</span><span>${state.devices.length} devices · ${state.links.length} cables</span></div><div class="em-canvas-box">${mapSVG()}</div><div class="em-canvas-foot">Tip: ${state.mission==='blank'?'Add two PCs and a switch, then configure and connect them.':'Click a device to view its settings. Need guidance? Select “Show me what to do”.'}</div></div>${inspectorHTML()}</div>${controlsHTML()}${resultHTML()}<div class="em-note">This lab models IPv4 traffic without real packet timings. No spanning tree, NAT, DHCP, OSPF, IPv6, wireless, or Cisco image virtualization. Exam readiness still requires graded Cisco Packet Tracer / CML configuration labs.</div></div>`;}
function subnetHTML(){if(!state.subnet)state.subnet={idx:0,network:'',broadcast:'',checked:false};const drills=[['192.168.10.34',27],['10.3.18.87',20],['172.16.5.220',26],['192.168.77.129',25],['10.0.0.65',28],['172.20.4.99',23],['192.168.1.254',29],['10.8.40.1',22]];const [ip,p]=drills[state.subnet.idx%drills.length],ans=range(ip,p),correct=state.subnet.checked&&state.subnet.network.trim()===ans.network&&state.subnet.broadcast.trim()===ans.broadcast;return `<div class="em-app"><div class="em-hero"><div><span class="em-eyebrow">PRACTICE STATION</span><h1>Subnetting, <em>without panic.</em></h1><p>Learn where an IPv4 network begins and ends, then verify your answers.</p></div></div><div class="em-tabs"><button data-em-screen="lab">▣ Virtual network lab</button><button class="active" data-em-screen="subnet">⌗ Subnetting workout</button><button data-em-screen="real">▤ Real IOS options</button><button data-action="ptbook">▦ Packet Tracer lab book</button></div><div class="em-subnet-grid"><section class="em-subnet-card"><span class="em-eyebrow">PROBLEM ${state.subnet.idx%drills.length+1} OF ${drills.length}</span><div class="em-subnet-prompt">${ip}<em>/${p}</em></div><p>Find the first address (network) and last address (broadcast) in this block.</p><label>Network address<input data-em-subnet="network" value="${esc(state.subnet.network)}" placeholder="192.168.10.32"/></label><label>Broadcast address<input data-em-subnet="broadcast" value="${esc(state.subnet.broadcast)}" placeholder="192.168.10.63"/></label><div class="em-flex"><button class="em-button em-primary" data-em="subnet-check">Check my answers</button><button class="em-button" data-em="subnet-next">Next example →</button></div>${state.subnet.checked?`<div class="em-subnet-result ${correct?'good':''}"><h3>${correct?'✓ You got both!':'Review this solution'}</h3><p>Network: <code>${ans.network}/${p}</code><br>Broadcast: <code>${ans.broadcast}</code><br>Subnet mask: <code>${ans.mask}</code><br>Usable range: <code>${ans.first}</code> to <code>${ans.last}</code></p><p>The prefix leaves ${32-p} host bits. A standard /1–/30 subnet reserves its all-zero and all-one addresses.</p></div>`:''}</section><section class="em-subnet-explain"><h3>Think of it like street addresses</h3><p>The <b>network address</b> names the entire street. The <b>host addresses</b> identify buildings on it. The <b>broadcast address</b> reaches all IPv4 hosts on that local street.</p><p>For a /24, there are 8 host bits, giving 256 total addresses. Typically, 254 are usable for hosts.</p><p>These drills use standard /1–/30 conventions. The special /31 and /32 cases come later.</p><button class="em-button em-outline" data-em-screen="lab">Return to virtual lab →</button></section></div></div>`;}
function realHTML(){return `<div class="em-app"><div class="em-hero"><div><span class="em-eyebrow">NEXT LEVEL</span><h1>Want <em>real Cisco IOS?</em></h1><p>There is a difference between a teaching simulation and a licensed virtual router running a real network operating system.</p></div></div><div class="em-tabs"><button data-em-screen="lab">▣ Virtual network lab</button><button data-em-screen="subnet">⌗ Subnetting workout</button><button class="active" data-em-screen="real">▤ Real IOS options</button><button data-action="ptbook">▦ Packet Tracer lab book</button></div><div class="em-real-grid"><a href="https://www.netacad.com/resources/lab-downloads" target="_blank" rel="noopener noreferrer"><b>Official Cisco Packet Tracer</b><span>Free Cisco learning simulator. Start here for CCNA labs, switches, routers, VLANs, and routing.</span><strong>Official download hub ↗</strong></a><a href="https://developer.cisco.com/docs/modeling-labs/cml-free/" target="_blank" rel="noopener noreferrer"><b>Cisco Modeling Labs — Free</b><span>Run Cisco-provided licensed virtual devices on a computer capable of virtualization. More realistic IOS behavior.</span><strong>Check CML Free requirements ↗</strong></a><a href="https://docs.gns3.com/docs" target="_blank" rel="noopener noreferrer"><b>GNS3</b><span>Powerful network virtualization, but Cisco images must be legally obtained and configured separately.</span><strong>Read GNS3 setup ↗</strong></a></div><div class="em-note"><b>Important:</b> This browser site cannot legally bundle Cisco IOS images or provide full hardware/OS emulation inside static Vercel hosting. Network Atlas can still teach and visually explain the supported networking rules, while those official tools handle full IOS practice.</div></div>`;}
function render(out=root){if(!out)return;out.innerHTML=screen==='lab'?renderLab():screen==='subnet'?subnetHTML():realHTML();paintRoute();}
function tell(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._emTimer);t._emTimer=setTimeout(()=>t.classList.remove('show'),window.ATLAS_PREFS?.msgMs()||3600);}
function setMission(id){if(!MISSIONS.some(m=>m.id===id))return;const oldDone={...state.completed};state=setup(id);state.completed=oldDone;runtime={arp:{},mac:{},lastSuccess:false};screen='lab';save();render();tell('Loaded '+mission().title+'. Start by reading the goal.');}
function chooseNode(id){const n=get(id);if(!n)return;if(state.wiring){if(!state.firstWire){state.firstWire=id;render();return;}if(state.firstWire===id){tell('Choose another device as the cable’s second endpoint.');return;}const a=get(state.firstWire),b=get(id),pa=a.ports.find(p=>!linkFor(a.id,p.name)),pb=b.ports.find(p=>!linkFor(b.id,p.name));if(!pa||!pb){tell('A device has no free ports. Remove a cable or select a different device.');return;}if(!addLink(state,a.id,pa.name,b.id,pb.name)){tell('That cable could not be added.');return;}
 if(a.type==='switch'&&b.type==='switch'){pa.mode='trunk';pb.mode='trunk';}
 state.wiring=false;state.firstWire='';resetRuntime();tell('Cable connected: '+a.label+' '+pa.name+' ↔ '+b.label+' '+pb.name);save();render();return;}
 state.selected=id;if(state.inspector!=='terminal')state.inspector='settings';save();render();if(state.inspector==='terminal')root.querySelector('#em-command')?.focus();}
function applyInputs(){const updates=[];for(const input of root.querySelectorAll('[data-em-field]')){const n=get(input.dataset.emDevice),p=n?.ports.find(p=>p.name===input.dataset.emPort),key=input.dataset.emField; if(!p)continue;const value=input.type==='checkbox'?!!input.checked:input.value.trim();
  if(key==='prefix'&&!prefixOK(value)){tell('A beginner subnet prefix must be a number from 1 to 30.');input.focus();return;}
  if(key==='ip'&&value&&nIP(value)===null){tell('Enter a valid IPv4 address with four numbers (0–255), like 192.168.10.1.');input.focus();return;}
  if(key==='gateway'&&value&&nIP(value)===null){tell('The default gateway must be a valid IPv4 address or blank.');input.focus();return;}
  if(key==='vlan'&&(!/^\d+$/.test(String(value))||Number(value)<1||Number(value)>4094)){tell('VLAN IDs must be 1–4094.');input.focus();return;}
  if(key==='allowed'){const arr=String(value).split(',');if(!arr.length||arr.some(x=>!/^\d+$/.test(x.trim())||Number(x)<1||Number(x)>4094)){tell('Use comma-separated VLAN IDs, such as 1,10,20.');input.focus();return;}}
  updates.push({p,n,key,value});}
  // Validate final IP/prefix pairs as one transaction (no partial mutations).
  for(const n of state.devices.filter(n=>n.type!=='switch'))for(const p of n.ports){const finalIp=updates.find(u=>u.p===p&&u.key==='ip')?.value??p.ip;const finalPrefix=updates.find(u=>u.p===p&&u.key==='prefix')?.value??p.prefix;if(finalIp&&!hostOK(finalIp,finalPrefix)){tell(n.label+' '+p.name+': That IP is a network/broadcast address or has an invalid subnet mask.');return;}}
  for(const u of updates)u.p[u.key]=u.key==='prefix'||u.key==='vlan'?Number(u.value):u.key==='allowed'?[...new Set(u.value.split(',').map(x=>Number(x.trim())))].join(','):u.value;
  for(const n of state.devices.filter(n=>n.type==='switch'))n.vlans=[...new Set([1,...n.ports.filter(p=>p.mode==='access').map(p=>p.vlan)])];
  resetRuntime();save();render();tell('✓ Saved. Your new settings affect the next ping.');}
function dl(name,content,type='application/json'){window.ATLAS_PREFS.saveFile(name,content,type);}
function validateImport(data){if(!data||!Array.isArray(data.devices)||!Array.isArray(data.links)||data.devices.length>20||data.links.length>80)return false;const ids=new Set();for(const n of data.devices){if(!n||typeof n.id!=='string'||n.id.length>40||!['pc','switch','router'].includes(n.type)||!Array.isArray(n.ports)||n.ports.length>16||!Number.isFinite(n.x)||!Number.isFinite(n.y)||ids.has(n.id))return false;ids.add(n.id);for(const p of n.ports)if(!p||typeof p.name!=='string'||typeof p.mac!=='string'||p.name.length>30)return false;}for(const l of data.links)if(!l||!ids.has(l.a)||!ids.has(l.b)||l.a===l.b)return false;return true;}
function oneAction(action,btn){if(action==='help'){state.help=!state.help;render();return;}
 if(action==='toggle-ports'){state.showExtras=!state.showExtras;render();return;}
 if(action==='add-pc'||action==='add-router'||action==='add-switch'){if(state.devices.length>=20){tell('This browser simulator supports up to 20 devices.');return;}const type=action.slice(4),count=state.devices.filter(n=>n.type===type).length+1,index=state.devices.length,n=device(type,(type==='pc'?'PC':type==='switch'?'SW':'R')+'-'+count,clamp(155+(index%4)*200,80,915),clamp(165+Math.floor(index/4)*105,85,385));state.devices.push(n);state.selected=n.id;state.inspector='settings';resetRuntime();save();render();tell('Added '+n.label+'. Configure its interfaces, then connect a cable.');return;}
 if(action==='wire'){state.wiring=!state.wiring;state.firstWire='';render();return;}
 if(action==='cancel-wire'){state.wiring=false;state.firstWire='';render();return;}
 if(action==='reset'){const id=state.mission,keep={...state.completed};state=setup(id);state.completed=keep;resetRuntime();save();render();tell('Reset mission to the starting configuration.');return;}
 if(action==='ping'){const from=root.querySelector('#em-from')?.value||state.from,dest=root.querySelector('#em-dest')?.value.trim()||state.dest;state.from=from;state.dest=dest;const r=runPing(from,dest);render();tell(r.success?'✓ Ping succeeded! Watch the route play on the map.':'✕ Ping failed. Watch where the packet stops on the map.');root.querySelector('.em-stage')?.scrollIntoView({behavior:raReduced()?'auto':'smooth',block:'start'});return;}
 if(action==='ping-from'){state.from=state.selected;render();root.querySelector('#em-dest')?.focus();return;}
 if(action==='apply'){applyInputs();return;}
 if(action==='prev'){state.step=Math.max(0,state.step-1);render();root.querySelector('.em-journey')?.scrollIntoView({block:'nearest'});return;}
 if(action==='next'){state.step=Math.min((state.trace?.events.length||1)-1,state.step+1);render();root.querySelector('.em-journey')?.scrollIntoView({block:'nearest'});return;}
 if(action==='clear-caches'){resetRuntime();render();tell('Cleared learned MAC / ARP tables and the previous trace.');return;}
 if(action==='delete-device'){const n=selected();if(!n)return;state.devices=state.devices.filter(x=>x.id!==n.id);state.links=state.links.filter(l=>l.a!==n.id&&l.b!==n.id);state.selected=state.devices[0]?.id||'';state.from=state.devices.find(x=>x.type==='pc')?.id||'';resetRuntime();save();render();tell(n.label+' removed with its connected cables.');return;}
 if(action==='export'){dl('network-atlas-my-lab.json',JSON.stringify({schema:'network-atlas-v4',...state,trace:null},null,2));tell('Lab configuration exported to JSON.');return;}
 if(action==='import'){root.querySelector('#em-import')?.click();return;}
 if(action==='subnet-check'){state.subnet.checked=true;render();return;}
 if(action==='subnet-next'){state.subnet.idx=(state.subnet.idx+1)%8;state.subnet.checked=false;state.subnet.network='';state.subnet.broadcast='';render();return;}
}
root.addEventListener('click',ev=>{
 if(!root.querySelector('.em-app'))return;
 if(ev.target.closest('[data-glossary]'))return; // global app handler opens the shared 380-term dictionary
 const tab=ev.target.closest('[data-em-screen]');if(tab){screen=tab.dataset.emScreen;render();return;}
 const m=ev.target.closest('[data-em-mission]');if(m){setMission(m.dataset.emMission);return;}
 const inspector=ev.target.closest('[data-em-inspector]');if(inspector){state.inspector=inspector.dataset.emInspector;render();if(state.inspector==='terminal')root.querySelector('#em-command')?.focus();return;}
 const step=ev.target.closest('[data-em-step]');if(step){state.step=Number(step.dataset.emStep);render();return;}
 const cable=ev.target.closest('[data-em-edge]');if(cable){const l=state.links.find(x=>x.id===cable.dataset.emEdge);if(l){const a=get(l.a),b=get(l.b);modal=l.id;tell('Selected cable: '+a.label+' ↔ '+b.label+'. Click Unplug in the cable notice.');let existing=root.querySelector('.em-cable-notice');if(existing)existing.remove();const div=document.createElement('div');div.className='em-cable-notice';div.innerHTML=`<span>Selected cable: <b>${esc(a.label)} ${esc(l.ap)}</b> ↔ <b>${esc(b.label)} ${esc(l.bp)}</b></span><button data-em="unplug">Unplug cable</button><button data-em="dismiss-cable">Keep cable</button>`;root.querySelector('.em-stage')?.append(div);}return;}
 const quick=ev.target.closest('[data-em-exec]');if(quick){runConsole(quick.dataset.emExec);return;}
 const del=ev.target.closest('[data-em-delete-route]');if(del){const n=selected();if(n?.type==='router'){n.routes.splice(Number(del.dataset.emDeleteRoute),1);resetRuntime();save();render();}return;}
 const b=ev.target.closest('[data-em]');if(!b)return;
 if(b.dataset.em==='unplug'&&modal){state.links=state.links.filter(l=>l.id!==modal);modal=null;resetRuntime();save();render();tell('Cable unplugged.');return;}
 if(b.dataset.em==='dismiss-cable'){modal=null;root.querySelector('.em-cable-notice')?.remove();return;}
 oneAction(b.dataset.em,b);
});
root.addEventListener('change',ev=>{if(!root.querySelector('.em-app'))return;if(ev.target.id==='em-from')state.from=ev.target.value;if(ev.target.id==='em-import'){
 const f=ev.target.files?.[0];if(!f||f.size>1000000){tell('Choose a JSON lab smaller than 1 MB.');return;}
 f.text().then(raw=>{const data=JSON.parse(raw);if(!validateImport(data)){tell('That JSON file is not a valid Network Atlas lab.');return;}state={...setup('first'),...data,trace:null,step:0,wiring:false,firstWire:'',help:false,inspector:'settings',completed:data.completed||{}};state.mission=MISSIONS.some(m=>m.id===data.mission)?data.mission:'blank';nextId=Math.max(200,...state.devices.map(d=>Number(d.id.match(/\d+/)?.[0]||0)+1));resetRuntime();save();render();tell('Lab loaded!');}).catch(()=>tell('Could not read this JSON file.'));
 }});
root.addEventListener('input',ev=>{if(!root.querySelector('.em-app'))return;if(ev.target.id==='em-dest')state.dest=ev.target.value;if(ev.target.dataset.emSubnet){state.subnet??={idx:0,network:'',broadcast:'',checked:false};state.subnet[ev.target.dataset.emSubnet]=ev.target.value;}});
function runConsole(raw){const n=selected(),v=String(raw??'').trim();if(!n){tell('Select a device on the network first.');return;}
if(!v){tell('Enter a command, or tap ? to see valid commands.');root.querySelector('#em-command')?.focus();return;}
const hist=commandHistory[n.id]??=[];if(chosenConsole()?.await!=='enable'&&hist.at(-1)!==v)hist.push(v);if(hist.length>60)hist.shift();commandHistoryCursor[n.id]=hist.length;
const secret=chosenConsole()?.await==='enable',before=secret?'':prompt(n),output=iosCmd(n,v),after=prompt(n);
const note=!output?(state.ptMode?'':before!==after?'[Accepted · prompt changed to '+after+']':'[Accepted · device updated; check the diagram or running-config]'):output;
state.consoleLines[n.id]=((state.consoleLines[n.id]||'')+(secret?'':before+v+'\n')+(note?note.replace(/\s+$/,'')+'\n':'')).slice(-15000);
save();render();const terminal=root.querySelector('#em-console');if(terminal)terminal.scrollTop=terminal.scrollHeight;root.querySelector('#em-command')?.focus();
}
root.addEventListener('submit',ev=>{if(ev.target.id!=='em-cmd-form')return;ev.preventDefault();runConsole(ev.target.querySelector('#em-command')?.value);});
root.addEventListener('change',ev=>{if(ev.target.id==='em-ptmode'){state.ptMode=ev.target.checked;save();render();root.querySelector('#em-command')?.focus();}});
root.addEventListener('keydown',ev=>{if(ev.target.id!=='em-command')return;const n=selected();if(!n)return;if(ev.key==='Tab'&&n.type!=='pc'&&ev.target.value.trim()){ev.preventDefault();ev.target.value=iosComplete(n,ev.target.value);return;}const hist=commandHistory[n.id]||[];if(ev.key==='ArrowUp'&&hist.length){ev.preventDefault();commandHistoryCursor[n.id]=Math.max(0,(commandHistoryCursor[n.id]??hist.length)-1);ev.target.value=hist[commandHistoryCursor[n.id]];}else if(ev.key==='ArrowDown'&&hist.length){ev.preventDefault();commandHistoryCursor[n.id]=Math.min(hist.length,(commandHistoryCursor[n.id]??hist.length)+1);ev.target.value=hist[commandHistoryCursor[n.id]]||'';}});
// SVG pointer events provide drag-to-position, accessible click-to-select, and cable mode.
let dragging=null;
function svgPos(svg,e){const b=svg.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*1000,y:(e.clientY-b.top)/b.height*475};}
root.addEventListener('pointerdown',ev=>{const svg=ev.target.closest('#em-svg'),grp=ev.target.closest('[data-em-node]');if(!svg||!grp||ev.button!==0)return;const n=get(grp.dataset.emNode);if(!n)return;const p=svgPos(svg,ev);dragging={svg,grp,id:n.id,sx:p.x,sy:p.y,x:n.x,y:n.y,moved:false};try{svg.setPointerCapture(ev.pointerId);}catch(_){}ev.preventDefault();});
root.addEventListener('pointermove',ev=>{if(!dragging)return;const {svg,grp,sx,sy,x,y}=dragging,p=svgPos(svg,ev);const dx=p.x-sx,dy=p.y-sy;if(Math.abs(dx)+Math.abs(dy)>8)dragging.moved=true;if(!dragging.moved)return;grp.setAttribute('transform',`translate(${clamp(x+dx,75,925)} ${clamp(y+dy,70,395)})`);});
root.addEventListener('pointerup',ev=>{if(!dragging)return;const d=dragging;dragging=null;const p=svgPos(d.svg,ev);if(d.moved&&!state.wiring){const n=get(d.id);if(n){n.x=clamp(d.x+p.x-d.sx,75,925);n.y=clamp(d.y+p.y-d.sy,70,395);save();render();}}else chooseNode(d.id);});
root.addEventListener('pointercancel',()=>{dragging=null;});
root.addEventListener('keydown',ev=>{if(!root.querySelector('.em-app'))return;if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest('[data-em-node]')){ev.preventDefault();chooseNode(ev.target.closest('[data-em-node]').dataset.emNode);}else if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest('[data-em-edge]')){ev.preventDefault();ev.target.closest('[data-em-edge]').dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
/* v0.6 — animated packet route. Replays a ping trace on the topology map:
 * ARP broadcasts ripple out, the echo request travels hop by hop (teal lane), the reply returns (purple lane),
 * routers pulse when they look up a route, and the finished route stays drawn as a two-lane trail.
 */
var RA=null,routeSpeed=1;
const RA_COLORS={request:'#4de6bf',reply:'#b99dff',arpq:'#f6b46a',arpr:'#f6b46a',error:'#ff8a8a',success:'#7dffc8',pulse:'#9fd8ff'};
function raReduced(){return document.documentElement.classList.contains('rm')||matchMedia('(prefers-reduced-motion: reduce)').matches;}
function raTimeline(trace){const out=[];let phase='request';
 trace.events.forEach((e,i)=>{if(e.type==='start')phase=/reply/i.test(e.title)?'reply':'request';
  const ids=(e.path||[]).filter(id=>get(id)),pts=ids.map(id=>({x:get(id).x,y:get(id).y,id}));
  let kind='pulse',label='';
  if(e.type==='arp'&&pts.length>1){kind=e.l2?.dst==='FF:FF:FF:FF:FF:FF'?'arpq':'arpr';label=kind==='arpq'?'ARP ?':'ARP ✓';}
  else if(e.type==='frame'&&pts.length>1){kind=phase;label=phase==='request'?'PING':'REPLY';}
  else if(e.type==='error'){kind='error';label='✕ Stopped';}
  else if(e.type==='success'){kind='success';label='✓ Reply received';}
  else label={start:phase==='request'?'Start':'Reply starts',route:'Route lookup',router:'Forward',receive:'Received!',cache:'Already known'}[e.type]||e.type;
  const moving=['request','reply','arpq','arpr'].includes(kind);
  out.push({i,kind,label,pts:kind==='pulse'&&e.type==='cache'?pts.slice(0,1):pts,phase,moving,dur:moving?(pts.length-1)*720:(kind==='success'?1800:kind==='error'?2200:1150)});});
 return out;}
function startRoute(trace){if(!trace||!trace.events?.length){RA=null;return;}RA={trace,tl:raTimeline(trace),idx:0,el:0,last:0,playing:true,done:false,trail:[]};state.step=RA.tl[0].i;requestAnimationFrame(raTick);}
function raTick(now){if(!RA||!RA.playing)return;if(RA.trace!==state.trace){RA=null;return;}
 const dt=RA.last?Math.min(80,now-RA.last):16;RA.last=now;RA.el+=dt*routeSpeed;const s=RA.tl[RA.idx];
 const hold=raReduced()&&s.moving?1100:s.dur;
 if(RA.el>=hold){if(s.kind==='request'||s.kind==='reply')RA.trail.push({pts:s.pts,phase:s.kind});RA.idx++;RA.el=0;
  if(RA.idx>=RA.tl.length){RA.idx=RA.tl.length-1;RA.playing=false;RA.done=true;RA.last=0;raSync();paintRoute();return;}
  raSync();}
 paintRoute();requestAnimationFrame(raTick);}
function raSync(){if(!RA)return;state.step=RA.tl[RA.idx].i;const j=root.querySelector('.em-journey');if(j)j.outerHTML=resultHTML();
 const hl=state.trace?.events[state.step]?.path||[];
 root.querySelectorAll('[data-em-node]').forEach(g=>g.classList.toggle('em-lit',hl.includes(g.dataset.emNode)));
 root.querySelectorAll('[data-em-edge]').forEach(g=>{const l=state.links.find(x=>x.id===g.dataset.emEdge);g.querySelector('.em-wire')?.classList.toggle('hot',!!l&&hl.includes(l.a)&&hl.includes(l.b));});}
const raEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function raAlong(pts,p){if(pts.length<2)return pts[0];const n=pts.length-1,f=Math.min(.9999,p)*n,k=Math.floor(f),t=raEase(f-k),a=pts[k],b=pts[k+1];return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,a,b};}
function raLane(pts,off){const segs=[];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L*off,ny=dx/L*off;segs.push({x1:a.x+nx,y1:a.y+ny,x2:b.x+nx,y2:b.y+ny,ang:Math.atan2(dy,dx)*180/Math.PI});}return segs;}
function raBadge(x,y,text,color,dark,k){k=k||1;const w=Math.max(50,text.length*8.6+22)*k,hh=28*k;return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="${24*k}" fill="${color}" opacity=".22"/><rect x="${-w/2}" y="${-hh/2}" width="${w}" height="${hh}" rx="${hh/2}" fill="${color}" stroke="#fff" stroke-opacity=".75" stroke-width="${1.6*k}"/><text y="${4.6*k}" text-anchor="middle" font-size="${13.5*k}" font-weight="800" fill="${dark||'#06281f'}">${esc(text)}</text></g>`;}
function raLayer(svg,id,under){let g=svg.querySelector('#'+id);if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id=id;g.setAttribute('pointer-events','none');const first=svg.querySelector('[data-em-node]');if(under&&first)svg.insertBefore(g,first);else svg.append(g);}return g;}
function paintRoute(){const svg=root.querySelector('#em-svg');if(!svg)return;
 if(!RA||RA.trace!==state.trace){svg.querySelector('#em-route-under')?.remove();svg.querySelector('#em-route-over')?.remove();svg.classList.remove('em-playing');return;}
 const under=raLayer(svg,'em-route-under',true),over=raLayer(svg,'em-route-over',false);svg.classList.toggle('em-playing',RA.playing);
 const k=Math.max(1,Math.min(2.1,1000/(svg.getBoundingClientRect().width||1000)));
 const reduce=raReduced(),s=RA.tl[RA.idx],hold=reduce&&s.moving?1100:s.dur,p=Math.min(1,RA.el/hold);let lo='',out='';
 // two-lane trail under the devices: request on one side of each cable, reply on the other
 for(const tr of RA.trail){const off=(tr.phase==='request'?-8:8)*k,c=RA_COLORS[tr.phase];for(const g of raLane(tr.pts,off)){lo+=`<line x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}" stroke="${c}" stroke-width="${5.5*k}" stroke-linecap="round" opacity=".9" ${tr.phase==='reply'?`stroke-dasharray="${13*k} ${8*k}"`:''}/>`;const f=tr.phase==='request'?.38:.62,mx=g.x1+(g.x2-g.x1)*f,my=g.y1+(g.y2-g.y1)*f;if(Math.hypot(g.x2-g.x1,g.y2-g.y1)>150)lo+=`<path d="M-5 -6 L4 0 L-5 6" transform="translate(${mx} ${my}) rotate(${g.ang}) scale(${k})" fill="none" stroke="#06281f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;}}
 if(!RA.manual&&(RA.playing||!RA.done)){const c=RA_COLORS[s.kind]||RA_COLORS.pulse;
  if(s.moving&&s.pts.length>1){const pos=reduce?s.pts.at(-1):raAlong(s.pts,p);
   if(s.kind==='arpq'){const o=s.pts[0];for(const d of [0,.33,.66]){const q=reduce?.4:(p+d)%1;lo+=`<circle cx="${o.x}" cy="${o.y}" r="${40+q*110}" fill="none" stroke="${c}" stroke-width="${2.5*k}" opacity="${(1-q)*.85}"/>`;}}
   if(!reduce)for(let t=1;t<=4;t++){const g=raAlong(s.pts,Math.max(0,p-t*.03));out+=`<circle cx="${g.x}" cy="${g.y}" r="${(8-t*1.5)*k}" fill="${c}" opacity="${.55-t*.12}"/>`;}
   out+=raBadge(pos.x,pos.y,s.label,c,null,k);}
  else if(s.pts.length){const pulse=reduce?.5:p;for(const pt of (s.kind==='success'?s.pts:s.pts.slice(-1))){lo+=`<circle cx="${pt.x}" cy="${pt.y}" r="${60+pulse*40}" fill="none" stroke="${c}" stroke-width="${3*k}" opacity="${(1-pulse)*.9}"/>`;out+=`<rect x="${pt.x-67}" y="${pt.y-42}" width="134" height="86" rx="20" fill="none" stroke="${c}" stroke-width="${2.5*k}" opacity=".8"/>`;}
   const pt=s.pts.at(-1);out+=raBadge(pt.x,Math.max(26*k,pt.y-62-6*k),s.label,c,s.kind==='error'?'#3a0d0d':undefined,k);}}
 // a failed ping keeps a red marker where the packet stopped
 if(RA.done&&!state.trace.success){const e=[...state.trace.events].reverse().find(x=>x.status==='bad'&&x.path?.length),n=e&&get(e.path.at(-1));if(n){out+=`<rect x="${n.x-68}" y="${n.y-43}" width="136" height="88" rx="20" fill="none" stroke="${RA_COLORS.error}" stroke-width="${3*k}"/>`+raBadge(n.x,Math.max(26*k,n.y-62-6*k),'✕ Stopped here',RA_COLORS.error,'#3a0d0d',k);}}
 // caption: what is happening right now
 const ev=state.trace.events[state.step],cap=RA.done&&!RA.manual?(state.trace.success?'✓ Route complete · solid = request, dashed = reply':'✕ The packet stopped · read the red step below'):`Step ${state.step+1} of ${state.trace.events.length} · ${ev?.title||''}`;
 const fs=13.5*k,w=Math.min(960,cap.length*fs*.56+30*k),hh=34*k;out+=`<g transform="translate(14 12)"><rect width="${w}" height="${hh}" rx="${9*k}" fill="#0a1626" stroke="${RA.done&&!RA.manual?(state.trace.success?'#4de6bf':'#ff8a8a'):'#3f6482'}" stroke-width="${1.5*k}" opacity=".96"/><text x="${14*k}" y="${hh/2+fs*.36}" font-size="${fs}" font-weight="700" fill="#e9f6ff">${esc(cap)}</text></g>`;
 under.innerHTML=lo;over.innerHTML=out;}
function playControls(){if(!state.trace)return '';const r=RA&&RA.trace===state.trace?RA:null,label=r?.playing?'❚❚ Pause':r?.manual&&!r.done?'▶ Resume from here':r&&!r.done?'▶ Resume':r?.done?'↻ Replay route':'▶ Play route';
 return `<div class="em-play" role="group" aria-label="Route animation"><button class="em-button em-primary" data-em-anim="toggle">${label}</button><span class="em-speed">${[[.5,'Slow'],[1,'Normal'],[2,'Fast']].map(([v,t])=>`<button class="${routeSpeed===v?'on':''}" data-em-anim="speed" data-speed="${v}" aria-pressed="${routeSpeed===v}">${t}</button>`).join('')}</span></div>`;}
root.addEventListener('click',e=>{const stepBtn=e.target.closest('[data-em-step],[data-em="prev"],[data-em="next"]');if(stepBtn&&RA&&RA.trace===state.trace){RA.playing=false;RA.manual=true;RA.last=0;}
 const b=e.target.closest('[data-em-anim]');if(!b)return;e.stopPropagation();
 if(b.dataset.emAnim==='speed'){routeSpeed=Number(b.dataset.speed)||1;}
 else if(!RA||RA.trace!==state.trace||RA.done){startRoute(state.trace);}
 else if(RA.playing){RA.playing=false;RA.last=0;}else{if(RA.manual){const k=RA.tl.findIndex(x=>x.i>=state.step);RA.idx=k<0?0:k;RA.el=0;RA.manual=false;RA.trail=RA.tl.slice(0,RA.idx).filter(x=>x.kind==='request'||x.kind==='reply').map(x=>({pts:x.pts,phase:x.kind}));state.step=RA.tl[RA.idx].i;raSync();}RA.playing=true;RA.last=0;requestAnimationFrame(raTick);}
 const j=root.querySelector('.em-journey');if(j)j.outerHTML=resultHTML();paintRoute();},true);

window.ATLAS_LAB={render,open:id=>setMission(id)};
})();
