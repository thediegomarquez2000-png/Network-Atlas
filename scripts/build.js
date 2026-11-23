// Build: inline every src file back into ONE offline dist/index.html.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src');
const html=fs.readFileSync(path.join(src,'index.html'),'utf8').replace(/<!--@include (\S+)-->/g,(_,rel)=>{
  const body=fs.readFileSync(path.join(src,rel),'utf8');
  if(/<\/script>/i.test(body)&&rel.endsWith('.js'))throw new Error(rel+' contains a closing script tag');
  return body;
});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist','index.html'),html);
console.log('built dist/index.html',(html.length/1024).toFixed(0)+' KB');
