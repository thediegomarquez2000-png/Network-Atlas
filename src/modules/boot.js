/* Network Atlas boot: sign-in / password lock + cloud progress sync, then start the app.
 * The app's scripts are <script type="text/atlas"> and run only when this file says so, in document order.
 *
 * Where progress is saved (first that works):
 *  1. Supabase, when window.ATLAS_SUPABASE has a url + anonKey: email + password sign-in (Supabase Auth),
 *     rows in public.atlas_progress protected by row level security (each person sees only their own rows).
 *  2. The claude.ai artifact db, when the page runs inside Claude: data/users/<id>/<key>, private per viewer.
 *     Here the optional password is a light lock (network-atlas-lock-v1), not real security.
 *  3. This device only (offline file, other hosts).
 * Every network-atlas-* localStorage key is one record {key, value, updated time}; the newest copy of each key wins.
 * Keys starting network-atlas-sync- (sessions, sync bookkeeping) never leave the device.
 */
(function(){
'use strict';
var PREFIX='network-atlas-',META='network-atlas-sync-meta',SESSION='network-atlas-sync-supa-session',LOCK='network-atlas-lock-v1',UNLOCK='network-atlas-unlocked';
var MAX=240*1024,RELOCK_MS=30*60*1000,CFG=window.ATLAS_SUPABASE||{};
var ls=window.localStorage,setRaw=Storage.prototype.setItem,removeRaw=Storage.prototype.removeItem;
var sync={mode:'local',lastSaved:0,error:'',pendingCloud:null,email:''};
var backend=null;   // {name, pull(): Promise<[{k,v,t}]>, push([{k,v,t}]): Promise}
function safe(f,d){try{return f();}catch(e){return d;}}
function jget(k){return safe(function(){return JSON.parse(ls.getItem(k)||'null');},null);}
function jsetRaw(k,o){safe(function(){if(o==null)removeRaw.call(ls,k);else setRaw.call(ls,k,JSON.stringify(o));});}
function meta(){return jget(META)||{};}
function synced(k){return k.indexOf(PREFIX)===0&&k.indexOf('network-atlas-sync-')!==0&&k!==UNLOCK;}
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function withTimeout(p,ms){return Promise.race([p,new Promise(function(_,rej){setTimeout(function(){rej({code:'timeout'});},ms);})]);}

/* ---------- start the app ---------- */
var started=false;
function startApp(){
  if(started){hideScreen();return;}started=true;
  document.querySelectorAll('script[type="text/atlas"]').forEach(function(s){var n=document.createElement('script');n.textContent=s.textContent;s.replaceWith(n);});
  hideScreen();watchRelock();
}

/* ---------- full-screen cards (splash, sign-in, lock) ---------- */
var screen=null;
function showScreen(build){
  if(!screen){screen=el('div','boot-screen');screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');document.body.appendChild(screen);document.documentElement.classList.add('boot-hold');}
  screen.innerHTML='';var card=el('div','boot-card');screen.appendChild(card);card.appendChild(el('div','boot-logo','NETWORK ATLAS'));build(card);
}
function hideScreen(){if(screen){screen.remove();screen=null;}document.documentElement.classList.remove('boot-hold');}
function splash(msg){showScreen(function(c){c.appendChild(el('p','boot-msg',msg));});}
function field(type,label,auto){var w=el('label','boot-field');w.appendChild(el('span','',label));var i=el('input','boot-input');i.type=type;i.autocomplete=auto;w.appendChild(i);return{w:w,i:i};}

/* ---------- Supabase (plain fetch; no library, so the single file stays offline-capable) ---------- */
var supa={
  on:function(){return!!(CFG.url&&CFG.anonKey);},
  base:function(){return String(CFG.url).replace(/\/+$/,'');},
  req:function(path,opt,token){opt=opt||{};var h={'apikey':CFG.anonKey,'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;
    Object.keys(opt.headers||{}).forEach(function(k){h[k]=opt.headers[k];});
    return fetch(supa.base()+path,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined}).then(function(r){
      return r.text().then(function(t){var j=safe(function(){return t?JSON.parse(t):null;},null);if(!r.ok)throw{code:'http',status:r.status,msg:(j&&(j.msg||j.message||j.error_description||j.error))||('Error '+r.status)};return j;});
    },function(){throw{code:'network'};});},
  session:function(){return jget(SESSION);},
  keep:function(j){var s={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+(j.expires_in||3600)*1000,user:{id:j.user&&j.user.id,email:j.user&&j.user.email}};jsetRaw(SESSION,s);sync.email=s.user.email||'';return s;},
  token:function(){var s=supa.session();if(!s)return Promise.reject({code:'signed_out'});
    if(s.expires_at-Date.now()>60000)return Promise.resolve(s.access_token);
    return supa.req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}}).then(function(j){return supa.keep(j).access_token;},function(e){if(e.code==='http'){jsetRaw(SESSION,null);throw{code:'signed_out'};}throw e;});},
  signIn:function(email,pw){return supa.req('/auth/v1/token?grant_type=password',{method:'POST',body:{email:email,password:pw}}).then(supa.keep);},
  signUp:function(email,pw){return supa.req('/auth/v1/signup',{method:'POST',body:{email:email,password:pw}}).then(function(j){return j&&j.access_token?supa.keep(j):null;});},
  signOut:function(){var s=supa.session();jsetRaw(SESSION,null);if(s)supa.req('/auth/v1/logout',{method:'POST'},s.access_token).catch(function(){});},
  backend:function(){return{name:'supabase',
    pull:function(){return supa.token().then(function(t){return supa.req('/rest/v1/atlas_progress?select=key,value,updated_ms',{},t);}).then(function(rows){return(rows||[]).map(function(r){return{k:r.key,v:r.value,t:+r.updated_ms||0};});});},
    push:function(items){return supa.token().then(function(t){return supa.req('/rest/v1/atlas_progress?on_conflict=user_id,key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:items.map(function(x){return{key:x.k,value:x.v,updated_ms:x.t};})},t);});}};}
};
function signInScreen(then,note){
  showScreen(function(c){
    var mode='in';
    c.appendChild(el('h1','boot-title','Sign in to Network Atlas'));
    c.appendChild(el('p','boot-msg','Your progress is saved to your account, so it follows you to every device.'));
    var f=el('form','boot-form'),em=field('email','Email','username'),pw=field('password','Password','current-password');
    var btn=el('button','boot-btn','Sign in');btn.type='submit';var msg=el('p','boot-msg boot-alert',note||'');msg.setAttribute('aria-live','polite');
    f.appendChild(em.w);f.appendChild(pw.w);f.appendChild(btn);c.appendChild(f);c.appendChild(msg);
    var sw=el('button','boot-link','New here? Create an account');sw.type='button';c.appendChild(sw);
    sw.addEventListener('click',function(){mode=mode==='in'?'up':'in';btn.textContent=mode==='in'?'Sign in':'Create account';sw.textContent=mode==='in'?'New here? Create an account':'I already have an account';pw.i.autocomplete=mode==='in'?'current-password':'new-password';msg.textContent=mode==='up'?'Use at least 8 characters for the password.':'';});
    f.addEventListener('submit',function(ev){ev.preventDefault();if(btn.disabled)return;
      var e=em.i.value.trim(),p=pw.i.value;if(!e||!p){msg.textContent='Type your email and password.';return;}
      if(mode==='up'&&p.length<8){msg.textContent='Use at least 8 characters for the password.';return;}
      btn.disabled=true;msg.textContent=mode==='in'?'Signing in…':'Creating your account…';
      (mode==='in'?supa.signIn(e,p):supa.signUp(e,p)).then(function(s){
        if(!s){btn.disabled=false;mode='in';btn.textContent='Sign in';msg.textContent='Account created. Check your email and click the link, then sign in here.';return;}
        pw.i.value='';then();
      },function(err){btn.disabled=false;msg.textContent=err.code==='network'?'Cannot reach the server. Check your internet connection.':/invalid login|invalid_grant|credentials/i.test(err.msg||'')?'That email and password do not match. Try again.':/confirm/i.test(err.msg||'')?'Please confirm your email first (check your inbox), then sign in.':(err.msg||'Something went wrong.');});
    });
    setTimeout(function(){em.i.focus();},50);
  });
}

/* ---------- Claude artifact db ---------- */
function claudeBackend(){
  return window.claude.use('db').then(function(db){if(!db)return null;
    return window.claude.use('user').then(function(u){return u?u.id():null;}).then(function(id){if(!id)return null;var col=db.collection('data/users/'+id);
      return{name:'claude',
        pull:function(){return col.get().then(function(s){return s.docs.map(function(d){var b=d.data()||{};return{k:d.id,v:b.v,t:b.t||0};});});},
        push:function(items){var i=0;return(function next(){if(i>=items.length)return Promise.resolve();var x=items[i++];return col.doc(x.k).set({v:x.v,t:x.t}).then(next);})();}};});});
}

/* ---------- light password lock (only when there is no Supabase sign-in) ---------- */
function lockData(){var o=jget(LOCK);return o&&o.hash&&o.salt?o:null;}
function hex(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return b.toString(16).padStart(2,'0');}).join('');}
function hashPw(pw,salt){
  if(window.crypto&&crypto.subtle&&window.TextEncoder){var enc=new TextEncoder();
    return crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:120000},k,256);}).then(hex);}
  var h=5381,s=salt+'|'+pw;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return Promise.resolve('weak-'+h.toString(16));
}
function isUnlocked(L){return safe(function(){return sessionStorage.getItem(UNLOCK)===L.hash;},false);}
function markUnlocked(L){safe(function(){sessionStorage.setItem(UNLOCK,L.hash);});}
function askPassword(then){
  var L=lockData();if(sync.mode==='supabase'||!L||isUnlocked(L)){then();return;}
  var tries=0;
  showScreen(function(c){
    c.appendChild(el('h1','boot-title','Enter your password'));
    var f=el('form','boot-form'),pw=field('password','Password','current-password');
    var btn=el('button','boot-btn','Unlock');btn.type='submit';var msg=el('p','boot-msg boot-alert','');msg.setAttribute('aria-live','polite');
    f.appendChild(pw.w);f.appendChild(btn);c.appendChild(f);c.appendChild(msg);
    var forgot=el('button','boot-link','Forgot your password?');forgot.type='button';c.appendChild(forgot);
    forgot.addEventListener('click',function(){forgotFlow(c,then);});
    f.addEventListener('submit',function(ev){ev.preventDefault();if(btn.disabled)return;btn.disabled=true;
      hashPw(pw.i.value,L.salt).then(function(h){
        if(h===L.hash){markUnlocked(L);pw.i.value='';then();return;}
        tries++;pw.i.value='';msg.textContent=tries<3?'That is not it. Try again.':'That is not it. Wait a few seconds, then try again.';
        setTimeout(function(){btn.disabled=false;pw.i.focus();},tries<3?300:tries*1500);});});
    setTimeout(function(){pw.i.focus();},50);
  });
}
function forgotFlow(card,then){
  var owner=window.claude&&window.claude.use?window.claude.use('user').then(function(u){return u?u.isOwner():false;}).catch(function(){return false;}):Promise.resolve(false);
  owner.then(function(isOwner){
    var box=el('div','boot-forgot');
    if(isOwner){box.appendChild(el('p','boot-msg','You are signed in to Claude as the owner of this page, so you can remove the password. Your progress stays.'));
      var b=el('button','boot-btn','Remove the password');b.type='button';box.appendChild(b);b.addEventListener('click',function(){ls.removeItem(LOCK);then();});}
    else box.appendChild(el('p','boot-msg',window.claude?'Only the owner of this page can remove the password. Open it while signed in to Claude as the owner.':'This copy is a file on this device. To remove the password, clear this site’s data in the browser settings. That also clears the progress saved on this device.'));
    var old=card.querySelector('.boot-forgot');if(old)old.remove();card.appendChild(box);
  });
}
var hiddenAt=0;
function watchRelock(){
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){hiddenAt=Date.now();flushSoon(0);return;}
    if(sync.mode!=='supabase'&&lockData()&&hiddenAt&&Date.now()-hiddenAt>RELOCK_MS){safe(function(){sessionStorage.removeItem(UNLOCK);});askPassword(hideScreen);}
  });
}

