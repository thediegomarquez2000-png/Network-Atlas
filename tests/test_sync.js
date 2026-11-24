// Browser test: password lock, cloud sync through a fake Claude artifact db, and Supabase sign-in + sync against a fake server.
// Usage: node tests/test_sync.js dist/index.html [shotsDir]
let pw;try{pw=require('playwright');}catch(e){pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');}
const path=require('path'),fs=require('fs');
const file='file://'+path.resolve(process.argv[2]);const shots=process.argv[3]||'shots';fs.mkdirSync(shots,{recursive:true});
const errors=[];const check=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)errors.push(m);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await pw.chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
  const watch=pg=>{pg.on('pageerror',e=>errors.push('pageerror '+e.message));return pg;};

  /* 1. Light password lock on a plain file (no cloud). */
  {const ctx=await b.newContext({viewport:{width:390,height:844}});const pg=watch(await ctx.newPage());
   await pg.goto(file);await pg.waitForTimeout(300);
   await pg.evaluate(()=>window.ATLAS_APP.jump('settings'));await pg.waitForTimeout(150);
   check(await pg.isVisible('#acct-section'),'settings shows Account & password');
   await pg.fill('#acct-new','moon42');await pg.fill('#acct-new2','moon42');await pg.click('[data-acct="set"]');await pg.waitForTimeout(400);
   const L=await pg.evaluate(()=>localStorage.getItem('network-atlas-lock-v1'));check(L&&!L.includes('moon42'),'password saved as a hash, never as text');
   const p2=watch(await ctx.newPage());await p2.goto(file);await p2.waitForTimeout(300);
   check(await p2.isVisible('text=Enter your password'),'new session asks for the password');
   check(!(await p2.evaluate(()=>!!window.ATLAS_APP)),'app does not start before unlocking');
   await p2.screenshot({path:shots+'/sync-01-lock.png'});
   await p2.fill('.boot-input','wrong');await p2.click('.boot-btn');await p2.waitForTimeout(500);
   check(await p2.isVisible('text=That is not it'),'wrong password is refused');
   await p2.waitForTimeout(400);await p2.fill('.boot-input','moon42');await p2.click('.boot-btn');await p2.waitForTimeout(600);
   check(await p2.evaluate(()=>!!window.ATLAS_APP)&&!(await p2.isVisible('.boot-screen')),'right password starts the app');
   await ctx.close();}

  /* 2. Claude artifact db: progress follows the learner to a second device. */
  const store={};
  const mockClaude=s=>{const st=s;window.__store=st;window.claude={use:n=>Promise.resolve(n==='db'?{collection:p=>({get:()=>new Promise(r=>setTimeout(()=>r({docs:Object.keys(window.__store).filter(k=>k.startsWith(p+'/')).map(k=>({id:k.slice(p.length+1),data:()=>window.__store[k]}))}),50)),doc:id=>({set:d=>{window.__store[p+'/'+id]=d;window.__pushed=(window.__pushed||0)+1;return Promise.resolve();}})})}:n==='user'?{id:()=>Promise.resolve('u1'),isOwner:()=>Promise.resolve(true)}:null)};};
  {const ctxA=await b.newContext();const A=watch(await ctxA.newPage());await A.addInitScript(mockClaude,store);await A.goto(file);await A.waitForTimeout(600);
   check(await A.evaluate(()=>window.ATLAS_SYNC.status().mode==='claude'),'inside Claude: syncs to the Claude account');
   await A.evaluate(()=>localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:['n001'],mastered:{},subjectPassed:[],recheckDue:{}})));
   await A.waitForTimeout(3500);
   const saved=await A.evaluate(()=>window.__store);Object.assign(store,saved);
   check(saved['data/users/u1/network-atlas-progress-v1']&&/n001/.test(saved['data/users/u1/network-atlas-progress-v1'].v),'progress pushed to the private per-user path');
   check(!Object.keys(saved).some(k=>/sync-/.test(k)),'sync bookkeeping never leaves the device');
   const ctxB=await b.newContext();const B=watch(await ctxB.newPage());await B.addInitScript(mockClaude,store);await B.goto(file);await B.waitForTimeout(900);
   const got=await B.evaluate(()=>localStorage.getItem('network-atlas-progress-v1'));
   check(/n001/.test(got||''),'second device loads the progress before the app starts');
   await ctxA.close();await ctxB.close();}

  /* 3. Supabase: sign up, sign in, sync, RLS-style per-user rows, change password. Fake server via page.route. */
  const SB='https://demo.supabase.test',users={},rows={};let tok=0;const sess={};
  const route=async r=>{const u=new URL(r.request().url()),m=r.request().method(),body=r.request().postData()?JSON.parse(r.request().postData()):null,auth=(r.request().headers().authorization||'').replace('Bearer ','');
    const json=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
    if(r.request().headers().apikey!=='anon-test')return json(401,{msg:'bad apikey'});
    const mk=email=>{const t='t'+(++tok);sess[t]=email;return{access_token:t,refresh_token:'r'+t,expires_in:3600,user:{id:'id-'+email,email}};};
    if(u.pathname==='/auth/v1/health')return json(200,{});
    if(u.pathname==='/auth/v1/signup'){if(users[body.email])return json(400,{msg:'User already registered'});users[body.email]=body.password;return json(200,mk(body.email));}
    if(u.pathname==='/auth/v1/token'&&u.searchParams.get('grant_type')==='password'){return users[body.email]===body.password?json(200,mk(body.email)):json(400,{error_description:'Invalid login credentials'});}
    if(u.pathname==='/auth/v1/user'&&m==='PUT'){const e=sess[auth];if(!e)return json(401,{msg:'no'});users[e]=body.password;return json(200,{});}
    if(u.pathname==='/rest/v1/atlas_progress'){const e=sess[auth];if(!e)return json(401,{msg:'JWT'});const mine=rows[e]=rows[e]||{};
      if(m==='GET')return json(200,Object.entries(mine).map(([key,x])=>({key,value:x.value,updated_ms:x.updated_ms})));
      if(m==='POST'){body.forEach(x=>{mine[x.key]={value:x.value,updated_ms:x.updated_ms};});return r.fulfill({status:201,body:''});}}
    return json(404,{msg:'nope'});};
  const cfg=()=>{window.ATLAS_SUPABASE={url:'https://demo.supabase.test',anonKey:'anon-test'};};
  {const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.route(SB+'/**',route);const pg=watch(await ctx.newPage());await pg.addInitScript(cfg);
   await pg.goto(file);await pg.waitForTimeout(500);
   check(await pg.isVisible('text=Sign in to Network Atlas'),'Supabase configured: sign-in screen first');
   check(!(await pg.evaluate(()=>!!window.ATLAS_APP)),'app hidden until signed in');
   await pg.screenshot({path:shots+'/sync-02-signin.png'});
   await pg.click('text=New here? Create an account');await pg.fill('input[type=email]','diego@example.com');await pg.fill('input[type=password]','short');await pg.click('.boot-btn');await pg.waitForTimeout(200);
   check(await pg.isVisible('text=at least 8 characters'),'sign-up asks for 8+ characters');
   await pg.fill('input[type=password]','correct-horse');await pg.click('.boot-btn');await pg.waitForTimeout(900);
   check(await pg.evaluate(()=>!!window.ATLAS_APP&&window.ATLAS_SYNC.status().mode==='supabase'),'account created, signed in, app running on Supabase');
   await pg.evaluate(()=>localStorage.setItem('network-atlas-progress-v1',JSON.stringify({completed:['n001','n002'],mastered:{},subjectPassed:[],recheckDue:{}})));
   await pg.waitForTimeout(3500);
   check(/n002/.test(rows['diego@example.com']?.['network-atlas-progress-v1']?.value||''),'progress saved to the Supabase table');
   check(!Object.keys(rows['diego@example.com']||{}).some(k=>/sync-/.test(k)),'session token never uploaded');
   await pg.evaluate(()=>window.ATLAS_APP.jump('settings'));await pg.waitForTimeout(200);
   check(/Saved to your account \(diego@example.com\)/.test(await pg.textContent('#acct-section')),'settings shows the signed-in account');
   await pg.fill('#acct-new','battery-staple');await pg.fill('#acct-new2','battery-staple');await pg.click('[data-acct="supa-pw"]');await pg.waitForTimeout(500);
   check(users['diego@example.com']==='battery-staple','password change reaches Supabase');
   await pg.screenshot({path:shots+'/sync-03-settings.png',fullPage:true});
   await ctx.close();}
  {const ctx=await b.newContext();await ctx.route(SB+'/**',route);const pg=watch(await ctx.newPage());await pg.addInitScript(cfg);
   await pg.goto(file);await pg.waitForTimeout(500);
   await pg.fill('input[type=email]','diego@example.com');await pg.fill('input[type=password]','correct-horse');await pg.click('.boot-btn');await pg.waitForTimeout(500);
   check(await pg.isVisible('text=do not match'),'old password no longer works');
   await pg.fill('input[type=password]','battery-staple');await pg.click('.boot-btn');await pg.waitForTimeout(900);
   check(/n002/.test(await pg.evaluate(()=>localStorage.getItem('network-atlas-progress-v1'))||''),'second device signs in and gets the progress');
   // Another person on the same project cannot see Diego's rows.
   users['sam@example.com']='sam-password';
   const ctx2=await b.newContext();await ctx2.route(SB+'/**',route);const p2=watch(await ctx2.newPage());await p2.addInitScript(cfg);await p2.goto(file);await p2.waitForTimeout(400);
   await p2.fill('input[type=email]','sam@example.com');await p2.fill('input[type=password]','sam-password');await p2.click('.boot-btn');await p2.waitForTimeout(900);
   check(!/n002/.test(await p2.evaluate(()=>localStorage.getItem('network-atlas-progress-v1'))||''),'a different account starts empty');
   await ctx.close();await ctx2.close();}
  /* 4. Supabase unreachable inside Claude: falls back to the Claude account. */
  {const ctx=await b.newContext();await ctx.route(SB+'/**',r=>r.abort());const pg=watch(await ctx.newPage());await pg.addInitScript(cfg);await pg.addInitScript(mockClaude,{});
   await pg.goto(file);await pg.waitForTimeout(1200);
   check(await pg.evaluate(()=>!!window.ATLAS_APP&&window.ATLAS_SYNC.status().mode==='claude'),'Supabase blocked → falls back to the Claude account');
   await ctx.close();}
  await b.close();console.log('errors:',JSON.stringify(errors));process.exit(errors.length?1:0);
})();
