/* CCNA lessons n016–n071 and their subject exams.
 * Authoring format (kept short so lessons are easy to review):
 *   L(id,{h:hook,p:[paragraphs],k:[key facts],a:analogy,lab:[prompt,[options],explain],t:teach prompt,w:[[keyword group]...],q:[[question,[options],why]...]})
 *   X(id,question,[options],why)   -> one subject-exam question for that topic
 * The FIRST option is always the correct one. The app shuffles options at runtime.
 * Writing rules: short sentences, one idea per sentence, everyday words first, then the exam word.
 */
(function(){
  var LS=window.ATLAS_LESSONS=window.ATLAS_LESSONS||{};
  var EX=window.ATLAS_EXAMS=window.ATLAS_EXAMS||{};
  var byId={};(window.ATLAS_TOPICS||[]).forEach(function(t){byId[t.id]=t;});
  window.ATLAS_CCNA={
    L:function(id,o){
      var t=byId[id];if(!t)throw new Error('Unknown topic '+id);
      LS[id]={id:id,title:t.title,hook:o.h,paragraphs:o.p,key:o.k,analogy:o.a,
        lab:{prompt:o.lab[0],options:o.lab[1],answer:0,explain:o.lab[2]},
        teach:o.t,terms:o.w,
        quiz:o.q.map(function(x){return{q:x[0],options:x[1],answer:0,why:x[2]};})};
      t.ready=true;
    },
    X:function(id,q,options,why){
      var t=byId[id];var key=t.track+'||'+t.domain;
      var e=EX[key]||(EX[key]={title:t.domain+' subject exam',minimumPercent:90,questionCount:0,questions:[]});
      e.questions.push({id:id+'-x'+(e.questions.filter(function(z){return z.topic===id;}).length+1),topic:id,q:q,options:options,answer:0,why:why});
      e.questionCount=new Set(e.questions.map(function(z){return z.topic;})).size;
    }
  };
})();
