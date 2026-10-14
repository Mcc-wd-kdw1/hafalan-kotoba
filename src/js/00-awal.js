var RAW=JSON.parse(document.getElementById('data').textContent);
var BASE=RAW.map(function(l){return {id:l.id,b:l.b,n:l.n,t:l.t,c:l.c.map(function(c,i){return {id:l.id+'#'+i,k:c[0],r:c[1],m:c[2],kj:c[3]};})};});
var BASEBY={};BASE.forEach(function(l){BASEBY[l.id]=l;});
var KEY='hafalan-kotoba-irodori-v1';
var S=null,LESSONS=[],BYID={},CARD={};
var tab='learn',view='pick',flipped=false,syncMode='lokal',confirmReset=false,swiped=0;
var sel={'1-1':1},cfg={order:'seq',kanji:'all',only:'all'};
// kelola kotoba
var wLid=null,wQ='',wEdit=null,wRename=false,wBulk=false,wExport=false,wNewCh=false,wConf=null,wNote='',bk=null,imp=null,ioMsg='',ioErr=false,ioText='';

function today(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function blank(){return {rev:0,marks:{},seen:{},daily:{},history:[],session:null,cfg:{order:'seq',kanji:'all',only:'all'},sel:{'1-1':1},deck:{},removed:{}};}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function hasKanji(s){return /[㐀-鿿]/.test(s);}
function bookName(b){return (b===1||b===2)?'Irodori Tingkat Dasar '+b:'Buku '+b;}
function lname(l){return 'Buku '+l.b+' · Bab '+l.n;}
