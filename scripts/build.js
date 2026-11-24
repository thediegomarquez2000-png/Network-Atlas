// Build: inline every src file back into ONE offline dist/index.html.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src');
require('./make-night.js'); // regenerate src/styles/night.css from the other stylesheets
const html=fs.readFileSync(path.join(src,'index.html'),'utf8').replace(/<!--@include (\S+)-->/g,(_,rel)=>{
  const body=fs.readFileSync(path.join(src,rel),'utf8');
  if(/<\/script>/i.test(body)&&rel.endsWith('.js'))throw new Error(rel+' contains a closing script tag');
  return body;
});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist','index.html'),html);
// Test copy: same app with Supabase switched off, so the browser tests never depend on a live server
// (tests/test_sync.js presets a fake Supabase itself).
const cfg=fs.readFileSync(path.join(src,'data','supabase-config.js'),'utf8');
if(!html.includes(cfg))throw new Error('supabase config not found in build');
fs.writeFileSync(path.join(root,'dist','test.html'),html.replace(cfg,"window.ATLAS_SUPABASE=window.ATLAS_SUPABASE||{url:'',anonKey:''};"));
console.log('built dist/index.html',(html.length/1024).toFixed(0)+' KB');
