// ---------- kelola kotoba ----------
function renderWords(){
  if(wLid&&!BYID[wLid]){wLid=null;}
  if(wLid)return renderChapter();
  var html='<section class="panel"><div class="row spread"><div><h2>Kelola kotoba</h2></div><button class="btn small primary" data-act="newch">'+(wNewCh?'Tutup':'+ Bab baru')+'</button></div>'+
   '<p class="lead">Ketuk sebuah bab untuk mengubah, menambah, atau menghapus kata. Perubahan langsung dipakai di kartu hafalan.</p>';
  if(wNewCh){
    var bs=books(),defB=bs.length?bs[bs.length-1]:1;
    html+='<div class="form"><div class="grid2"><div class="field"><label for="nb">Nomor buku</label><input id="nb" type="number" min="1" value="'+defB+'"></div><div class="field"><label for="nt">Judul bab</label><input id="nt" type="text" placeholder="mis. 新しいことば"></div></div><div class="row"><button class="btn primary" data-act="mkch">Buat bab</button></div><p class="note" id="note">'+esc(wNote)+'</p></div>';
  }
  html+='</section>';
  books().forEach(function(b){
    var ls=LESSONS.filter(function(l){return l.b===b;});
    html+='<section class="panel"><div class="book"><b>'+esc(bookName(b))+'</b><span style="color:var(--muted);font-size:.8rem">'+ls.length+' bab</span></div><div class="chs">';
    ls.forEach(function(l){
      var tag=!BASEBY[l.id]?'<span class="badge">baru</span>':(S.deck[l.id]?'<span class="badge">diubah</span>':'');
      html+='<button class="ch go" data-act="open" data-id="'+esc(l.id)+'"><span class="t"><b>Bab '+l.n+'</b>'+tag+'<span class="s">'+esc(l.t)+'</span></span><span class="n">'+l.c.length+' kata ›</span></button>';
    });
    html+='</div></section>';
  });
  var rem=BASE.filter(function(l){return S.removed[l.id];});
  if(rem.length){
    html+='<section class="panel"><h2>Bab yang dihapus</h2><div class="chs">';
    rem.forEach(function(l){html+='<div class="ch go" style="cursor:default"><span class="t"><b>B'+l.b+' · Bab '+l.n+'</b><span class="s">'+esc(l.t)+'</span></span><button class="btn small" data-act="restorech" data-id="'+esc(l.id)+'">Pulihkan</button></div>';});
    html+='</div></section>';
  }
  html+=ioPanel('home');
  html+='<section class="panel"><h2>Kembali ke kotoba asli</h2><p class="lead">Menghapus semua perubahan, bab baru, dan bab yang dihapus. Progres hafalan tetap tersimpan.</p>'+
   (wConf==='resetdeck'?'<div class="confirm"><span>Kembalikan semua kotoba ke asli?</span><button class="btn small" data-act="cancel">Batal</button><button class="btn small danger fill" data-act="resetdeck-yes">Ya, kembalikan</button></div>':'<div class="row"><button class="btn small danger" data-act="resetdeck"'+((Object.keys(S.deck).length||Object.keys(S.removed).length)?'':' disabled')+'>Kembalikan semua</button></div>')+'</section>';
  main.innerHTML=html;
}
function wordRow(l,c){
  if(wConf==='w:'+c.id)return '<div class="w conf"><div class="confirm"><span>Hapus <b>'+esc(c.k)+'</b>?</span><button class="btn small" data-act="cancel">Batal</button><button class="btn small danger fill" data-act="delw-yes" data-id="'+esc(c.id)+'">Ya, hapus</button></div></div>';
  if(wEdit===c.id)return wordForm(c);
  return '<div class="w"><div class="tx"><div class="wk">'+esc(c.k)+'</div>'+(c.r&&c.r!==c.k?'<div class="wr">'+esc(c.r)+'</div>':'')+'<div class="wm">'+esc(c.m)+'</div></div><div class="acts"><button class="btn small" data-act="editw" data-id="'+esc(c.id)+'">Ubah</button><button class="btn small danger" data-act="delw" data-id="'+esc(c.id)+'">Hapus</button></div></div>';
}
function wordForm(c){
  var isNew=!c;
  return '<div class="w edit"><div class="form" style="border:0;padding:0;background:none"><div class="field"><label for="ek">Kata (kanji / kana)</label><input id="ek" type="text" value="'+(c?esc(c.k):'')+'" autocomplete="off" lang="ja"></div><div class="field"><label for="er">Cara baca (hiragana)</label><input id="er" type="text" value="'+(c?esc(c.r):'')+'" autocomplete="off" lang="ja"></div><div class="field"><label for="em">Arti</label><input id="em" type="text" value="'+(c?esc(c.m):'')+'" autocomplete="off"></div>'+
   '<div class="row"><button class="btn small primary" data-act="savew"'+(c?' data-id="'+esc(c.id)+'"':'')+'>'+(isNew?'Simpan &amp; tambah lagi':'Simpan')+'</button><button class="btn small" data-act="cancel">'+(isNew?'Selesai':'Batal')+'</button></div></div></div>';
}
function listHtml(l){
  var q=wQ.trim().toLowerCase(),h='',n=0;
  l.c.forEach(function(c){
    if(q&&(c.k+' '+c.r+' '+c.m).toLowerCase().indexOf(q)<0&&wEdit!==c.id&&wConf!=='w:'+c.id)return;
    n++;h+=wordRow(l,c);
  });
  if(!n)h='<p class="empty" style="padding:14px">'+(q?'Tidak ada kata yang cocok.':'Bab ini belum punya kata. Tambahkan kata pertama.')+'</p>';
  return h;
}
function exportText(l){return l.c.map(function(c){return c.k+' | '+c.r+' | '+c.m;}).join('\n');}
function renderChapter(){
  var l=BYID[wLid],isBase=!!BASEBY[wLid],edited=isBase&&!!S.deck[wLid];
  var html='<div class="sticky"><button class="btn small" data-act="home">‹ Semua bab</button></div>';
  html+='<section class="panel"><div class="row spread"><h2>'+esc(lname(l))+(isBase?'':'<span class="badge">baru</span>')+(edited?'<span class="badge">diubah</span>':'')+'</h2><span style="color:var(--muted);font-size:.8rem">'+l.c.length+' kata</span></div>';
  if(wRename){
    html+='<div class="form"><div class="field"><label for="ct">Judul bab</label><input id="ct" type="text" value="'+esc(l.t)+'"></div><div class="row"><button class="btn small primary" data-act="saverename">Simpan judul</button><button class="btn small" data-act="cancel">Batal</button></div></div>';
  }else{
    html+='<div class="row spread"><h3 class="sub">'+esc(l.t)+'</h3><button class="btn small" data-act="rename">Ubah judul</button></div>';
  }
  html+='<div class="row"><button class="btn small primary" data-act="addw">+ Tambah kata</button><button class="btn small" data-act="bulk">Tambah banyak</button><button class="btn small" data-act="export">Salin daftar</button></div>';
  if(wBulk){
    html+='<div class="form"><div class="field"><label for="btxt">Satu kata per baris, dipisah tanda | (kata | bacaan | arti)</label><textarea id="btxt" placeholder="食べる | たべる | makan&#10;犬 | いぬ | anjing&#10;レストラン | restoran"></textarea></div><div class="row"><button class="btn small primary" data-act="bulkadd">Tambahkan</button><button class="btn small" data-act="cancel">Tutup</button></div><p class="lead">Jika bacaan dikosongkan (kata | arti), bacaan sama dengan tulisan.</p></div>';
  }
  if(wExport){
    html+='<div class="form"><textarea id="extxt" readonly>'+esc(exportText(l))+'</textarea><div class="row"><button class="btn small primary" data-act="copy" data-t="extxt">Salin</button><button class="btn small" data-act="cancel">Tutup</button></div></div>';
  }
  html+='<p class="note" id="note">'+esc(wNote)+'</p>';
  html+='<div class="field"><label for="wq">Cari di bab ini</label><input id="wq" type="text" value="'+esc(wQ)+'" placeholder="kata, bacaan, atau arti" autocomplete="off"></div>';
  if(wEdit==='new')html+='<div class="words">'+wordForm(null)+'</div>';
  html+='<div class="words" id="wlist">'+listHtml(l)+'</div></section>';
  html+=ioPanel('chapter');
  html+='<section class="panel"><h2>Bab ini</h2>';
  if(wConf==='delch')html+='<div class="confirm"><span>Hapus bab ini beserta '+l.c.length+' kata?</span><button class="btn small" data-act="cancel">Batal</button><button class="btn small danger fill" data-act="delch-yes">Ya, hapus</button></div>';
  else html+='<div class="row">'+(edited?'<button class="btn small" data-act="resetch">Kembalikan ke asli</button>':'')+'<button class="btn small danger" data-act="delch">Hapus bab</button></div>';
  if(wConf==='resetch')html+='<div class="confirm"><span>Buang semua perubahan di bab ini?</span><button class="btn small" data-act="cancel">Batal</button><button class="btn small danger fill" data-act="resetch-yes">Ya, kembalikan</button></div>';
  html+='</section>';
  main.innerHTML=html;
  if(wEdit==='new'){var k=document.getElementById('ek');if(k)k.focus();}
}
function flash(t){wNote=t;var n=document.getElementById('note');if(n)n.textContent=t;}
function copyText(id){
  var ta=document.getElementById(id);if(!ta)return;ta.focus();ta.select();
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(ta.value).then(function(){flash('Tersalin.');}).catch(function(){flash('Teks sudah dipilih. Salin secara manual.');});
  }else flash('Teks sudah dipilih. Salin secara manual.');
}
function parseLines(t){
  var out=[],skip=0;
  t.split(/\r?\n/).forEach(function(line){
    line=line.trim();if(!line)return;
    var p=line.split(/\s*[|\t]\s*/);
    if(p.length<2||!p[0]||!p[p.length-1]){skip++;return;}
    var k=p[0],r,m;
    if(p.length===2){r=k;m=p[1];}else{r=p[1]||k;m=p.slice(2).join(' | ');}
    out.push({k:k,r:r,m:m});
  });
  return {rows:out,skip:skip};
}
function saveWord(id){
  var k=val('ek').trim(),r=val('er').trim(),m=val('em').trim();
  if(!k||!m){flash('Isi kata dan arti terlebih dahulu.');return;}
  var d=ensureDeck(wLid);
  if(id){
    d.c.forEach(function(c){if(c.id===id){c.k=k;c.r=r||k;c.m=m;c.kj=hasKanji(k)?1:0;}});
    wEdit=null;wNote='Tersimpan.';
  }else{
    d.c.push({id:newId(wLid),k:k,r:r||k,m:m,kj:hasKanji(k)?1:0});
    wEdit='new';wNote='Ditambahkan: '+k;
  }
  commit();render();
}
