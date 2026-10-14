// ---------- penyimpanan ----------
function loadLocal(){try{var r=localStorage.getItem(KEY);if(r)return JSON.parse(r);}catch(e){}return null;}
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
var dbDoc=null,saveT=null;
function persist(){
  S.rev=Date.now();S.cfg=cfg;S.sel=sel;saveLocal();
  if(!dbDoc)return;
  clearTimeout(saveT);
  saveT=setTimeout(function(){dbDoc.set({json:JSON.stringify(S),rev:S.rev}).catch(function(){});},700);
}
function adopt(o){
  S=Object.assign(blank(),o);
  if(!S.deck)S.deck={};if(!S.removed)S.removed={};
  cfg=Object.assign({order:'seq',kanji:'all',only:'all'},S.cfg||{});
  sel=S.sel||{};
  rebuild();
}