/* ---------- sync engine ---------- */
var dirty={},timer=null,writing=false;
function hookWrites(){
  Storage.prototype.setItem=function(k,v){setRaw.call(this,k,v);if(this===ls&&synced(String(k)))touch(String(k));};
  Storage.prototype.removeItem=function(k){removeRaw.call(this,k);if(this===ls&&synced(String(k)))touch(String(k));};
}
function touch(k){var m=meta();m[k]=Date.now();jsetRaw(META,m);dirty[k]=1;flushSoon(2500);}
function flushSoon(ms){if(!backend||sync.pendingCloud)return;clearTimeout(timer);timer=setTimeout(flush,ms);}
function flush(){
  if(writing||!backend)return;var keys=Object.keys(dirty);if(!keys.length)return;writing=true;dirty={};
  var m=meta(),items=[];
  keys.forEach(function(k){var v=ls.getItem(k);if(v!==null&&v.length>MAX){sync.error='Some lab data is too big to back up.';return;}items.push({k:k,v:v,t:m[k]||Date.now()});});
  backend.push(items).then(function(){writing=false;sync.lastSaved=Date.now();sync.error='';if(Object.keys(dirty).length)flushSoon(1000);},function(e){
    writing=false;keys.forEach(function(k){dirty[k]=1;});
    if(e&&e.code==='signed_out'){sync.error='You were signed out. Sign in again to keep saving.';signInScreen(function(){hideScreen();flushSoon(0);});return;}
    if(e&&(e.code==='revoked'||e.code==='not_granted'||e.code==='capability_disabled')){backend=null;sync.mode='local';sync.error='Cloud saving stopped. Progress is saved on this device.';return;}
    sync.error=e&&e.code==='quota_exceeded'?'Cloud storage is full. Progress is still saved on this device.':'Not saved to the cloud yet. Will retry.';flushSoon(8000+Math.random()*4000);});
}
function merge(rows){
  var m=meta(),cloudNewer=[],seen={};
  rows.forEach(function(r){if(!synced(r.k))return;seen[r.k]=1;var lt=m[r.k]||0;if(r.t>lt)cloudNewer.push(r);else if(lt>r.t)dirty[r.k]=1;});
  for(var i=0;i<ls.length;i++){var k=ls.key(i);if(synced(k)&&!seen[k])dirty[k]=1;}
  return cloudNewer;
}
function takeCloud(list){var m=meta();list.forEach(function(r){if(r.v===null||r.v===undefined)removeRaw.call(ls,r.k);else setRaw.call(ls,r.k,String(r.v));m[r.k]=r.t;});jsetRaw(META,m);}
function connectAndPull(){
  // Supabase first (if configured and reachable), then the Claude artifact db, else this device only.
  var trySupa=supa.on()?withTimeout(supa.req('/auth/v1/health'),6000).then(function(){return true;},function(e){return e.code==='http';}):Promise.resolve(false);
  return trySupa.then(function(ok){
    if(ok){sync.mode='supabase';var s=supa.session();if(s){sync.email=s.user&&s.user.email||'';return'need-pull';}return'need-signin';}
    if(window.claude&&typeof window.claude.use==='function')return claudeBackend().then(function(b){if(b){backend=b;sync.mode='claude';return'need-pull';}return'local';},function(){return'local';});
    if(supa.on()&&supa.session()){sync.mode='supabase-offline';sync.email=(supa.session().user||{}).email||'';}
    return'local';
  });
}
function pullInto(then,late){
  backend.pull().then(function(rows){
    var newer=merge(rows);
    if(!late){takeCloud(newer);then();flushSoon(1500);}
    else if(newer.length){sync.pendingCloud=newer;banner();}else flushSoon(1500);
  },function(e){
    if(e&&e.code==='signed_out'){signInScreen(function(){pullInto(then,late);});return;}
    sync.error='Could not load saved progress. Using this device’s copy.';if(!late)then();
  });
}
function banner(){
  var b=el('div','sync-banner');b.setAttribute('role','alert');b.appendChild(el('span','','Newer progress was found from another device.'));
  var a=el('button','boot-btn','Load it'),k=el('button','boot-link','Keep this device’s');
  a.addEventListener('click',function(){window.ATLAS_SYNC.loadNewer();});k.addEventListener('click',function(){window.ATLAS_SYNC.keepThis();b.remove();});
  b.appendChild(a);b.appendChild(k);document.body.appendChild(b);
}
function earlyTheme(){ // the start-up screens appear before the prefs module runs: match its Night/Auto choice
  var prof=jget('network-atlas-profiles-v6'),act=prof&&prof.active;
  var p=jget('network-atlas-prefs-v6'+(act&&act!=='p1'?'::'+act:''))||{},t=p.theme||'auto',h=new Date().getHours();
  if(t==='night'||(t==='auto'&&(h>=19||h<7)))document.documentElement.classList.add('t-night');
}
function boot(){
  earlyTheme();hookWrites();
  if(!supa.on()&&!(window.claude&&typeof window.claude.use==='function')){askPassword(startApp);return;}
  splash('Loading your saved progress…');
  var done=false,go=function(){if(done)return;done=true;clearTimeout(t);askPassword(startApp);};
  var t=setTimeout(function(){if(!done){done=true;askPassword(startApp);}},9000);
  connectAndPull().then(function(state){
    if(state==='need-signin'){clearTimeout(t);done=true;signInScreen(function(){backend=supa.backend();splash('Loading your saved progress…');pullInto(startApp,false);});return;}
    if(state==='need-pull'){if(!backend)backend=supa.backend();pullInto(go,done);return;}
    go();
  },go);
}

