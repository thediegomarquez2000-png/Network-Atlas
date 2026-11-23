const fs=require('fs');const h=fs.readFileSync(process.argv[2],'utf8');
const scripts=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const bankSrc=scripts.find(s=>s.includes('window.FX_BANK=[]'));const engSrc=scripts.find(s=>s.includes('ATLAS_FINAL_TEST'));
global.window={};global.document={getElementById:()=>({addEventListener(){},querySelector(){return null}}),documentElement:{classList:{contains:()=>false}}};global.localStorage={getItem:()=>null,setItem(){}};
eval(bankSrc);eval(engSrc);const T=window.ATLAS_FINAL_TEST;let errs=0;const err=m=>{errs++;console.log('ERR',m)};
const out={};
for(const f of ['A','B','C'])for(let seed of [1,2,3,99,12345,777777]){const its=T.buildForm(f,seed);
 if(its.length!==100)err(f+' count '+its.length);const per={};its.forEach(it=>per[it.skill]=(per[it.skill]||0)+1);
 for(const [k,v] of Object.entries(per))if(v!==2)err(`${f} ${k} has ${v}`);
 const dom={};its.forEach(it=>dom[it.dom]=(dom[it.dom]||0)+1);if(seed===1)console.log(f,JSON.stringify(dom),Object.keys(per).length+' skills');
 for(const it of its){if(!it.q)err('noq '+it.skill);
  if(it.t==='mc'||it.t==='multi'){if(new Set(it.o).size!==it.o.length)err(`dup opts ${f} ${it.skill}: ${it.o}`);if(it.o.length<4)err('few opts '+it.skill);if(!T.isRight(it,it.t==='mc'?0:[...Array(it.k).keys()]))err('self mc '+it.skill);if(it.t==='mc'&&T.isRight(it,1))err('wrong ok');}
  if(it.t==='input'){for(const a of it.i)if(!T.inputOk(a,it))err(`input self fail ${it.skill}: ${a}`);if(T.inputOk('zzz 1.2.3',it))err('input accepts junk '+it.skill);}
  if(it.t==='order'&&!T.isRight(it,[...it.ord.keys()]))err('order');
  if(it.t==='match'&&!T.isRight(it,it.pr.map(p=>p[1])))err('match');
  if(['ipv4-subnet','eui64','lpm'].includes(it.skill)&&seed<=3)(out[it.skill]=out[it.skill]||[]).push({f,q:it.q,x:it.x||'',a:it.t==='input'?it.i[0]:it.o[0]});
 }}
// abbreviation & normalization checks
const mk=i=>({t:'input',i});
const cases=[['sh ip int br',['show ip interface brief'],true],['show ip int brief',['show ip interface brief'],true],['s ip int br',['show ip interface brief'],false],['ping 10.1.1.1 source lo0',['ping 10.1.1.1 source loopback0'],true],['ping 10.1.1.1 so Loopback 0',['ping 10.1.1.1 source loopback0'],true],['copy run scp://admin@10.1.1.20/r1.cfg',['copy running-config scp://admin@10.1.1.20/r1.cfg'],true],['ipv6 route ::/0 2001:DB8:FF:0::1',['ipv6 route ::/0 2001:db8:ff::1'],true],['sw trunk all vlan add 40',['switchport trunk allowed vlan add 40'],true],['switchport trunk allowed vlan 40',['switchport trunk allowed vlan add 40'],false],['channel-group 5 mode passive',['channel-group 5 mode active'],false],['int g0/1',['interface gigabitethernet0/1'],true]];
for(const [u,e,exp] of cases)if(T.inputOk(u,mk(e))!==exp)err(`abbr ${u} -> ${!exp}`);
fs.writeFileSync('/tmp/gen.json',JSON.stringify(out));console.log('errors',errs);
