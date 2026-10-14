// ---------- aksi ----------
function act(a,d){
  switch(a){
    case 'resume':return resumeSession();
    case 'start':return startSession();
    case 'selall':LESSONS.forEach(function(l){if(l.b==d.book)sel[l.id]=1;});persist();return renderPick();
    case 'selnone':LESSONS.forEach(function(l){if(l.b==d.book)delete sel[l.id];});persist();return renderPick();
    case 'opt':cfg[d.o]=d.v;persist();return renderPick();
    case 'exit':view='pick';return render();
    case 'flip':return reveal();
    case 'prev':return go(-1);
    case 'next':return go(1);
    case 'mark':return toggleMark();
    case 'doneback':{var s=S.session;s.pos=s.ids.length-1;view='study';flipped=false;persist();return render();}
    case 'again':{var s2=S.session;s2.pos=0;s2.counted={};s2.viewed=0;s2.newHafal=0;var h={id:Date.now(),t:Date.now(),chs:s2.chs,total:s2.ids.length,viewed:0,hafal:0,pos:0};S.history.unshift(h);s2.hid=h.id;view='study';flipped=false;persist();return render();}
    case 'pickother':S.session=null;view='pick';persist();return render();
    case 'reset':confirmReset=true;return renderStats();
    case 'rno':confirmReset=false;return renderStats();
    case 'ryes':{var keep={cfg:cfg,sel:sel,deck:S.deck,removed:S.removed};S=blank();S.cfg=keep.cfg;S.sel=keep.sel;S.deck=keep.deck;S.removed=keep.removed;confirmReset=false;view='pick';rebuild();persist();return renderStats();}
    case 'exp':return doExport(d.f,d.s);
    case 'impmode':imp.mode=d.v;return renderWords2();
    case 'impgo':applyImport();return render();
    case 'impno':imp=null;ioFlash('');return renderWords2();
    // kotoba
    case 'newch':wNewCh=!wNewCh;wNote='';return renderWords();
    case 'mkch':{
      var nb=parseInt(val('nb'),10),nt=val('nt').trim();
      if(!nb||nb<1){return flash('Nomor buku harus angka 1 atau lebih.');}
      if(!nt){return flash('Isi judul bab terlebih dahulu.');}
      var mx=0;LESSONS.forEach(function(l){if(l.b===nb&&l.n>mx)mx=l.n;});
      BASE.forEach(function(l){if(l.b===nb&&l.n>mx)mx=l.n;});
      var id='c'+Date.now().toString(36);
      S.deck[id]={id:id,b:nb,n:mx+1,t:nt,c:[]};
      wNewCh=false;wNote='';commit();wLid=id;wEdit='new';wQ='';return render();
    }
    case 'open':imp=null;ioMsg='';ioText='';wLid=d.id;wQ='';wEdit=null;wRename=false;wBulk=false;wExport=false;wConf=null;wNote='';render();return window.scrollTo(0,0);
    case 'home':imp=null;ioMsg='';ioText='';wLid=null;wEdit=null;wConf=null;wNote='';render();return window.scrollTo(0,0);
    case 'restorech':delete S.removed[d.id];commit();return render();
    case 'addw':wEdit='new';wBulk=false;wExport=false;wNote='';return renderChapter();
    case 'editw':wEdit=d.id;wConf=null;wNote='';return renderChapter();
    case 'savew':return saveWord(d.id||null);
    case 'cancel':wEdit=null;wConf=null;wRename=false;wBulk=false;wExport=false;return renderWords();
    case 'delw':wConf='w:'+d.id;wEdit=null;return renderChapter();
    case 'delw-yes':{var dk=ensureDeck(wLid);dk.c=dk.c.filter(function(c){return c.id!==d.id;});delete S.marks[d.id];delete S.seen[d.id];wConf=null;wNote='Kata dihapus.';commit();return render();}
    case 'rename':wRename=true;return renderChapter();
    case 'saverename':{var t=val('ct').trim();if(!t){return;}ensureDeck(wLid).t=t;wRename=false;commit();return render();}
    case 'bulk':wBulk=!wBulk;wExport=false;wEdit=null;return renderChapter();
    case 'export':wExport=!wExport;wBulk=false;wEdit=null;return renderChapter();
    case 'copy':return copyText(d.t);
    case 'bulkadd':{
      var pr=parseLines(val('btxt'));
      if(!pr.rows.length){return flash('Tidak ada baris yang bisa dibaca. Gunakan format: kata | bacaan | arti.');}
      var dd=ensureDeck(wLid);
      pr.rows.forEach(function(r){dd.c.push({id:newId(wLid),k:r.k,r:r.r,m:r.m,kj:hasKanji(r.k)?1:0});});
      wBulk=false;wNote=pr.rows.length+' kata ditambahkan'+(pr.skip?', '+pr.skip+' baris dilewati.':'.');commit();return render();
    }
    case 'delch':wConf='delch';return renderChapter();
    case 'delch-yes':{
      var lid=wLid;
      if(BASEBY[lid])S.removed[lid]=1;
      delete S.deck[lid];delete sel[lid];
      wLid=null;wConf=null;commit();return render();
    }
    case 'resetch':wConf='resetch';return renderChapter();
    case 'resetch-yes':delete S.deck[wLid];wConf=null;wNote='Bab dikembalikan ke asli.';commit();return render();
    case 'resetdeck':wConf='resetdeck';return renderWords();
    case 'resetdeck-yes':S.deck={};S.removed={};wConf=null;wNote='Semua kotoba dikembalikan ke asli.';commit();return render();
    case 'bkshow':bk=bk==='show'?null:'show';wNote='';return renderWords();
    case 'bkrestore':bk=bk==='restore'?null:'restore';wNote='';return renderWords();
    case 'dorestore':{
      var o=null;try{o=JSON.parse(val('rbtxt'));}catch(e){}
      var ok=o&&typeof o==='object'&&o.deck&&typeof o.deck==='object'&&Object.keys(o.deck).every(function(k){var l=o.deck[k];return l&&Array.isArray(l.c)&&typeof l.b==='number'&&typeof l.n==='number';});
      if(!ok){return flash('Teks cadangan tidak valid.');}
      S.deck=o.deck;S.removed=(o.removed&&typeof o.removed==='object')?o.removed:{};bk=null;wNote='Cadangan dipulihkan.';commit();return render();
    }
  }
}
main.addEventListener('click',function(e){
  var t=e.target.closest('[data-act]');if(!t||!main.contains(t))return;
  act(t.dataset.act,t.dataset);
});
main.addEventListener('change',function(e){
  var i=e.target;
  if(i.id==='impfile'&&i.files&&i.files[0]){var f=i.files[0];i.value='';handleImportFile(f);return;}
  if(i.dataset&&i.dataset.ch){if(i.checked)sel[i.dataset.ch]=1;else delete sel[i.dataset.ch];persist();renderPick();}
});
main.addEventListener('input',function(e){
  if(e.target.id==='wq'&&wLid&&BYID[wLid]){wQ=e.target.value;document.getElementById('wlist').innerHTML=listHtml(BYID[wLid]);}
});
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){tab=b.dataset.tab;confirmReset=false;wConf=null;imp=null;ioMsg='';ioText='';render();window.scrollTo(0,0);};});
document.addEventListener('keydown',function(e){
  if(tab!=='learn'||view!=='study')return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='ArrowRight'){e.preventDefault();go(1);}
  else if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
  else if(e.key===' '||e.key==='Enter'){if(e.target&&e.target.tagName==='BUTTON'&&e.target.id!=='card')return;e.preventDefault();reveal();}
});