/* ---------- settings section (rendered by the prefs module) ---------- */
function ago(ms){if(!ms)return'not yet';var s=Math.round((Date.now()-ms)/1000);return s<60?'just now':s<3600?Math.round(s/60)+' min ago':Math.round(s/3600)+' h ago';}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
window.ATLAS_ACCOUNT={
  sectionHTML:function(){
    var st=sync.mode==='supabase'?'Saved to your account'+(sync.email?' ('+esc(sync.email)+')':'')+' · last saved '+ago(sync.lastSaved)
      :sync.mode==='claude'?'Saved to your Claude account · last saved '+ago(sync.lastSaved)
      :sync.mode==='supabase-offline'?'Offline. Progress is saved on this device and will sync when you are back online.'
      :'Saved on this device only.';
    var h='<section class="panel set-section set-wide" id="acct-section"><h2>☁ Account & password</h2><p class="acct-status">'+st+'</p>'+(sync.error?'<p class="feedback bad">'+esc(sync.error)+'</p>':'');
    if(sync.mode==='supabase'){
      h+='<p class="small-print">You sign in with your email and password. This device stays signed in until you sign out.</p><div class="inline-form"><button class="secondary-btn" data-acct="sync">Save now</button><button class="secondary-btn" data-acct="signout">Sign out on this device</button></div>'+
        '<h4>Change password</h4><div class="acct-form"><label>New password<input type="password" id="acct-new" autocomplete="new-password"></label><label>Type it again<input type="password" id="acct-new2" autocomplete="new-password"></label><div class="inline-form"><button class="primary-btn small" data-acct="supa-pw">Change password</button></div><p class="acct-msg" aria-live="polite"></p></div>';
    } else {
      var on=!!lockData();
      h+='<h4>Password</h4><p class="small-print">'+(on?'A password is set. The app asks for it when it opens, and again after 30 minutes away.':'No password set.')+' This is a light lock for this app'+(sync.mode==='claude'?' and syncs to your other devices':'')+'. Your claude.ai link is private either way.</p>'+
        '<div class="acct-form">'+(on?'<label>Current password<input type="password" id="acct-cur" autocomplete="current-password"></label>':'')+
        '<label>New password<input type="password" id="acct-new" autocomplete="new-password"></label><label>Type it again<input type="password" id="acct-new2" autocomplete="new-password"></label>'+
        '<div class="inline-form"><button class="primary-btn small" data-acct="set">'+(on?'Change password':'Set password')+'</button>'+(on?'<button class="secondary-btn" data-acct="remove">Remove password</button><button class="secondary-btn" data-acct="lock">Lock now</button>':'')+'</div><p class="acct-msg" aria-live="polite"></p></div>';
      if(sync.mode==='claude')h+='<div class="inline-form"><button class="secondary-btn" data-acct="sync">Save now</button></div>';
    }
    return h+'</section>';
  }
};
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-acct]');if(!b)return;
  var sec=document.getElementById('acct-section'),msg=sec&&sec.querySelector('.acct-msg'),say=function(t){if(msg)msg.textContent=t;},a=b.getAttribute('data-acct');
  var val=function(id){var i=document.getElementById(id);return i?i.value:'';};
  var refresh=function(){if(sec)sec.outerHTML=window.ATLAS_ACCOUNT.sectionHTML();};
  if(a==='sync'){Object.keys(meta()).forEach(function(k){dirty[k]=1;});flush();setTimeout(refresh,1500);return;}
  if(a==='signout'){supa.signOut();location.reload();return;}
  if(a==='lock'){window.ATLAS_LOCK.lockNow();return;}
  var cur=val('acct-cur'),n1=val('acct-new'),n2=val('acct-new2');
  if(a==='supa-pw'){if(n1.length<8){say('Use at least 8 characters.');return;}if(n1!==n2){say('The two passwords are different. Type them again.');return;}
    say('Saving…');supa.token().then(function(t){return supa.req('/auth/v1/user',{method:'PUT',body:{password:n1}},t);}).then(function(){say('Password changed.');document.getElementById('acct-new').value='';document.getElementById('acct-new2').value='';},function(e){say(e.code==='network'?'Cannot reach the server.':(e.msg||'Could not change the password.'));});return;}
  var checkCur=lockData()?window.ATLAS_LOCK.check(cur):Promise.resolve(true);
  checkCur.then(function(ok){
    if(!ok){say('The current password is not right.');return;}
    if(a==='remove'){window.ATLAS_LOCK.remove();refresh();return;}
    if(n1.length<4){say('Use at least 4 characters.');return;}
    if(n1!==n2){say('The two new passwords are different. Type them again.');return;}
    window.ATLAS_LOCK.set(n1).then(refresh);
  });
});
window.ATLAS_LOCK={
  isSet:function(){return!!lockData();},
  set:function(pw){var salt=hex(crypto.getRandomValues(new Uint8Array(16)));return hashPw(pw,salt).then(function(h){var L={salt:salt,hash:h,v:1};ls.setItem(LOCK,JSON.stringify(L));markUnlocked(L);});},
  check:function(pw){var L=lockData();return L?hashPw(pw,L.salt).then(function(h){return h===L.hash;}):Promise.resolve(true);},
  remove:function(){ls.removeItem(LOCK);},
  lockNow:function(){if(lockData()){safe(function(){sessionStorage.removeItem(UNLOCK);});askPassword(hideScreen);}}
};
window.ATLAS_SYNC={status:function(){return{mode:sync.mode,lastSaved:sync.lastSaved,error:sync.error,pending:Object.keys(dirty).length,newerElsewhere:!!sync.pendingCloud,email:sync.email};},
  loadNewer:function(){if(!sync.pendingCloud)return;takeCloud(sync.pendingCloud);sync.pendingCloud=null;location.reload();},
  keepThis:function(){if(!sync.pendingCloud)return;var m=meta(),now=Date.now();sync.pendingCloud.forEach(function(r){m[r.k]=now;dirty[r.k]=1;});jsetRaw(META,m);sync.pendingCloud=null;flushSoon(0);}};
boot();
})();
