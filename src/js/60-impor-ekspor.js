// ---------- impor & ekspor ----------
var libP={};
function loadLib(url){
  if(libP[url])return libP[url];
  libP[url]=new Promise(function(res,rej){var s=document.createElement('script');s.src=url;s.onload=res;s.onerror=function(){delete libP[url];rej(new Error('Gagal memuat pustaka. Periksa koneksi internet.'));};document.head.appendChild(s);});
  return libP[url];
}
var URL_XLSX='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
var URL_JSPDF='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
var URL_PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
var URL_PDFW='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
function ioFlash(t,err){ioMsg=t;ioErr=!!err;var n=document.getElementById('ionote');if(n){n.textContent=t;n.className='note'+(err?' err':'');}}
function ioScope(){return wLid?'chapter':'home';}
var HEAD=['buku','bab','judul','kata','bacaan','arti'];
function exportRows(scope){
  var ls=scope==='chapter'?[BYID[wLid]]:LESSONS,rows=[HEAD.slice()];
  ls.forEach(function(l){if(l)l.c.forEach(function(c){rows.push([l.b,l.n,l.t,c.k,c.r,c.m]);});});
  return rows;
}
function fileBase(scope){var l=scope==='chapter'?BYID[wLid]:null;return l?('kotoba-irodori-b'+l.b+'-bab'+l.n):'kotoba-irodori-semua';}
function csvEsc(v){v=String(v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function b64(data){
  if(typeof data==='string')data=new TextEncoder().encode(data);
  var u=data instanceof ArrayBuffer?new Uint8Array(data):Array.isArray(data)?Uint8Array.from(data):new Uint8Array(data.buffer,data.byteOffset,data.byteLength);
  var s='';for(var i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));
  return btoa(s);
}
function isNative(){try{return !!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());}catch(e){return false;}}
function nativeSave(name,data){
  var P=Capacitor.Plugins;
  return P.Filesystem.writeFile({path:name,data:b64(data),directory:'CACHE'})
    .then(function(){return P.Filesystem.getUri({path:name,directory:'CACHE'});})
    .then(function(u){return P.Share.share({title:name,url:u.uri,dialogTitle:'Simpan atau kirim '+name});});
}
function saveOut(name,data,text){
  if(isNative()){
    return nativeSave(name,data).then(function(){ioFlash('Berkas siap: '+name);}).catch(function(e){
      var m=String((e&&e.message)||e||'');
      if(/cancel/i.test(m)){ioFlash('Dibatalkan.');return;}
      if(text){ioText=text;ioFlash('Gagal menyimpan berkas. Teks di bawah bisa disalin.',true);renderWords2();return;}
      ioFlash('Gagal menyimpan berkas: '+m,true);
    });
  }
  var p=(window.claude&&window.claude.use)?window.claude.use('downloads'):Promise.resolve(null);
  return p.then(function(dl){
    if(!dl)throw {code:'unavailable'};
    return dl.save({filename:name,data:data});
  }).then(function(){ioFlash('Berkas siap: '+name);}).catch(function(e){
    var c=e&&e.code;
    if(c==='declined'){ioFlash('Unduhan dibatalkan.');return;}
    if(text){ioText=text;ioFlash('Unduhan tidak tersedia di tampilan ini. Teks di bawah bisa disalin dan ditempel ke berkas .'+name.split('.').pop()+'.',true);renderWords2();return;}
    ioFlash('Unduhan format ini tidak tersedia di tampilan ini. Coba CSV atau TXT.',true);
  });
}
function renderWords2(){var y=window.scrollY;render();window.scrollTo(0,y);}
function doExport(f,scope){
  var rows=exportRows(scope);
  if(rows.length<2){ioFlash('Tidak ada kata untuk diekspor.',true);return;}
  var base=fileBase(scope);ioText='';
  if(f==='csv'){var csv='﻿'+rows.map(function(r){return r.map(csvEsc).join(',');}).join('\r\n');return saveOut(base+'.csv',csv,csv);}
  if(f==='txt'){var tx=rows.map(function(r){return r.join(' | ');}).join('\n');return saveOut(base+'.txt',tx,tx);}
  if(f==='xlsx'){
    ioFlash('Menyiapkan Excel…');
    return loadLib(URL_XLSX).then(function(){
      var ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:6},{wch:6},{wch:28},{wch:22},{wch:22},{wch:44}];
      var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Kotoba');
      var out=XLSX.write(wb,{bookType:'xlsx',type:'array'});
      return saveOut(base+'.xlsx',out,null);
    }).catch(function(e){ioFlash(e.message||'Gagal membuat Excel.',true);});
  }
  if(f==='pdf'){
    ioFlash('Menyiapkan PDF…');
    return loadLib(URL_JSPDF).then(function(){return buildPdf(rows,scope);}).then(function(buf){return saveOut(base+'.pdf',buf,null);}).catch(function(e){ioFlash(e.message||'Gagal membuat PDF.',true);});
  }
}
function buildPdf(rows,scope){
  var fonts=['500 24px "Shippori Mincho"','400 22px "Zen Kaku Gothic New"','700 22px "Zen Kaku Gothic New"'];
  return Promise.all(fonts.map(function(f){return document.fonts.load(f,'あ漢Aa').catch(function(){});})).then(function(){
    var W=1000,H=1414,M=64,cvs=document.createElement('canvas');cvs.width=W;cvs.height=H;
    var ctx=cvs.getContext('2d'),pages=[],y=0;
    var cols=[{x:M,w:290},{x:M+310,w:250},{x:M+580,w:W-2*M-580}];
    var KF='500 26px "Shippori Mincho","Hiragino Mincho ProN",serif',BF='400 21px "Zen Kaku Gothic New","Hiragino Sans",sans-serif',BB='700 21px "Zen Kaku Gothic New","Hiragino Sans",sans-serif';
    var LH=30;
    function wrap(text,font,maxW){
      ctx.font=font;var lines=[],cur='';
      String(text).split(/(\s+)/).forEach(function(tok){
        if(!tok)return;
        if(ctx.measureText(cur+tok).width<=maxW){cur+=tok;return;}
        if(cur.trim()){lines.push(cur.trim());cur='';}
        if(ctx.measureText(tok).width<=maxW){cur=tok.replace(/^\s+/,'');return;}
        tok.split('').forEach(function(ch){if(ctx.measureText(cur+ch).width>maxW){lines.push(cur);cur=ch;}else cur+=ch;});
      });
      if(cur.trim())lines.push(cur.trim());
      return lines.length?lines:[''];
    }
    function newPage(){
      if(y)pages.push(cvs.toDataURL('image/jpeg',0.88));
      ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#182038';
      ctx.font='700 30px "Shippori Mincho",serif';ctx.fillText('Hafalan Kotoba Irodori',M,M+10);
      ctx.font=BF;ctx.fillStyle='#586180';ctx.fillText('by Iman · halaman '+(pages.length+1),M,M+42);
      ctx.fillStyle='#182038';y=M+86;
      ctx.font=BB;ctx.fillStyle='#586180';ctx.fillText('KATA',cols[0].x,y);ctx.fillText('BACAAN',cols[1].x,y);ctx.fillText('ARTI',cols[2].x,y);
      ctx.strokeStyle='#2e4ab5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,y+10);ctx.lineTo(W-M,y+10);ctx.stroke();
      y+=18;
    }
    newPage();
    var lastKey='';
    for(var i=1;i<rows.length;i++){
      var r=rows[i],key=r[0]+'-'+r[1];
      if(key!==lastKey){
        lastKey=key;
        if(y+LH*3>H-M)newPage();
        y+=22;ctx.font='700 24px "Shippori Mincho",serif';ctx.fillStyle='#2e4ab5';
        var hl=wrap('Buku '+r[0]+' · Bab '+r[1]+' · '+r[2],'700 24px "Shippori Mincho",serif',W-2*M)[0];
        ctx.fillText(hl,M,y+LH-6);y+=LH+8;ctx.fillStyle='#182038';
      }
      var a=wrap(r[3],KF,cols[0].w),b=wrap(r[4]===r[3]?'':r[4],KF,cols[1].w),c=wrap(r[5],BF,cols[2].w);
      var n=Math.max(a.length,b.length,c.length),h=n*LH+14;
      if(y+h>H-M)newPage();
      ctx.fillStyle='#182038';ctx.font=KF;a.forEach(function(s,j){ctx.fillText(s,cols[0].x,y+LH*(j+1)-6);});
      ctx.fillStyle='#2e4ab5';ctx.font=KF;b.forEach(function(s,j){ctx.fillText(s,cols[1].x,y+LH*(j+1)-6);});
      ctx.fillStyle='#182038';ctx.font=BF;c.forEach(function(s,j){ctx.fillText(s,cols[2].x,y+LH*(j+1)-6);});
      y+=h;ctx.strokeStyle='#d8dbe8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(M,y-6);ctx.lineTo(W-M,y-6);ctx.stroke();
    }
    pages.push(cvs.toDataURL('image/jpeg',0.88));
    var doc=new window.jspdf.jsPDF({unit:'pt',format:'a4',compress:true}),pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight();
    pages.forEach(function(p,i){if(i)doc.addPage();doc.addImage(p,'JPEG',0,0,pw,ph);});
    return doc.output('arraybuffer');
  });
}

