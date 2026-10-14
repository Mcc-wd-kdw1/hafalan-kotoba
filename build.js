// Menyusun semua file di folder src/ menjadi satu file www/index.html.
// Jalankan: node build.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');
const read = (f) => fs.readFileSync(path.join(src, f), 'utf8');
const gagal = (pesan) => { console.error('GAGAL: ' + pesan); process.exit(1); };

// 1. Data kotoba harus JSON yang benar dan lengkap
let kotoba;
try { kotoba = JSON.parse(read('data/kotoba.json')); }
catch (e) { gagal('src/data/kotoba.json bukan JSON yang benar. ' + e.message); }
if (!Array.isArray(kotoba)) gagal('Isi kotoba.json harus berupa daftar bab [ ... ].');
const idPakai = {};
let jumlahKata = 0;
kotoba.forEach((bab, i) => {
  const nama = 'bab ke-' + (i + 1) + (bab && bab.id ? ' (id ' + bab.id + ')' : '');
  if (!bab || typeof bab.id !== 'string' || !bab.id) gagal(nama + ': "id" wajib berupa teks.');
  if (idPakai[bab.id]) gagal(nama + ': "id" ' + bab.id + ' dipakai dua kali.');
  idPakai[bab.id] = true;
  if (!Number.isInteger(bab.b) || !Number.isInteger(bab.n)) gagal(nama + ': "b" dan "n" wajib angka bulat.');
  if (typeof bab.t !== 'string') gagal(nama + ': "t" (judul) wajib berupa teks.');
  if (!Array.isArray(bab.c)) gagal(nama + ': "c" (daftar kata) wajib berupa daftar.');
  bab.c.forEach((w, j) => {
    if (!Array.isArray(w) || w.length < 3 || !w[0] || !w[2] || typeof w[0] !== 'string' || typeof w[1] !== 'string' || typeof w[2] !== 'string') {
      gagal(nama + ', kata ke-' + (j + 1) + ': format harus ["tulisan", "bacaan", "arti", 1 atau 0].');
    }
  });
  jumlahKata += bab.c.length;
});

// 2. Gabungkan file JavaScript berurutan sesuai nama (00, 10, 20, ...)
const dirJs = path.join(src, 'js');
const fileJs = fs.readdirSync(dirJs).filter((f) => f.endsWith('.js')).sort();
const js = "(function(){\n'use strict';\n" +
  fileJs.map((f) => '// ===== ' + f + ' =====\n' + read('js/' + f)).join('\n') +
  '\n})();';
try { new Function(js); }
catch (e) { gagal('Ada kesalahan penulisan JavaScript. ' + e.message + '\n(Periksa file di src/js/)'); }

// 3. Masukkan CSS, data, dan JavaScript ke kerangka HTML
const data = JSON.stringify(kotoba).replace(/<\//g, '<\\/');
let html = read('index.html');
['/*@CSS*/', '@@DATA@@', '/*@JS*/'].forEach((p) => { if (!html.includes(p)) gagal('src/index.html kehilangan penanda ' + p); });
html = html.replace('/*@CSS*/', () => read('css/style.css'))
           .replace('@@DATA@@', () => data)
           .replace('/*@JS*/', () => js);

fs.mkdirSync(path.join(__dirname, 'www'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'www', 'index.html'), html);
console.log('Berhasil: www/index.html (' + kotoba.length + ' bab, ' + jumlahKata + ' kata, ' + fileJs.length + ' file JavaScript, ' + Math.round(html.length / 1024) + ' KB)');
