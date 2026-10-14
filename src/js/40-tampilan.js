// ---------- tampilan ----------
var main=document.getElementById('main');
function render(){
  document.querySelectorAll('.tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab===tab?'true':'false');});
  document.getElementById('syncnote').textContent=syncMode==='akun'?'Progres dan kotoba tersimpan di akun Anda dan di browser ini.':'Progres dan kotoba tersimpan di browser ini.';
  if(tab==='stats')return renderStats();
  if(tab==='hist')return renderHist();
  if(tab==='words')return renderWords();
  if(view==='study')return renderStudy();
  if(view==='done')return renderDone();
  renderPick();
}
function chapterProgress(l){var h=0,s=0;l.c.forEach(function(c){if(S.marks[c.id])h++;if(S.seen[c.id])s++;});return {h:h,s:s,n:l.c.length};}
function books(){var r=[];LESSONS.forEach(function(l){if(r.indexOf(l.b)<0)r.push(l.b);});return r;}
function ago(t){var m=Math.round((Date.now()-t)/60000);if(m<1)return 'baru saja';if(m<60)return m+' menit lalu';var h=Math.round(m/60);if(h<24)return h+' jam lalu';return Math.round(h/24)+' hari lalu';}

function renderPick(){
  var html='',rs=S.session,size=buildDeck().length;
  if(rs&&rs.pos<rs.ids.length&&CARD[rs.ids[rs.pos]]){
    var cd=card(rs.ids[rs.pos]);
    html+='<div class="resume"><p><b>Lanjutkan hafalan terakhir</b><small>'+esc(lname(cd.l))+' · kartu '+(rs.pos+1)+' dari '+rs.ids.length+' · '+ago(rs.updated)+'</small></p><button class="btn primary" data-act="resume">Lanjutkan</button></div>';
  }
  html+='<section class="panel"><h2>Pilih bab</h2>';
  if(!LESSONS.length)html+='<p class="empty">Belum ada bab. Tambahkan bab di tab Kotoba.</p>';
  books().forEach(function(b){
    var ls=LESSONS.filter(function(l){return l.b===b;});
    var tot=0,hf=0;ls.forEach(function(l){var p=chapterProgress(l);tot+=p.n;hf+=p.h;});
    html+='<div class="book"><b>'+esc(bookName(b))+'</b><span class="row"><span style="color:var(--muted);font-size:.8rem">'+hf+'/'+tot+' hafal</span><button class="btn small" data-act="selall" data-book="'+b+'">Pilih semua</button><button class="btn small" data-act="selnone" data-book="'+b+'">Kosongkan</button></span></div>';
    html+='<div class="chs">';
    ls.forEach(function(l){
      var p=chapterProgress(l);var pct=p.n?Math.round(p.h/p.n*100):0;
      html+='<label class="ch"><input type="checkbox" data-ch="'+esc(l.id)+'"'+(sel[l.id]?' checked':'')+'><span class="t"><b>Bab '+l.n+'</b><span class="s">'+esc(l.t)+'</span><div class="bar"><i style="width:'+pct+'%"></i></div></span><span class="n">'+p.h+'/'+p.n+'</span></label>';
    });
    html+='</div>';
  });
  html+='</section>';
  html+='<section class="panel"><h2>Pengaturan sesi</h2><div class="opts">'+
   '<div><span>Urutan kartu</span><div class="seg"><button data-act="opt" data-o="order" data-v="seq" aria-pressed="'+(cfg.order==='seq')+'">Berurutan</button><button data-act="opt" data-o="order" data-v="rand" aria-pressed="'+(cfg.order==='rand')+'">Acak</button></div></div>'+
   '<div><span>Jenis kartu</span><div class="seg"><button data-act="opt" data-o="kanji" data-v="all" aria-pressed="'+(cfg.kanji==='all')+'">Semua</button><button data-act="opt" data-o="kanji" data-v="kanji" aria-pressed="'+(cfg.kanji==='kanji')+'">Hanya berkanji</button></div></div>'+
   '<div><span>Status hafalan</span><div class="seg"><button data-act="opt" data-o="only" data-v="all" aria-pressed="'+(cfg.only==='all')+'">Semua</button><button data-act="opt" data-o="only" data-v="new" aria-pressed="'+(cfg.only==='new')+'">Belum hafal</button></div></div>'+
   '</div><div class="row"><button class="btn primary" data-act="start" '+(size?'':'disabled')+'>Mulai hafalan ('+size+' kartu dari '+selCount()+' bab)</button></div></section>';
  main.innerHTML=html;
}

function renderStudy(){
  var s=S.session;if(!s){view='pick';return render();}
  var pct=Math.round(s.pos/s.ids.length*100);
  main.innerHTML='<div class="studytop"><button class="btn small" data-act="exit">‹ Bab</button><div class="grow"><div class="cnt"><span id="cnt"></span><span>'+pct+'%</span></div><div class="bar big"><i style="width:'+pct+'%"></i></div></div></div>'+
   '<div class="cardwrap"><button class="card" id="card" data-act="flip" aria-label="Balik kartu"><div class="face front"><div class="tag"><span id="t1"></span><span></span></div><div class="kanji" id="kf"></div><div class="hint">Ketuk kartu untuk melihat arti · geser untuk pindah</div></div>'+
   '<div class="face back"><div class="tag"><span id="t2"></span><span id="t3"></span></div><div class="small-k" id="kb"></div><div class="mean" id="mn"></div><div class="read" id="rd"></div></div></button></div>'+
   '<div class="row" style="justify-content:flex-end"><button class="btn small markbtn" id="mark" data-act="mark" aria-pressed="false">☆ Tandai hafal</button></div>'+
   '<div class="nav2"><button class="btn" id="prev" data-act="prev">‹ Kembali</button><button class="btn primary" data-act="next">Lanjutkan ›</button></div>'+
   '<div class="kbd">Spasi / Enter: balik kartu · ← Kembali · → Lanjutkan</div>';
  var cardEl=document.getElementById('card'),x0=0,y0=0;
  cardEl.addEventListener('touchstart',function(e){var t=e.changedTouches[0];x0=t.clientX;y0=t.clientY;},{passive:true});
  cardEl.addEventListener('touchend',function(e){var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=Date.now();go(dx<0?1:-1);}},{passive:true});
  paintCard(true);
}
function paintCard(fresh){
  var s=S.session;if(!s)return;
  var id=s.ids[s.pos];if(!id)return;var c=card(id);
  var cardEl=document.getElementById('card');if(!cardEl||!c)return;
  document.getElementById('cnt').textContent='Kartu '+(s.pos+1)+' / '+s.ids.length;
  var kf=document.getElementById('kf');kf.textContent=c.k;
  var n=c.k.length;kf.style.fontSize=n<=2?'5.5rem':n<=4?'4rem':n<=8?'2.6rem':n<=14?'1.9rem':'1.4rem';
  document.getElementById('t1').textContent=lname(c.l);
  document.getElementById('t2').textContent=lname(c.l);
  document.getElementById('t3').textContent=(S.seen[id]?'dilihat '+S.seen[id]+'×':'baru');
  document.getElementById('kb').textContent=c.k;
  document.getElementById('mn').textContent=c.m;
  document.getElementById('rd').textContent=c.r&&c.r!==c.k?c.r:(c.kj?'':'(sama dengan tulisan)');
  var mk=document.getElementById('mark'),on=!!S.marks[id];
  mk.setAttribute('aria-pressed',on);mk.textContent=on?'★ Sudah hafal':'☆ Tandai hafal';
  if(fresh&&flipped===false){cardEl.style.transition='none';cardEl.classList.remove('flip');void cardEl.offsetWidth;cardEl.style.transition='';}
  cardEl.classList.toggle('flip',flipped);
  var pv=document.getElementById('prev');pv.disabled=s.pos===0;pv.style.opacity=s.pos===0?'.45':'1';
}
function renderDone(){
  var s=S.session;
  main.innerHTML='<div class="panel done"><h3>お疲れ様でした</h3><p>Semua '+s.ids.length+' kartu sudah dilihat. Kartu yang Anda tandai hafal di sesi ini: <b>'+s.newHafal+'</b>.</p><div class="row" style="justify-content:center"><button class="btn" data-act="doneback">‹ Kartu terakhir</button><button class="btn" data-act="again">Ulangi dari awal</button><button class="btn primary" data-act="pickother">Pilih bab lain</button></div></div>';
}
