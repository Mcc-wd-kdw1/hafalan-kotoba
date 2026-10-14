// ---------- data kotoba (asli + perubahan) ----------
function rebuild(){
  LESSONS=[];BYID={};CARD={};
  BASE.forEach(function(l){if(S.removed[l.id])return;LESSONS.push(S.deck[l.id]||l);});
  Object.keys(S.deck).forEach(function(id){if(!BASEBY[id])LESSONS.push(S.deck[id]);});
  LESSONS.sort(function(a,b){return a.b-b.b||a.n-b.n;});
  LESSONS.forEach(function(l){BYID[l.id]=l;l.c.forEach(function(c){CARD[c.id]={l:l,id:c.id,k:c.k,r:c.r,m:c.m,kj:c.kj};});});
  Object.keys(sel).forEach(function(id){if(!BYID[id])delete sel[id];});
  var s=S.session;
  if(s){
    var out=[],before=0;
    s.ids.forEach(function(id,i){if(CARD[id])out.push(id);else if(i<s.pos)before++;});
    s.pos=Math.max(0,s.pos-before);s.ids=out;
    if(!out.length){S.session=null;if(view==='study'||view==='done')view='pick';}
    else if(s.pos>out.length)s.pos=out.length;
  }
}
function commit(){rebuild();persist();}
function ensureDeck(lid){
  if(!S.deck[lid])S.deck[lid]=JSON.parse(JSON.stringify(BYID[lid]||BASEBY[lid]));
  return S.deck[lid];
}
function newId(lid){return lid+'#n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
