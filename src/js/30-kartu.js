// ---------- logika kartu ----------
function allIds(){return Object.keys(CARD);}
function card(id){return CARD[id];}
function buildDeck(){
  var ids=[];
  LESSONS.forEach(function(l){if(!sel[l.id])return;l.c.forEach(function(c){
    if(cfg.kanji==='kanji'&&!c.kj)return;
    if(cfg.only==='new'&&S.marks[c.id])return;
    ids.push(c.id);});});
  if(cfg.order==='rand'){for(var i=ids.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=ids[i];ids[i]=ids[j];ids[j]=t;}}
  return ids;
}
function selCount(){var n=0;LESSONS.forEach(function(l){if(sel[l.id])n+=1;});return n;}
function startSession(){
  var ids=buildDeck();if(!ids.length)return;
  var chs=LESSONS.filter(function(l){return sel[l.id];}).map(function(l){return l.id;});
  S.session={ids:ids,pos:0,chs:chs,started:Date.now(),updated:Date.now(),viewed:0,newHafal:0,hid:null,counted:{}};
  var h={id:Date.now(),t:Date.now(),chs:chs,total:ids.length,viewed:0,hafal:0,pos:0};
  S.history.unshift(h);if(S.history.length>200)S.history.pop();
  S.session.hid=h.id;
  view='study';flipped=false;persist();render();
}
function resumeSession(){if(!S.session)return;view='study';flipped=false;render();}
function histEntry(){var s=S.session;if(!s)return null;for(var i=0;i<S.history.length;i++)if(S.history[i].id===s.hid)return S.history[i];return null;}
function touchSession(){
  var s=S.session,h=histEntry();if(!s)return;
  s.updated=Date.now();
  if(h){h.viewed=s.viewed;h.hafal=s.newHafal;h.pos=s.pos;h.end=Date.now();}
}
function reveal(){
  if(Date.now()-swiped<400)return;
  if(flipped){flipped=false;}else{
    flipped=true;
    var s=S.session,id=s.ids[s.pos];
    if(!s.counted)s.counted={};
    if(!s.counted[s.pos]){
      s.counted[s.pos]=1;s.viewed+=1;
      S.seen[id]=(S.seen[id]||0)+1;
      var d=today();S.daily[d]=(S.daily[d]||0)+1;
      touchSession();persist();
    }
  }
  paintCard();
}
function go(dir){
  var s=S.session;if(!s)return;
  var np=s.pos+dir;
  if(np<0)return;
  if(np>=s.ids.length){s.pos=s.ids.length;touchSession();persist();view='done';render();return;}
  s.pos=np;flipped=false;touchSession();persist();render();
}
function toggleMark(){
  var s=S.session,id=s.ids[s.pos];
  if(S.marks[id]){delete S.marks[id];s.newHafal=Math.max(0,s.newHafal-1);}else{S.marks[id]=Date.now();s.newHafal+=1;}
  touchSession();persist();paintCard();
}
