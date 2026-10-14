// ---------- statistik & riwayat ----------
function streak(){var n=0,d=new Date();if(!S.daily[today(d)])d.setDate(d.getDate()-1);while(S.daily[today(d)]){n++;d.setDate(d.getDate()-1);}return n;}
function renderStats(){
  var ids=allIds(),total=ids.length,hf=0,sn=0;
  ids.forEach(function(id){if(S.marks[id])hf++;if(S.seen[id])sn++;});
  var td=S.daily[today()]||0,sum7=0,pc=total?Math.round(hf/total*100):0;
  var days=[];for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=today(d);days.push({k:k,v:S.daily[k]||0,l:['Min','Sen','Sel','Rab','Kam','Jum','Sab'][d.getDay()]});sum7+=S.daily[k]||0;}
  var max=Math.max(5,Math.max.apply(null,days.map(function(x){return x.v;})));
  var W=360,H=150,pl=28,pb=22,pt=14,bw=28,gap=(W-pl-7*bw)/7;
  var svg='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Kartu dilihat 7 hari terakhir">';
  [0,.5,1].forEach(function(f){var y=pt+(H-pt-pb)*(1-f);svg+='<line class="grid" x1="'+pl+'" x2="'+W+'" y1="'+y+'" y2="'+y+'"/><text x="'+(pl-6)+'" y="'+(y+4)+'" text-anchor="end">'+Math.round(max*f)+'</text>';});
  days.forEach(function(x,i){var h=(H-pt-pb)*x.v/max,px=pl+gap/2+i*(bw+gap);svg+='<rect class="bar-r" x="'+px+'" y="'+(H-pb-h)+'" width="'+bw+'" height="'+Math.max(h,x.v?2:0)+'" rx="3"/><text x="'+(px+bw/2)+'" y="'+(H-6)+'" text-anchor="middle">'+x.l+'</text>';if(x.v)svg+='<text x="'+(px+bw/2)+'" y="'+(H-pb-h-4)+'" text-anchor="middle" style="fill:var(--ink)">'+x.v+'</text>';});
  svg+='</svg>';
  var html='<section class="panel"><h2>Ringkasan</h2><div class="tiles">'+
   '<div class="tile"><b>'+hf+'<small style="font-size:.9rem;color:var(--muted)"> / '+total+'</small></b><span>kartu hafal ('+pc+'%)</span></div>'+
   '<div class="tile"><b>'+sn+'</b><span>kartu pernah dilihat</span></div>'+
   '<div class="tile"><b>'+td+'</b><span>kartu dilihat hari ini</span></div>'+
   '<div class="tile"><b>'+streak()+'</b><span>hari berturut-turut</span></div></div>'+
   '<div class="bar big" title="Hafal"><i style="width:'+(total?hf/total*100:0)+'%;background:var(--good)"></i></div></section>'+
   '<section class="panel"><h2>7 hari terakhir · '+sum7+' kartu</h2>'+svg+'</section>';
  html+='<section class="panel"><h2>Progres per bab</h2><div class="legend"><span><i style="background:var(--good)"></i>Hafal</span><span><i style="background:var(--accent-soft);border:1px solid var(--line)"></i>Pernah dilihat</span></div>';
  LESSONS.forEach(function(l){var p=chapterProgress(l),n=p.n||1;html+='<div class="statrow"><span>B'+l.b+' · Bab '+l.n+'</span><div class="bar"><i class="seen" style="width:'+(p.s/n*100)+'%"></i><i class="hf" style="width:'+(p.h/n*100)+'%"></i></div><em>'+p.h+'/'+p.n+'</em></div>';});
  html+='</section>';
  html+='<section class="panel"><h2>Data</h2>'+(confirmReset?'<div class="confirm"><span>Hapus semua progres hafalan? Kotoba tidak ikut terhapus.</span><button class="btn small" data-act="rno">Batal</button><button class="btn small danger fill" data-act="ryes">Ya, hapus</button></div>':'<div class="row"><button class="btn small" data-act="reset">Reset semua progres</button></div>')+'</section>';
  main.innerHTML=html;
}
function renderHist(){
  var html='<section class="panel"><h2>Riwayat sesi hafalan</h2>';
  if(!S.history.length)html+='<p class="empty">Belum ada sesi. Pilih bab di tab Belajar lalu mulai hafalan.</p>';
  else{html+='<div class="hist">';S.history.slice(0,60).forEach(function(h){
    var names=h.chs.map(function(id){var l=BYID[id];return l?('B'+l.b+'·'+l.n):'(dihapus)';});
    var nm=names.length>6?names.slice(0,6).join(', ')+' +'+(names.length-6):names.join(', ');
    var dt=new Date(h.t);
    html+='<div class="it"><div><b>'+esc(nm)+'</b><br><small>'+dt.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})+' '+dt.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+'</small></div><div style="text-align:right"><span style="font-variant-numeric:tabular-nums">Sampai kartu '+Math.min(h.pos+1,h.total)+' / '+h.total+'</span><br><small>'+h.viewed+' dilihat · '+h.hafal+' ditandai hafal</small></div></div>';});
    html+='</div>';}
  html+='</section>';
  main.innerHTML=html;
}