// impor
function parseCSV(text,delim){
  var rows=[],row=[],cell='',q=false;text=text.replace(/^﻿/,'');
  for(var i=0;i<text.length;i++){
    var ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else q=false;}else cell+=ch;}
    else if(ch==='"'&&cell===''){q=true;}
    else if(ch===delim){row.push(cell);cell='';}
    else if(ch==='\n'){row.push(cell);rows.push(row);row=[];cell='';}
    else if(ch==='\r'){}
    else cell+=ch;
  }
  if(cell!==''||row.length){row.push(cell);rows.push(row);}
  return rows.map(function(r){return r.map(function(c){return c.trim();});}).filter(function(r){return r.some(function(c){return c;});});
}
function parseDelimited(text){
  var first=(text.split(/\r?\n/).filter(function(l){return l.trim();})[0])||'';
  var d=first.indexOf('\t')>=0?'\t':first.indexOf('|')>=0?'|':',';
  return parseCSV(text,d);
}
function normH(s){return String(s==null?'':s).toLowerCase().replace(/\s+/g,' ').trim();}
var ALIAS={b:['buku','book'],n:['bab','chapter'],t:['judul','judul bab','title'],k:['kata','kanji','kotoba','word','kosakata'],r:['bacaan','cara baca','hiragana','reading','yomi'],m:['arti','makna','meaning','terjemahan']};
function mapHeader(row){
  var map={};
  row.forEach(function(c,i){var h=normH(c);Object.keys(ALIAS).forEach(function(k){if(ALIAS[k].indexOf(h)>=0&&map[k]===undefined)map[k]=i;});});
  return (map.k!==undefined&&map.m!==undefined)?map:null;
}
function tableToRows(tbl){
  var out=[],skip=0,start=0,map=tbl.length?mapHeader(tbl[0]):null;
  if(map)start=1;
  else{
    var w=0;tbl.slice(0,6).forEach(function(r){w=Math.max(w,r.length);});
    map=w>=6?{b:0,n:1,t:2,k:3,r:4,m:5}:w>=3?{k:0,r:1,m:2}:{k:0,m:1};
  }
  function cell(r,i){return i===undefined?'':String(r[i]==null?'':r[i]).trim();}
  for(var i=start;i<tbl.length;i++){
    var r=tbl[i],k=cell(r,map.k),m=cell(r,map.m);
    if(!k||!m){skip++;continue;}
    out.push({b:parseInt(cell(r,map.b),10)||0,n:parseInt(cell(r,map.n),10)||0,t:cell(r,map.t),k:k,r:cell(r,map.r)||k,m:m});
  }
  return {rows:out,skip:skip};
}
function readAsBuf(file){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result);};fr.onerror=function(){rej(new Error('File tidak bisa dibaca.'));};fr.readAsArrayBuffer(file);});}
function readAsText(file){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(String(fr.result));};fr.onerror=function(){rej(new Error('File tidak bisa dibaca.'));};fr.readAsText(file,'utf-8');});}
function pdfToTable(buf){
  return loadLib(URL_PDFW).then(function(){return loadLib(URL_PDFJS);}).then(function(){
    var lib=window.pdfjsLib;try{lib.GlobalWorkerOptions.workerSrc=URL_PDFW;}catch(e){}
    return lib.getDocument({data:new Uint8Array(buf)}).promise;
  }).then(function(pdf){
    var tbl=[],chain=Promise.resolve();
    for(var p=1;p<=pdf.numPages;p++){(function(p){chain=chain.then(function(){return pdf.getPage(p);}).then(function(pg){return pg.getTextContent();}).then(function(tc){
      var items=tc.items.filter(function(it){return it.str&&it.str.trim();}).map(function(it){return {s:it.str,x:it.transform[4],y:it.transform[5],w:it.width};});
      items.sort(function(a,b){return Math.abs(b.y-a.y)>3?b.y-a.y:a.x-b.x;});
      var lines=[],cur=null;
      items.forEach(function(it){if(cur&&Math.abs(cur.y-it.y)<=3)cur.items.push(it);else{cur={y:it.y,items:[it]};lines.push(cur);}});
      lines.forEach(function(L){
        L.items.sort(function(a,b){return a.x-b.x;});
        var cells=[],c='',prevEnd=null;
        L.items.forEach(function(it){
          if(prevEnd!==null&&it.x-prevEnd>10){cells.push(c.trim());c='';}
          c+=(prevEnd!==null&&it.x-prevEnd>1&&it.x-prevEnd<=10?' ':'')+it.s;prevEnd=it.x+it.w;
        });
        cells.push(c.trim());
        if(cells.length===1&&cells[0].indexOf('|')>=0)cells=cells[0].split('|').map(function(x){return x.trim();});
        cells=cells.filter(function(x){return x!=='';});
        if(cells.length>=2)tbl.push(cells);
      });
    });})(p);}
    return chain.then(function(){return tbl;});
  });
}
function fileToTables(file){
  var ext=(file.name.split('.').pop()||'').toLowerCase();
  if(ext==='csv'||ext==='tsv'||ext==='txt')return readAsText(file).then(function(t){return {tables:[parseDelimited(t)]};});
  if(ext==='json')return readAsText(file).then(function(t){
    var o=JSON.parse(t);
    if(o&&!Array.isArray(o)&&o.deck)return {backup:o};
    if(!Array.isArray(o))throw new Error('Format JSON tidak dikenali. Gunakan cadangan dari aplikasi ini atau daftar kata.');
    var tbl=[HEAD.slice()];
    o.forEach(function(x){tbl.push([x.buku||x.b||'',x.bab||x.n||'',x.judul||x.t||'',x.kata||x.k||'',x.bacaan||x.r||'',x.arti||x.m||'']);});
    return {tables:[tbl]};
  });
  if(ext==='xlsx'||ext==='xls')return Promise.all([readAsBuf(file),loadLib(URL_XLSX)]).then(function(r){
    var wb=XLSX.read(r[0],{type:'array'});
    return {tables:wb.SheetNames.map(function(n){return XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:false,defval:''}).map(function(row){return row.map(function(c){return String(c).trim();});}).filter(function(row){return row.some(function(c){return c;});});})};
  });
  if(ext==='pdf')return readAsBuf(file).then(pdfToTable).then(function(t){if(!t.length)throw new Error('PDF ini tidak berisi teks yang bisa dibaca. PDF hasil pindai atau gambar tidak bisa diimpor. Gunakan CSV atau Excel.');return {tables:[t]};});
  throw new Error('Format .'+ext+' belum didukung. Gunakan CSV, Excel, TXT, JSON, atau PDF berteks.');
}
function handleImportFile(file){
  var scope=ioScope();ioText='';ioFlash('Membaca '+file.name+'…');
  fileToTables(file).then(function(res){
    if(res.backup){imp={scope:scope,name:file.name,kind:'backup',data:res.backup};ioFlash('');return renderWords2();}
    var rows=[],skip=0;
    res.tables.forEach(function(t){var x=tableToRows(t);rows=rows.concat(x.rows);skip+=x.skip;});
    if(!rows.length)throw new Error('Tidak ada kata yang terbaca. Pastikan ada kolom kata dan arti, atau gunakan format: kata | bacaan | arti.');
    imp={scope:scope,name:file.name,kind:'rows',rows:rows,skip:skip,mode:'add'};
    ioFlash('');renderWords2();
  }).catch(function(e){imp=null;ioFlash(e&&e.message?e.message:'Gagal membaca file.',true);renderWords2();});
}
function impGroups(){
  var g={};
  imp.rows.forEach(function(r){var key=(r.b&&r.n)?r.b+'-'+r.n:'x';(g[key]=g[key]||{b:r.b,n:r.n,t:r.t,rows:[]}).rows.push(r);if(r.t&&!g[key].t)g[key].t=r.t;});
  return g;
}
function impPreview(){
  if(imp.kind==='backup'){
    var nd=Object.keys(imp.data.deck||{}).length;
    return '<div class="form"><b>'+esc(imp.name)+'</b><span class="lead">Cadangan kotoba dengan '+nd+' bab diubah atau ditambah. Memulihkan akan mengganti perubahan kotoba Anda saat ini.</span><div class="row"><button class="btn small primary" data-act="impgo">Pulihkan cadangan</button><button class="btn small" data-act="impno">Batal</button></div></div>';
  }
  var g=impGroups(),keys=Object.keys(g),h='<div class="form"><b>'+esc(imp.name)+'</b><span class="lead">'+imp.rows.length+' kata terbaca'+(imp.skip?', '+imp.skip+' baris dilewati (kata atau arti kosong)':'')+'.</span>';
  if(imp.scope==='home'){
    var names=keys.slice(0,8).map(function(k){var x=g[k];return k==='x'?'bab baru ('+x.rows.length+')':'B'+x.b+'·'+x.n+' ('+x.rows.length+')';});
    h+='<span class="lead">Tujuan: '+esc(names.join(', '))+(keys.length>8?' +'+(keys.length-8)+' lainnya':'')+'. Bab yang belum ada akan dibuat. Baris tanpa kolom buku dan bab masuk ke bab baru.</span>';
  }else h+='<span class="lead">Semua kata dimasukkan ke bab ini.</span>';
  h+='<ul class="sample">'+imp.rows.slice(0,4).map(function(r){return '<li><b>'+esc(r.k)+'</b> · '+esc(r.r===r.k?'':r.r+' · ')+esc(r.m)+'</li>';}).join('')+(imp.rows.length>4?'<li>…</li>':'')+'</ul>';
  h+='<div class="seg"><button data-act="impmode" data-v="add" aria-pressed="'+(imp.mode==='add')+'">Tambahkan</button><button data-act="impmode" data-v="replace" aria-pressed="'+(imp.mode==='replace')+'">Ganti isi bab</button></div>';
  h+='<span class="lead">'+(imp.mode==='add'?'Kata yang sama persis (tulisan dan bacaan) tidak ditambahkan dua kali.':'Isi lama bab tujuan diganti dengan isi file. Progres hafalan kata yang dihapus ikut hilang.')+'</span>';
  h+='<div class="row"><button class="btn small primary" data-act="impgo">Impor '+imp.rows.length+' kata</button><button class="btn small" data-act="impno">Batal</button></div></div>';
  return h;
}
function applyImport(){
  if(imp.kind==='backup'){
    var o=imp.data,ok=o.deck&&typeof o.deck==='object'&&Object.keys(o.deck).every(function(k){var l=o.deck[k];return l&&Array.isArray(l.c)&&typeof l.b==='number'&&typeof l.n==='number';});
    if(!ok){imp=null;return ioFlash('Cadangan tidak valid.',true);}
    S.deck=o.deck;S.removed=(o.removed&&typeof o.removed==='object')?o.removed:{};imp=null;commit();ioFlash('Cadangan dipulihkan.');return;
  }
  var added=0,dup=0,newCh=0;
  function addTo(d,rows){
    if(imp.mode==='replace')d.c=[];
    var seen={};d.c.forEach(function(c){seen[c.k+'|'+c.r]=1;});
    rows.forEach(function(r){var key=r.k+'|'+r.r;if(seen[key]){dup++;return;}seen[key]=1;d.c.push({id:newId(d.id),k:r.k,r:r.r,m:r.m,kj:hasKanji(r.k)?1:0});added++;});
  }
  if(imp.scope==='chapter'){
    addTo(ensureDeck(wLid),imp.rows);
  }else{
    var g=impGroups(),bs=books(),lastB=bs.length?bs[bs.length-1]:1;
    Object.keys(g).forEach(function(key){
      var x=g[key],lid=null;
      if(key!=='x'){
        if(BASEBY[x.b+'-'+x.n]===undefined){BASE.forEach(function(l){if(l.b===x.b&&l.n===x.n)lid=l.id;});}else lid=x.b+'-'+x.n;
        if(!lid)LESSONS.forEach(function(l){if(l.b===x.b&&l.n===x.n)lid=l.id;});
        if(lid&&S.removed[lid])delete S.removed[lid];
      }
      var d;
      if(lid){d=ensureDeck(lid);if(x.t&&imp.mode==='replace')d.t=x.t;}
      else{
        var mx=0,b=key==='x'?lastB:x.b;
        LESSONS.forEach(function(l){if(l.b===b&&l.n>mx)mx=l.n;});BASE.forEach(function(l){if(l.b===b&&l.n>mx)mx=l.n;});
        var id='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        d=S.deck[id]={id:id,b:b,n:key==='x'?mx+1:x.n,t:x.t||(key==='x'?imp.name.replace(/\.[^.]+$/,''):'Bab '+x.n),c:[]};newCh++;
      }
      addTo(d,x.rows);
    });
  }
  imp=null;commit();
  ioFlash(added+' kata ditambahkan'+(dup?', '+dup+' duplikat dilewati':'')+(newCh?', '+newCh+' bab baru dibuat':'')+'.');
}
function ioPanel(scope){
  var h='<section class="panel"><h2>Impor &amp; ekspor '+(scope==='chapter'?'bab ini':'semua bab')+'</h2><p class="lead">Ekspor ke CSV atau Excel, edit di komputer, lalu impor kembali. PDF cocok untuk dibaca atau dicetak. Kolom file: buku, bab, judul, kata, bacaan, arti. File tiga kolom (kata, bacaan, arti) juga bisa.</p>';
  h+='<div class="row"><span class="lbl">Ekspor</span>'+[['csv','CSV'],['xlsx','Excel'],['pdf','PDF'],['txt','TXT']].map(function(f){return '<button class="btn small" data-act="exp" data-f="'+f[0]+'" data-s="'+scope+'">'+f[1]+'</button>';}).join('')+'</div>';
  h+='<div class="row"><span class="lbl">Impor</span><label class="btn small filebtn">Pilih file<input id="impfile" type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.json,.pdf" aria-label="Pilih file untuk diimpor"></label><span class="lead">CSV, Excel, TXT, JSON, PDF berteks</span></div>';
  if(imp&&imp.scope===scope)h+=impPreview();
  h+='<p class="note'+(ioErr?' err':'')+'" id="ionote">'+esc(ioMsg)+'</p>';
  if(ioText)h+='<textarea id="iotxt" readonly>'+esc(ioText)+'</textarea><div class="row"><button class="btn small primary" data-act="copy" data-t="iotxt">Salin</button></div>';
  return h+'</section>';
}
