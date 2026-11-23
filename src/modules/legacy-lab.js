/* Network Atlas: deliberately limited instructional networking simulation.
 * NOT Cisco Packet Tracer, a packet capture, IOS emulator, or an exam-lab grader.
 * Version 0.3: host/switch/router, one access-VLAN per switch port, IPv4 only.
 */
(function () {
  'use strict';
  const root = document.getElementById('main');
  const KEY = 'network-atlas-lab-v3';
  const esc = x => String(x ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const labTerms=(window.ATLAS_GLOSSARY||[]).filter(t=>['mac address','default gateway','ipv4','subnet','router','switch','ethernet','arp','icmp','vlan','ping','packet','frame','broadcast','network address','prefix length'].includes(String(t.term).toLowerCase())).sort((a,b)=>b.term.length-a.term.length);
  const glossaryRe=new RegExp('\\b(?:'+labTerms.map(t=>t.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
  const termHTML=v=>{let out='',last=0,raw=String(v||'');glossaryRe.lastIndex=0;for(const m of raw.matchAll(glossaryRe)){const t=labTerms.find(x=>x.term.toLowerCase()===m[0].toLowerCase());if(!t)continue;out+=esc(raw.slice(last,m.index))+`<span class="glossary-link" role="button" tabindex="0" data-glossary="${t.id}" aria-label="Define ${esc(t.term)}">${esc(m[0])}</span>`;last=m.index+m[0].length;}return out+esc(raw.slice(last));};
  const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  const ipNum = ip => {
    if (!IPV4.test(String(ip))) return null;
    const a=String(ip).split('.').map(Number);
    if (a.some(v=>v<0||v>255)) return null;
    return (((a[0]<<24)>>>0)+(a[1]<<16)+(a[2]<<8)+a[3])>>>0;
  };
  const numIp = x => [24,16,8,0].map(s=>(x>>>s)&255).join('.');
  const maskNum = p => p===0?0:(0xffffffff<<(32-p))>>>0;
  const validPrefix = p => Number.isInteger(Number(p)) && Number(p)>=1 && Number(p)<=30;
  const subnet = (ip,prefix) => {
    const n=ipNum(ip),p=Number(prefix);
    if(n===null || !validPrefix(prefix))return null;
    const m=maskNum(p),nw=(n&m)>>>0,b=((nw|((~m)>>>0))>>>0);
    return {network:numIp(nw),broadcast:numIp(b),mask:numIp(m),first:numIp((nw+1)>>>0),last:numIp((b-1)>>>0),hosts:Math.pow(2,32-p)-2,prefix:p,networkNum:nw};
  };
  const onSubnet=(ip,networkOwner,prefix)=>{
    const i=ipNum(ip),n=ipNum(networkOwner),p=Number(prefix);
    return i!==null&&n!==null&&validPrefix(prefix)&&((i&maskNum(p))>>>0)===((n&maskNum(p))>>>0);
  };
  const mac = n => '02:AC:10:'+('0'+(n>>16&255).toString(16)).slice(-2)+':'+('0'+(n>>8&255).toString(16)).slice(-2)+':'+('0'+(n&255).toString(16)).slice(-2);
  const positions={leftPC:{x:100,y:195},middle:{x:305,y:195},rightPC:{x:530,y:195},router:{x:405,y:310},switchB:{x:640,y:310},pcB:{x:835,y:310}};
  let idCounter=25;
  const pc=(id,label,x,y,ip,prefix='24',gateway='')=>({id,label,kind:'pc',x,y,ports:[{name:'Eth0',mac:mac(idCounter++),ip,prefix,gateway}],});
  const sw=(id,label,x,y)=>({id,label,kind:'switch',x,y,ports:Array.from({length:8},(_,i)=>({name:'Fa0/'+(i+1),vlan:1}))});
  const rt=(id,label,x,y)=>({id,label,kind:'router',x,y,ports:[{name:'Gi0/0',ip:'192.168.10.1',prefix:'24',mac:mac(idCounter++)},{name:'Gi0/1',ip:'192.168.20.1',prefix:'24',mac:mac(idCounter++)}]});
  const edge=(a,ap,b,bp)=>({id:'e'+Math.random().toString(36).slice(2,9),a,ap,b,bp});
  const PRESETS={
    same:{title:'One local network',hint:'Both PCs use the same /24. The switch forwards Ethernet frames; no router is needed.',make(){
      const a=pc('pc1','PC-A',90,230,'192.168.10.10'),b=pc('pc2','PC-B',690,230,'192.168.10.11'),s=sw('sw1','SW-1',395,230);
      return{nodes:[a,s,b],edges:[edge('pc1','Eth0','sw1','Fa0/1'),edge('pc2','Eth0','sw1','Fa0/2')],from:'pc1',to:'pc2'};}},
    routed:{title:'Across two networks',hint:'Each PC sends off-subnet traffic to its gateway. Router interfaces belong to different IP networks.',make(){
      const a=pc('pc1','PC-A',70,130,'192.168.10.10','24','192.168.10.1'),b=pc('pc2','PC-B',780,130,'192.168.20.10','24','192.168.20.1'),s1=sw('sw1','SW-1',275,130),s2=sw('sw2','SW-2',570,130),r=rt('r1','R-1',422,325);
      return{nodes:[a,s1,r,s2,b],edges:[edge('pc1','Eth0','sw1','Fa0/1'),edge('r1','Gi0/0','sw1','Fa0/2'),edge('r1','Gi0/1','sw2','Fa0/1'),edge('pc2','Eth0','sw2','Fa0/2')],from:'pc1',to:'pc2'};}},
    gateway:{title:'Broken default gateway',hint:'PC-A has the wrong gateway (192.168.10.254). Correct it to reach PC-B through the router.',make(){
      const p=PRESETS.routed.make();p.nodes.find(n=>n.id==='pc1').ports[0].gateway='192.168.10.254';return p;}},
    vlan:{title:'VLAN isolation',hint:'Both PCs are addressed within one subnet, but switch access ports belong to different VLANs. They cannot ARP each other.',make(){
      const p=PRESETS.same.make();p.nodes.find(n=>n.id==='sw1').ports[1].vlan=20;return p;}}
  };
  const defaultLab=()=>({...PRESETS.same.make(),selected:'pc1',connecting:false,preset:'same'});
  let lab=defaultLab();
  let state={tab:'topology',steps:[],stepIndex:-1,chosen:'',output:'',cliHistory:[],cliCursor:0,cli:{mode:'user',iface:'',hostname:'Router',saved:false,ports:[{name:'GigabitEthernet0/0',ip:'',mask:'',admin:false,carrier:true},{name:'GigabitEthernet0/1',ip:'',mask:'',admin:false,carrier:false}]},practiceIndex:0,guessNetwork:'',guessBroadcast:'',result:null};
  const practice=[{ip:'192.168.10.34',prefix:27},{ip:'10.3.18.87',prefix:20},{ip:'172.16.5.220',prefix:26},{ip:'192.168.77.129',prefix:25},{ip:'10.0.0.65',prefix:28},{ip:'172.20.4.99',prefix:23},{ip:'192.168.1.254',prefix:29},{ip:'10.8.40.1',prefix:22}];
  const getNode=id=>lab.nodes.find(n=>n.id===id);
  const portOf=(node,name)=>node?.ports.find(p=>p.name===name);
  const linked=(id,port)=>lab.edges.find(e=>(e.a===id&&e.ap===port)||(e.b===id&&e.bp===port));
  const portAt=(id,port)=>{const n=getNode(id);return portOf(n,port);};
  const endpointIface=(id,name)=>{const node=getNode(id),port=portOf(node,name);return node&&port?{node,port,id,portName:name}:null;};
  const neighbor=(id,p)=>{
    const e=linked(id,p);if(!e)return null;
    return e.a===id?endpointIface(e.b,e.bp):endpointIface(e.a,e.ap);
  };
  // This is intentionally a one-switch-per-segment access-VLAN model; no trunks/STP/multi-switch routing.
  function segment(ep){
    const other=neighbor(ep.id,ep.portName);
    if(!other)return {peers:[],sw:null,ingress:null,reason:'This interface is not connected.'};
    if(other.node.kind==='switch'){
      const vl=Number(other.port.vlan),swNode=other.node;
      const peers=lab.edges.flatMap(e=>[e.a===swNode.id?{peer:endpointIface(e.b,e.bp),sp:e.ap}:null,e.b===swNode.id?{peer:endpointIface(e.a,e.ap),sp:e.bp}:null].filter(Boolean))
        .filter(x=>x.peer?.node.kind!=='switch' && Number(portOf(swNode,x.sp)?.vlan)===vl)
        .map(x=>({ep:x.peer,switchPort:x.sp}));
      return {peers,sw:swNode,ingress:other.portName,vlan:vl};
    }
    if(other.node.kind!=='switch')return {peers:[{ep},{ep:other}],sw:null,ingress:null,vlan:1};
    return {peers:[],sw:null,ingress:null,reason:'Only directly connected hosts and access switches are modeled.'};
  }
  function portConfigOK(ep){const p=ep.port;const s=subnet(p.ip,p.prefix);if(!s)return `IP configuration is invalid on ${ep.node.label} ${ep.portName}.`;const n=ipNum(p.ip);const nw=ipNum(s.network),br=ipNum(s.broadcast);if(n===nw||n===br)return `${ep.node.label} uses a subnet network/broadcast address rather than a usable host address.`;return null;}
  const tracePing=(sourceId,targetId)=>{
    const steps=[], macTables={};const add=(type,info,ids=[],pass=true)=>steps.push({type,info,ids,pass});
    const fail=(message,ids=[])=>{add('BLOCKED',message,ids,false);return {steps,success:false,macTables};};
    const source=getNode(sourceId),target=getNode(targetId);
    if(!source||!target||source.kind!=='pc'||target.kind!=='pc')return fail('Choose two PCs. A router and a switch are forwarding devices, not ping endpoints in this beginner lab.');
    if(source.id===target.id)return fail('Choose a different destination PC.');
    const record=(seg,iface)=>{if(seg.sw){if(!macTables[seg.sw.id])macTables[seg.sw.id]={};macTables[seg.sw.id][iface.port.mac]=seg.ingress;}};
    for(const n of lab.nodes)if(n.kind!=='switch')for(const p of n.ports)if(linked(n.id,p.name)){const e=endpointIface(n.id,p.name),err=portConfigOK(e);if(err)return fail(err,[n.id]);}
    function arp(src,askedIp,context){
      const sg=segment(src);if(!sg.peers.length)return {error:`${src.node.label} has no link to its local Ethernet segment.`};
      if(sg.sw){record(sg,src);add('ARP',`${context}: ${src.node.label} broadcasts “Who has ${askedIp}?” in access VLAN ${sg.vlan}. ${sg.sw.label} learns source MAC ${src.port.mac} on ${sg.ingress}, then floods the ARP request within that VLAN.`,[src.id,sg.sw.id]);}
      else add('ARP',`${context}: ${src.node.label} broadcasts an ARP request for ${askedIp} across its direct Ethernet link.`,[src.id]);
      const matches=sg.peers.map(x=>x.ep).filter(e=>e.id!==src.id && e.port.ip===askedIp);
      if(matches.length===0)return {error:`Nobody in ${src.node.label}'s Layer 2 segment answered ARP for ${askedIp}. Check cabling, access VLAN, IP address, and the default gateway.`};
      if(matches.length>1)return {error:`Duplicate IP ${askedIp} detected on this segment. Fix the address conflict.`};
      const dest=matches[0];if(sg.sw){const dseg=segment(dest);record(dseg,dest);}
      add('ARP reply',`${dest.node.label} replies “${askedIp} is ${dest.port.mac}.” ${src.node.label} can now send a unicast Ethernet frame.`,sg.sw?[src.id,sg.sw.id,dest.id]:[src.id,dest.id]);
      return {dest,seg:sg};
    }
    function oneWay(from,to,label){
      const fromIface=endpointIface(from.id,'Eth0'),targetIface=endpointIface(to.id,'Eth0');
      let current=fromIface;if(!segment(current).peers.length)return `${from.label} is not connected to a usable Ethernet segment.`;
      const same=onSubnet(to.ports[0].ip,from.ports[0].ip,from.ports[0].prefix);
      const nextIp=same?to.ports[0].ip:from.ports[0].gateway;
      if(!same&&ipNum(nextIp)===null)return `${from.label} has no valid default gateway for destination ${to.ports[0].ip}.`;
      if(!same&&!onSubnet(nextIp,from.ports[0].ip,from.ports[0].prefix))return `${from.label}'s default gateway ${nextIp} is outside the host's configured IPv4 subnet. Set a reachable on-link gateway.`;
      const first=arp(current,nextIp,label+' first hop');if(first.error)return first.error;
      const hop=first.dest;
      if(same){
        if(hop.id!==to.id)return `Unexpected IP conflict: ${nextIp} did not resolve to ${to.label}.`;
        add('Ethernet + ICMP',`${from.label} sends an Ethernet frame to ${hop.port.mac}. Inside that frame is an IPv4 packet with an ICMP ${label} for ${to.ports[0].ip}. The switch forwards using its learned MAC table.`,first.seg.sw?[from.id,first.seg.sw.id,to.id]:[from.id,to.id]);
        return null;
      }
      if(hop.node.kind!=='router')return `${nextIp} resolves to ${hop.node.label}, not a router. There is no working default-gateway route.`;
      add('Gateway',`${from.label} sends the IPv4 packet to ${hop.node.label}'s MAC ${hop.port.mac}; the IPv4 destination remains ${to.ports[0].ip}. Only the Ethernet next-hop destination is the router.`,first.seg.sw?[from.id,first.seg.sw.id,hop.id]:[from.id,hop.id]);
      const choices=hop.node.ports.filter(p=>linked(hop.id,p.name)&&onSubnet(to.ports[0].ip,p.ip,p.prefix));
      if(choices.length===0)return `${hop.node.label} has no directly connected interface for ${to.ports[0].ip}. Static/dynamic routes are outside this mini lab.`;
      if(choices.length!==1)return `${hop.node.label} has overlapping directly connected interfaces for ${to.ports[0].ip}; simplify the configuration.`;
      const out=endpointIface(hop.id,choices[0].name);
      if(out.portName===hop.portName)return `${hop.node.label} would need to route back out its incoming interface; this topology is outside the simplified model.`;
      add('IP routing',`${hop.node.label} chooses ${out.portName} because ${to.ports[0].ip} matches its connected subnet ${subnet(out.port.ip,out.port.prefix).network}/${out.port.prefix}. It decrements IPv4 TTL and rebuilds the outgoing Ethernet frame.`,[hop.id]);
      const second=arp(out,to.ports[0].ip,label+' router egress');if(second.error)return second.error;
      if(second.dest.id!==to.id)return `ARP for the destination did not resolve to ${to.label}.`;
      add('Ethernet + ICMP',`${hop.node.label} sends a new Ethernet frame toward ${to.label}. The source MAC is its ${out.portName} MAC (${out.port.mac}); the destination MAC is ${to.ports[0].mac}. The packet keeps the original IP source/destination.`,second.seg.sw?[hop.id,second.seg.sw.id,to.id]:[hop.id,to.id]);
      return null;
    }
    add('Start',`Send an ICMP Echo Request from ${source.label} (${source.ports[0].ip}) to ${target.label} (${target.ports[0].ip}). ARP caches start empty for every simulation run.`,[source.id]);
    let error=oneWay(source,target,'Echo Request');if(error)return fail(error,[source.id]);
    add('Destination',`${target.label} receives the Echo Request and prepares an ICMP Echo Reply. A successful ping requires a working return path.`,[target.id]);
    error=oneWay(target,source,'Echo Reply');if(error)return fail(`Request arrived, but the reply failed: ${error}`,[target.id]);
    add('Success',`Echo Reply reaches ${source.label}. Ping succeeds. ARP and MAC learning were shown as separate steps; this is an educational trace, not a byte-accurate packet capture.`,[source.id,target.id]);
    return {steps,success:true,macTables};
  };
  const defaultView=()=>state.tab==='topology'?'Topology builder':state.tab==='cli'?'IOS command practice':'Subnetting trainer';
  function mapSVG(){
    const nodes=lab.nodes.map(n=>{
      const label=n.label;const isActive=(state.steps[state.stepIndex]?.ids||[]).includes(n.id);
      const cls=n.kind==='pc'?'pc':n.kind==='switch'?'switch':'router';
      const symbol=n.kind==='pc'?'▣':n.kind==='switch'?'▤':'⬡';
      return `<g class="sim-node ${cls} ${isActive?'lit':''} ${lab.selected===n.id?'selected':''}" data-lab-select="${esc(n.id)}" role="button" tabindex="0" aria-label="Select ${esc(n.label)}"><circle cx="${n.x}" cy="${n.y}" r="33"/><text x="${n.x}" y="${n.y+11}" class="sim-node-icon" text-anchor="middle">${symbol}</text><text x="${n.x}" y="${n.y+53}" class="sim-device-label" text-anchor="middle">${esc(label)}</text></g>`;
    }).join('');
    const cables=lab.edges.map(e=>{
      const a=getNode(e.a),b=getNode(e.b);if(!a||!b)return '';
      const active=state.steps[state.stepIndex]?.ids||[];return `<g><line class="sim-cable ${active.includes(a.id)&&active.includes(b.id)?'live':''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><text x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2-9}" class="sim-port-label" text-anchor="middle">${esc(e.ap)} ⇄ ${esc(e.bp)}</text></g>`;}).join('');
    return `<svg class="sim-canvas" viewBox="0 0 920 430" role="img" aria-label="Network topology. Select devices to inspect and edit their interfaces."><defs><pattern id="simGrid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#254257"/></pattern></defs><rect width="920" height="430" fill="url(#simGrid)"/>${cables}${nodes}</svg>`;
  }
  const inputField=(label,key,val,prefix,name)=>`<label class="sim-input"><span>${esc(label)}</span><input data-lab-edit="${esc(key)}" data-node="${esc(prefix)}" data-port="${esc(name)}" value="${esc(val)}" autocomplete="off" spellcheck="false" /></label>`;
  function inspector(){const n=getNode(lab.selected);if(!n)return '<p>Select a device to inspect its configuration.</p>';
    return `<div class="sim-inspector-head"><div><span class="eyebrow">SELECTED DEVICE</span><h3>${esc(n.label)}</h3></div><span class="pill neutral">${n.kind.toUpperCase()}</span></div><div class="sim-inspector-fields">${n.ports.map(p=>`<div class="sim-port"><b>${esc(p.name)}</b>${n.kind==='switch'?inputField('Access VLAN (1–4094)','vlan',p.vlan,n.id,p.name):`${inputField('IPv4 address','ip',p.ip,n.id,p.name)}${inputField('Prefix length (/1–/30)','prefix',p.prefix,n.id,p.name)}${n.kind==='pc'?inputField('Default gateway','gateway',p.gateway,n.id,p.name):''}<small>MAC ${esc(p.mac)}</small>`}</div>`).join('')}</div><div class="sim-help">Change a value, then press <b>Apply changes</b>. A switch uses untagged access ports only in this introductory model.</div><button class="secondary-btn" data-lab="apply">Apply changes</button>`;
  }
  function renderTopology(){const step=state.steps[state.stepIndex];return `<div class="sim-presets"><label>Practice scenario<select data-lab-preset>${Object.entries(PRESETS).map(([id,p])=>`<option value="${id}" ${lab.preset===id?'selected':''}>${esc(p.title)}</option>`).join('')}</select></label><p>${termHTML(PRESETS[lab.preset]?.hint||'Build and test your network.')}</p></div><div class="sim-workspace"><div class="sim-map-area"><div class="sim-toolbar"><span>ADD A DEVICE</span><button data-lab="add-pc">+ PC</button><button data-lab="add-switch">+ Switch</button><button data-lab="add-router">+ Router</button><button data-lab="connect" class="${lab.connecting?'armed':''}">${lab.connecting?'Select two devices':'🔌 Connect'}</button><button data-lab="reset">Reset</button></div><div class="sim-map-frame">${mapSVG()}</div><p class="sim-hint">Click a device to edit it. Use <b>Connect</b>, then select two devices. Supported links: PC ↔ switch, router ↔ switch. The simulator does not model trunks, STP, or router-to-router links.</p></div><div class="sim-inspector panel">${inspector()}</div></div><div class="sim-controls panel"><div><h3>Send a ping</h3><p>Watch how ARP, Ethernet MAC addresses, routers, and ICMP work together.</p></div><label>From<select data-lab-from>${lab.nodes.filter(n=>n.kind==='pc').map(n=>`<option value="${esc(n.id)}" ${lab.from===n.id?'selected':''}>${esc(n.label)}</option>`).join('')}</select></label><label>To<select data-lab-to>${lab.nodes.filter(n=>n.kind==='pc').map(n=>`<option value="${esc(n.id)}" ${lab.to===n.id?'selected':''}>${esc(n.label)}</option>`).join('')}</select></label><button class="primary-btn small" data-lab="send">▶ Run ping</button></div><div class="panel sim-trace"><div class="sim-trace-head"><h3>Packet journey</h3><div><button data-lab="prev" ${state.stepIndex<=0?'disabled':''}>← Previous</button><button data-lab="next" ${state.stepIndex>=state.steps.length-1?'disabled':''}>Next step →</button></div></div>${step?`<div class="sim-step-label"><span>STEP ${state.stepIndex+1} OF ${state.steps.length}</span><strong class="${step.pass?'':'sim-error'}">${esc(step.type)}</strong></div><p>${termHTML(step.info)}</p>`:'<p>Select source and destination PCs, then click Run ping. Events will appear here, one step at a time.</p>'}<div class="sim-timeline">${state.steps.map((x,i)=>`<button data-lab-step="${i}" aria-label="Jump to step ${i+1}" title="${esc(x.type)}" class="${i===state.stepIndex?'active':''} ${x.pass?'':'failed'}"></button>`).join('')}</div><small>Simulation assumptions: IPv4 only, one access-VLAN per switch port, one router hop, directly connected router subnets, fresh ARP cache each run. No IOS, STP, wireless, NAT, trunks, or routing protocols.</small></div>${Object.keys(state.macTables||{}).length?`<div class="panel"><h3>Learned switch MAC table (this ping run)</h3>${Object.entries(state.macTables).map(([id,table])=>`<div class="sim-mac-table"><b>${esc(getNode(id)?.label||id)}</b>${Object.entries(table).map(([addr,port])=>`<div><code>${esc(addr)}</code><span>${esc(port)}</span></div>`).join('')}</div>`).join('')}</div>`:''}`;}
  const cliPrompt=()=>state.cli.mode==='user'?`${state.cli.hostname}>`:state.cli.mode==='priv'?`${state.cli.hostname}#`:state.cli.mode==='config'?`${state.cli.hostname}(config)#`:`${state.cli.hostname}(config-if)#`;
  const selectedIface=()=>state.cli.ports.find(p=>p.name===state.cli.iface);
  const linkStatus=p=>p.admin?(p.carrier?'up':'down'):'administratively down';
  const cliHelp='Try: enable, configure terminal, interface GigabitEthernet0/0, ip address 192.168.10.1 255.255.255.0, no shutdown, end, show ip interface brief, show ip route, copy running-config startup-config';
  function command(line){
    const text=String(line).trim();if(!text)return '';const cmd=text.replace(/\s+/g,' '),low=cmd.toLowerCase(),c=state.cli;
    if(low==='?'||low==='help')return cliHelp;
    if(low==='exit'){if(c.mode==='iface'){c.mode='config';c.iface='';}else if(c.mode==='config')c.mode='priv';else if(c.mode==='priv')c.mode='user';return '';}if(low==='end'&&['config','iface'].includes(c.mode)){c.mode='priv';c.iface='';return '';}
    if(low==='enable'&&c.mode==='user'){c.mode='priv';return '';}if(low==='disable'&&c.mode==='priv'){c.mode='user';return '';}
    if(['configure terminal','conf t'].includes(low)&&c.mode==='priv'){c.mode='config';return 'Enter configuration commands, one per line. End with CNTL/Z.';}
    if(low.startsWith('hostname ')&&c.mode==='config'){const v=cmd.slice(9).trim();if(!/^[a-z][a-z0-9-]{0,19}$/i.test(v))return '% Invalid hostname in this teaching simulator.';c.hostname=v;return '';}
    if(low.startsWith('interface ')&&c.mode==='config'){
      const arg=low.slice(10).trim();const p=c.ports.find(x=>x.name.toLowerCase()===arg||x.name.toLowerCase().replace('gigabitethernet','gi')===arg||x.name.toLowerCase().replace('gigabitethernet','g')===arg);
      if(!p)return '% Interface not modeled. Try interface GigabitEthernet0/0 or GigabitEthernet0/1.';c.mode='iface';c.iface=p.name;return '';
    }
    if(low.startsWith('ip address ')&&c.mode==='iface'){
      const m=cmd.match(/^ip address\s+(\S+)\s+(\S+)$/i);
      if(!m)return '% Usage: ip address A.B.C.D 255.255.255.0';
      const addr=ipNum(m[1]),mask=ipNum(m[2]);if(addr===null||mask===null)return '% Invalid IPv4 address or subnet mask.';
      const ones=mask.toString(2).padStart(32,'0');if(!/^1*0*$/.test(ones)||!ones.includes('1'))return '% Invalid noncontiguous subnet mask.';
      const pr=ones.indexOf('0')===-1?32:ones.indexOf('0');if(pr<1||pr>30)return '% This beginner lab supports masks /1 through /30.';
      const s=subnet(m[1],pr);if(s.network===m[1]||s.broadcast===m[1])return '% Interface address must be a usable host address.';
      const p=selectedIface();p.ip=m[1];p.mask=m[2];c.saved=false;return '';
    }
    if(['no shutdown','shutdown'].includes(low)&&c.mode==='iface'){const p=selectedIface();p.admin=low==='no shutdown';c.saved=false;return `%LINK-5-CHANGED: Interface ${p.name}, changed state to ${linkStatus(p)} (virtual cable: ${p.carrier?'connected':'disconnected'}).`;}
    if(low==='show ip interface brief'&&['priv','user'].includes(c.mode))return 'Interface                 IP-Address       OK? Method Status                  Protocol\n'+c.ports.map(p=>`${p.name.padEnd(26)}${(p.ip||'unassigned').padEnd(17)}YES manual ${linkStatus(p).padEnd(23)}${p.admin&&p.carrier?'up':'down'}`).join('\n');
    if(low==='show ip route'&&['priv','user'].includes(c.mode)){
      const up=c.ports.filter(p=>p.admin&&p.carrier&&p.ip&&p.mask);return 'Codes: C - connected, L - local\nGateway of last resort is not set\n'+(up.length?up.map(p=>{const m=ipNum(p.mask),bits=m.toString(2).split('1').length-1;return `C  ${subnet(p.ip,bits).network}/${bits} is directly connected, ${p.name}\nL  ${p.ip}/32 is directly connected, ${p.name}`;}).join('\n'):'(no active IPv4 routes)');
    }
    if((low==='show running-config'||low==='show run')&&c.mode==='priv')return `Building configuration...\n!\nhostname ${c.hostname}\n!\n${c.ports.map(p=>`interface ${p.name}\n ${p.ip?`ip address ${p.ip} ${p.mask}\n `:''}${p.admin?'no shutdown':'shutdown'}\n!`).join('\n')}\nend`;
    if((low==='copy running-config startup-config'||low==='write memory')&&c.mode==='priv'){c.saved=true;return 'Building configuration...\n[SIMULATOR] Command recognized. Startup storage is not implemented; a reset or reload clears this virtual router. On real IOS, this command saves startup configuration.';}
    return `% Unrecognized or unavailable in ${c.mode} mode. Type ? for supported commands.`;
  }
  function renderCLI(){const c=state.cli;const success=c.ports[0].ip==='192.168.10.1'&&c.ports[0].mask==='255.255.255.0'&&c.ports[0].admin&&c.ports[0].carrier;
    return `<div class="sim-cli-grid"><section class="panel"><div class="sim-terminal-title">SIMULATED CISCO IOS — ROUTER CONSOLE <span class="sim-led">●</span></div><div class="sim-terminal" id="sim-terminal" role="log" aria-label="CLI session output"><pre>${esc(state.output||'Network Atlas IOS-style practice terminal\n'+cliHelp+'\n\n')}</pre></div><form class="sim-cmd-row" id="sim-cmd-form"><span id="sim-prompt">${esc(cliPrompt())}</span><input id="sim-command" aria-label="Enter Cisco IOS practice command" autocomplete="off" spellcheck="false" placeholder="Type a command…"/><button class="primary-btn small" type="submit">Enter ↵</button></form><button class="text-btn" data-lab="cli-reset">Reset virtual router</button></section><section class="panel sim-cli-guide"><span class="eyebrow">GUIDED IOS PRACTICE</span><h3>Bring up a router interface</h3><p>This is a teaching terminal with a deliberately small command set—not Cisco IOS or a substitute for real router configuration.</p><div class="sim-cli-goal"><b>Lab objective</b><p>Configure GigabitEthernet0/0 with <code>192.168.10.1 255.255.255.0</code>, issue <code>no shutdown</code>, and verify the interface.</p><span class="${success?'sim-good':'sim-pending'}">${success?'✓ Configuration goal achieved':'○ Not yet configured'}</span></div><h4>Try these commands</h4><ol><li><code>enable</code></li><li><code>configure terminal</code></li><li><code>interface GigabitEthernet0/0</code></li><li><code>ip address 192.168.10.1 255.255.255.0</code></li><li><code>no shutdown</code></li><li><code>end</code></li><li><code>show ip interface brief</code></li></ol><p class="sim-hint">GigabitEthernet0/0 has an assumed virtual cable. Gi0/1 is deliberately disconnected: <code>no shutdown</code> alone cannot bring its line protocol up. The terminal supports only a subset of IOS commands; unimplemented commands are rejected, not silently accepted.</p></section></div>`;
  }
  function renderSubnet(){const task=practice[state.practiceIndex%practice.length],info=subnet(task.ip,task.prefix);return `<div class="sim-subnet-grid"><section class="panel"><span class="eyebrow">SUBNETTING WORKOUT</span><h3>Find the network and broadcast</h3><p>One address, one prefix. Work it out before showing the answer.</p><div class="sim-subnet-question">${esc(task.ip)}<span>/${task.prefix}</span></div><div class="sim-subnet-form"><label>Network address<input data-subnet="network" value="${esc(state.guessNetwork)}" placeholder="e.g. 192.168.10.32" spellcheck="false"/></label><label>Broadcast address<input data-subnet="broadcast" value="${esc(state.guessBroadcast)}" placeholder="e.g. 192.168.10.63" spellcheck="false"/></label><button class="primary-btn small" data-lab="subnet-check">Check my answers</button><button class="secondary-btn" data-lab="subnet-next">Different problem →</button></div>${state.result?`<div class="notice-card ${state.result.correct?'sim-success':''}"><b>${state.result.correct?'✓ Both correct':'Review this worked answer'}</b><p>Network: <code>${info.network}/${task.prefix}</code><br>Mask: <code>${info.mask}</code><br>Broadcast: <code>${info.broadcast}</code><br>Usable hosts: <code>${info.first}</code> to <code>${info.last}</code> (${info.hosts.toLocaleString()} usable).</p><p>A /${task.prefix} prefix leaves ${32-task.prefix} host bits, giving ${Math.pow(2,32-task.prefix)} total addresses. Standard /1–/30 IPv4 subnets reserve the first and last for network and broadcast.</p></div>`:''}</section><section class="panel"><span class="eyebrow">WHY THIS MATTERS</span><h3>Same subnet or route?</h3><p>Subnet masks determine which destinations a device considers directly reachable and which it sends to its default gateway.</p><div class="sim-subnet-mini"><div><b>Network address</b><span>Identifies the whole IPv4 block. It is not a host address in ordinary /1–/30 LANs.</span></div><div><b>Broadcast address</b><span>Normally the final address of the IPv4 subnet; used for local broadcast.</span></div><div><b>Default gateway</b><span>A router's on-link IP address. It forwards packets destined for other IP networks.</span></div></div><p class="sim-hint">This exercise intentionally sticks to conventional /1–/30 IPv4 subnets; /31 point-to-point links and /32 host routes use different conventions and are taught later.</p></section></div>`;}
  function render(out=root){if(!out)return;out.innerHTML=`<div class="section-top"><div><span class="eyebrow">INTERACTIVE LABS · BETA</span><h1>Network Sandbox</h1><p>Practice the path a packet follows. Build a tiny network, type commands, and work out subnets without installing software.</p></div></div><div class="notice-card sim-disclaimer"><b>Training aid, not a real network emulator:</b> This is a simplified teaching model. Passing its activities does <b>not</b> unlock subjects or prove exam readiness. Use <a href="https://www.netacad.com/courses/getting-started-cisco-packet-tracer/1000" target="_blank" rel="noopener noreferrer">Cisco Packet Tracer</a> for configuration labs and deeper verification.</div><div class="filter-pills sim-tabs"><button data-lab-tab="topology" class="${state.tab==='topology'?'active':''}">◉ Packet playground</button><button data-lab-tab="cli" class="${state.tab==='cli'?'active':''}">⌨ IOS-style terminal</button><button data-lab-tab="subnet" class="${state.tab==='subnet'?'active':''}">▦ Subnetting trainer</button></div>${state.tab==='topology'?renderTopology():state.tab==='cli'?renderCLI():renderSubnet()}`;}
  function resetTrace(){state.steps=[];state.stepIndex=-1;state.macTables={};}
  const getFree=(n)=>n.ports.find(p=>!linked(n.id,p.name));
  function tryConnect(a,b){const na=getNode(a),nb=getNode(b);if(!na||!nb||a===b)return 'Select two different devices.';
    if(!((na.kind==='switch'&&nb.kind!=='switch')||(nb.kind==='switch'&&na.kind!=='switch')))return 'This beginner model supports only PC ↔ switch and router ↔ switch links.';
    const pa=getFree(na),pb=getFree(nb);if(!pa||!pb)return 'One of those devices has no free port.';
    if(lab.edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))return 'These two devices are already connected.';
    lab.edges.push(edge(a,pa.name,b,pb.name));resetTrace();return `${na.label} ${pa.name} connected to ${nb.label} ${pb.name}.`;
  }
  let chosenToConnect=null;
  function selectDevice(id){if(lab.connecting){if(!chosenToConnect){chosenToConnect=id;notify(`First endpoint: ${getNode(id).label}. Select a second device.`);return;}const msg=tryConnect(chosenToConnect,id);lab.connecting=false;chosenToConnect=null;notify(msg);}else lab.selected=id;render();}
  const notify=msg=>{const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200);}};
  function addDevice(kind){if(lab.nodes.length>=12){notify('12-device limit in this mini lab.');return;}const n=lab.nodes.filter(x=>x.kind===kind).length+1,i=lab.nodes.length,id=kind+n+Date.now().toString(36).slice(-3);let node;if(kind==='pc')node=pc(id,'PC-'+n,150+(i%4)*175,110+Math.floor(i/4)*105,`192.168.10.${30+i}`);else if(kind==='switch')node=sw(id,'SW-'+n,150+(i%4)*175,110+Math.floor(i/4)*105);else node=rt(id,'R-'+n,150+(i%4)*175,110+Math.floor(i/4)*105);lab.nodes.push(node);lab.selected=id;resetTrace();render();}
  function apply(){const updates=[];for(const input of root.querySelectorAll('[data-lab-edit]')){const n=getNode(input.dataset.node),p=portOf(n,input.dataset.port),k=input.dataset.labEdit,v=input.value.trim();if(!p)return;
      if(k==='vlan'&&(!/^\d+$/.test(v)||Number(v)<1||Number(v)>4094)){notify('VLAN must be 1–4094.');return;}
      if(k==='prefix'&&(!/^\d+$/.test(v)||!validPrefix(v))){notify('Prefix must be between /1 and /30.');return;}
      if(k==='ip'&&ipNum(v)===null){notify('Enter a valid IPv4 address.');return;}
      if(k==='gateway'&&v&&ipNum(v)===null){notify('Gateway must be blank or a valid IPv4 address.');return;}
      updates.push({p,k,value:k==='vlan'?Number(v):v});
    }
    for(const u of updates)u.p[u.k]=u.value;
    resetTrace();notify('Interface settings updated. Run ping to test.');render();}
  const renderIfActive=()=>{if(root.querySelector('.sim-tabs'))render();};
  root.addEventListener('click',ev=>{
    const tab=ev.target.closest('[data-lab-tab]');if(tab){state.tab=tab.dataset.labTab;render();return;}
    const node=ev.target.closest('[data-lab-select]');if(node){selectDevice(node.dataset.labSelect);return;}
    const step=ev.target.closest('[data-lab-step]');if(step){state.stepIndex=Number(step.dataset.labStep);render();return;}
    const btn=ev.target.closest('[data-lab]');if(!btn)return;
    const action=btn.dataset.lab;
    if(action==='reset'){const preset=PRESETS[lab.preset]||PRESETS.same;lab={...preset.make(),selected:'pc1',connecting:false,preset:lab.preset};chosenToConnect=null;resetTrace();render();return;}
    if(action==='add-pc'){addDevice('pc');return;}if(action==='add-switch'){addDevice('switch');return;}if(action==='add-router'){addDevice('router');return;}
    if(action==='connect'){lab.connecting=!lab.connecting;chosenToConnect=null;render();return;}if(action==='apply'){apply();return;}
    if(action==='send'){const result=tracePing(lab.from,lab.to);state.steps=result.steps;state.stepIndex=0;state.macTables=result.macTables;render();return;}
    if(action==='prev'){state.stepIndex=Math.max(0,state.stepIndex-1);render();return;}if(action==='next'){state.stepIndex=Math.min(state.steps.length-1,state.stepIndex+1);render();return;}
    if(action==='cli-reset'){state.cli={mode:'user',iface:'',hostname:'Router',saved:false,ports:[{name:'GigabitEthernet0/0',ip:'',mask:'',admin:false,carrier:true},{name:'GigabitEthernet0/1',ip:'',mask:'',admin:false,carrier:false}]};state.output='';render();return;}
    if(action==='subnet-check'){const p=practice[state.practiceIndex%practice.length],s=subnet(p.ip,p.prefix);state.result={correct:state.guessNetwork.trim()===s.network&&state.guessBroadcast.trim()===s.broadcast};render();return;}
    if(action==='subnet-next'){state.practiceIndex=(state.practiceIndex+1)%practice.length;state.result=null;state.guessNetwork='';state.guessBroadcast='';render();return;}
  });
  root.addEventListener('change',ev=>{const t=ev.target;if(t.matches('[data-lab-preset]')){lab={...PRESETS[t.value].make(),selected:'pc1',connecting:false,preset:t.value};chosenToConnect=null;resetTrace();render();}if(t.matches('[data-lab-from]')){lab.from=t.value;resetTrace();render();}if(t.matches('[data-lab-to]')){lab.to=t.value;resetTrace();render();}});
  root.addEventListener('input',ev=>{if(ev.target.dataset.subnet==='network')state.guessNetwork=ev.target.value;if(ev.target.dataset.subnet==='broadcast')state.guessBroadcast=ev.target.value;});
  root.addEventListener('submit',ev=>{if(ev.target.id!=='sim-cmd-form')return;ev.preventDefault();const input=root.querySelector('#sim-command');if(!input)return;const v=input.value;if(!v.trim())return;const old=cliPrompt(),result=command(v);state.output+=(state.output?'\n':'')+old+' '+v+'\n'+result;state.cliHistory.push(v);state.cliCursor=state.cliHistory.length;render();root.querySelector('#sim-command')?.focus();const terminal=root.querySelector('#sim-terminal');if(terminal)terminal.scrollTop=terminal.scrollHeight;});
  root.addEventListener('keydown',ev=>{if(ev.target.id==='sim-command'&&ev.key==='ArrowUp'){ev.preventDefault();state.cliCursor=Math.max(0,state.cliCursor-1);ev.target.value=state.cliHistory[state.cliCursor]||'';}else if(ev.target.id==='sim-command'&&ev.key==='ArrowDown'){ev.preventDefault();state.cliCursor=Math.min(state.cliHistory.length,state.cliCursor+1);ev.target.value=state.cliHistory[state.cliCursor]||'';}else if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('[data-lab-select]')){ev.preventDefault();selectDevice(ev.target.dataset.labSelect);}});
  window.ATLAS_LAB={render};
  window.ATLAS_LAB_TEST={subnet,onSubnet,ipNum,tracePing,command,presets:PRESETS,loadPreset:id=>{lab={...PRESETS[id].make(),selected:'pc1',connecting:false,preset:id};resetTrace();},getLab:()=>lab,getState:()=>state};
})();
