# Hafalan Kotoba Irodori by Iman

Aplikasi hafalan kotoba Irodori (Tingkat Dasar 1 dan 2). Kode dipecah per bagian di folder `src/`, lalu disusun otomatis menjadi satu file dan dibangun menjadi APK oleh GitHub.

## Isi folder

| Lokasi | Isinya | Kapan diubah |
| --- | --- | --- |
| `src/data/kotoba.json` | Semua bab dan kata. Satu kata per baris | Menambah atau memperbaiki kotoba bawaan |
| `src/css/style.css` | Warna, ukuran huruf, tampilan kartu | Mengubah tampilan |
| `src/index.html` | Kerangka halaman, judul, menu bawah | Mengubah judul atau menu |
| `src/js/00-awal.js` | Pembaca data dan pengaturan dasar | Jarang |
| `src/js/10-penyimpanan.js` | Simpan dan muat progres | Jarang |
| `src/js/20-data-kotoba.js` | Gabungan data asli dan perubahan pengguna | Jarang |
| `src/js/30-kartu.js` | Logika kartu: balik, pindah, tanda hafal | Mengubah cara hafalan |
| `src/js/40-tampilan.js` | Layar Belajar dan kartu | Mengubah layar Belajar |
| `src/js/50-kelola-kotoba.js` | Tab Kotoba: tambah, ubah, hapus | Mengubah menu Kotoba |
| `src/js/60-impor-ekspor.js` | Impor dan ekspor CSV, Excel, PDF, TXT | Mengubah format file |
| `src/js/70-statistik-riwayat.js` | Tab Statistik dan Riwayat | Mengubah statistik |
| `src/js/80-aksi.js` | Reaksi saat tombol ditekan | Menambah tombol |
| `src/js/90-mulai.js` | Penyalaan awal aplikasi | Jarang |
| `keystore/debug.keystore` | Kunci tanda tangan APK debug supaya pembaruan bisa menimpa versi lama | Jangan diubah |
| `build.js` | Menyusun semua file di atas menjadi `www/index.html` | Hampir tidak pernah |
| `.github/workflows/build-apk.yml` | Perintah GitHub untuk membangun APK | Hampir tidak pernah |

File JavaScript digabung berurutan sesuai awalan angkanya (00, 10, 20, dan seterusnya). Untuk bagian baru, buat file dengan angka di antaranya, misalnya `65-fitur-baru.js`.

## Cara memperbarui

1. Buka file yang ingin diubah di GitHub, tekan ikon pensil, lalu ubah isinya.
2. Tekan **Commit changes**.
3. Buka tab **Actions**. Build berjalan sendiri, sekitar 5 sampai 8 menit.
4. Unduh APK terbaru di tab **Releases**. Nomor release naik setiap build.
5. Pasang APK baru di atas yang lama. Progres dan kotoba pengguna tetap ada, karena semua build memakai kunci yang sama dari folder `keystore/`.

Catatan: APK yang dipasang sebelum folder `keystore/` ada memakai kunci lain. Untuk pemasangan pertama dari versi baru ini, ekspor CSV dulu sebagai cadangan, hapus aplikasi lama, lalu pasang yang baru. Setelah itu pembaruan berikutnya bisa langsung menimpa.

## Menambah kotoba bawaan

Buka `src/data/kotoba.json`. Setiap bab berbentuk:

```json
{"id": "1-1", "b": 1, "n": 1, "t": "Judul bab","c":[
 ["先輩", "せんぱい", "kakak tingkat; senior", 1],
 ["ありがとう", "ありがとう", "terima kasih", 0]
]}
```

- `id`: kode unik bab. Jangan sama dengan bab lain.
- `b` dan `n`: nomor buku dan nomor bab.
- `t`: judul bab.
- Tiap kata: `["tulisan", "bacaan", "arti", 1 atau 0]`. Angka terakhir 1 bila mengandung kanji.
- Baris kata terakhir dalam satu bab tidak diberi koma. Baris bab terakhir juga tidak diberi koma.

Kalau penulisan salah, build berhenti dengan pesan yang menyebut bab dan kata yang bermasalah. Pesannya terlihat di tab Actions.

Kotoba yang diubah pengguna di dalam aplikasi (tab Kotoba) disimpan terpisah di HP. Mengubah `kotoba.json` tidak menimpa perubahan itu untuk bab yang sudah pernah diubah di aplikasi. Bab seperti itu bisa dikembalikan ke data bawaan lewat tombol "Kembalikan ke asli".

## Mencoba di komputer

Perlu Node.js. Jalankan `node build.js`, lalu buka `www/index.html` di Chrome.

## Catatan

- Ekspor dan impor Excel serta PDF memuat pustaka dari internet saat pertama dipakai. CSV dan TXT berjalan tanpa internet.
- APK ini versi debug. Bisa dipasang di HP, tetapi belum untuk Google Play.
