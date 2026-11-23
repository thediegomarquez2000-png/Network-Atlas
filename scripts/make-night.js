// Generates src/styles/night.css: a warm, low-blue-light, low-glare copy of every color rule in the app's CSS,
// scoped under html.t-night. Runs on every build, so new styles get a night version automatically.
// Hand-tuned semantic colors (right/wrong, focus) live at the end of the generated file.
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','src','styles');
const SOURCES=['base.css','components.css','labs.css','app.css','plan.css','mobile.css'];
const COLOR_PROPS=/^(color|background|background-color|background-image|border(-[a-z]+)*|outline(-color)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration(-color)?|scrollbar-color|--[\w-]+)$/;
const COLOR_RE=/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)|\b(white|black)\b/gi;

function toRgb(m){
  if(m[1]){let h=m[1];if(h.length<=4)h=[...h].map(c=>c+c).join('');const a=h.length===8?parseInt(h.slice(6),16)/255:1;return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),a];}
  if(m[6])return m[6].toLowerCase()==='white'?[255,255,255,1]:[0,0,0,1];
  let a=m[5]===undefined?1:m[5].endsWith('%')?parseFloat(m[5])/100:parseFloat(m[5]);return[+m[2],+m[3],+m[4],a];
}
function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return[h,s,l];}
function rgb(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0),f(8),f(4)].map(v=>Math.round(v*255));}
function night([r,g,b,a]){
  let [h,s,l]=hsl(r,g,b),H,S,L;
  const neutral=s<0.35||l<0.24||l>0.88;
  if(neutral){
    if(l<0.4){H=28;S=Math.min(s,0.25)*0.5;L=l*0.6;}            // backgrounds: near-black, faintly warm (OLED friendly)
    else{H=36;S=0.26;L=Math.min(0.82,0.32+l*0.52);}            // text: warm off-white, never pure white
  }else{
    if(h>=140&&h<200){H=37;S=Math.min(s,0.68);}                // teal accent → amber
    else if(h>=200&&h<265){H=30;S=Math.min(s,0.5);}            // blue → soft orange
    else if(h>=265&&h<320){H=14;S=Math.min(s,0.45);}           // purple → coral
    else{H=h;S=s*0.8;}                                          // reds, oranges, yellows keep their meaning
    L=l<0.5?l*0.72:Math.min(l*0.88,0.66);
  }
  const [R,G,B]=rgb(H,S,L);return a>=1?'#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join(''):`rgba(${R},${G},${B},${+a.toFixed(3)})`;
}
const mapColors=v=>v.replace(COLOR_RE,(...m)=>night(toRgb(m)));

function prefix(sel){
  return sel.split(',').map(x=>x.trim()).filter(Boolean).map(x=>{
    if(/^html\.t-/.test(x))return null;
    if(/^(html|:root)\b/.test(x))return x.replace(/^(html|:root)/,'html.t-night');
    return 'html.t-night '+x;}).filter(Boolean).join(',');
}
function convert(css){
  css=css.replace(/\/\*[\s\S]*?\*\//g,'');let out='',i=0;
  while(i<css.length){
    const open=css.indexOf('{',i);if(open<0)break;
    const head=css.slice(i,open).trim();
    if(head.startsWith('@')){
      let depth=1,j=open+1;while(depth&&j<css.length){if(css[j]==='{')depth++;else if(css[j]==='}')depth--;j++;}
      if(/^@media|^@supports/.test(head)){const inner=convert(css.slice(open+1,j-1));if(inner)out+=head+'{'+inner+'}\n';}
      i=j;continue;
    }
    const close=css.indexOf('}',open);const body=css.slice(open+1,close);i=close+1;
    const sel=prefix(head);if(!sel)continue;
    const decls=body.split(';').map(d=>d.trim()).filter(Boolean).filter(d=>{const p=d.slice(0,d.indexOf(':')).trim().toLowerCase();return COLOR_PROPS.test(p)&&new RegExp(COLOR_RE.source,'i').test(d.slice(d.indexOf(':')+1));}).map(d=>{COLOR_RE.lastIndex=0;const k=d.indexOf(':');return d.slice(0,k)+':'+mapColors(d.slice(k+1));});
    COLOR_RE.lastIndex=0;
    if(decls.length)out+=sel+'{'+decls.join(';')+'}\n';
  }
  return out;
}
const SEMANTIC=`
/* Hand-tuned night semantics: keep right = green, wrong = red, but dim and warm. */
html.t-night{background:#000;color-scheme:dark}
html.t-night body{background:#070605;color:#d9ccb8}
html.t-night .feedback.good,html.t-night .plan-status.ok{background:#1d2a17;border-color:#4d6b3a;color:#cfe0bf}
html.t-night .feedback.bad,html.t-night .plan-status.bad{background:#2e1513;border-color:#7a3b33;color:#efc4bb}
html.t-night .option.correct{background:#1d2a17!important;border-color:#6f9a52!important;color:#d8e8c8!important}
html.t-night .option.incorrect{background:#2e1513!important;border-color:#9b4a3f!important;color:#f0cfc8!important}
html.t-night .topic-dot.complete,html.t-night .plan-task.done .plan-tick,html.t-night .pt-num.done{background:#8fae6f;color:#10140b;border-color:#8fae6f}
html.t-night .plan-week.done{background:#161d10}
html.t-night .plan-ready li.ok{color:#bcd3a5}
html.t-night :focus-visible{outline:2px solid #d09a4a!important;outline-offset:2px}
html.t-night img,html.t-night canvas{filter:brightness(.8) sepia(.2)}
html.t-night ::selection{background:#5a3f1c;color:#f3e6d2}
`;
let out='/* GENERATED by scripts/make-night.js from '+SOURCES.join(', ')+'. Do not edit by hand. */\n';
for(const f of SOURCES)out+='/* '+f+' */\n'+convert(fs.readFileSync(path.join(dir,f),'utf8'));
out+=SEMANTIC;
fs.writeFileSync(path.join(dir,'night.css'),out);
if(require.main===module)console.log('night.css',(out.length/1024).toFixed(0)+' KB');
module.exports={night,convert};
