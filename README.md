Pembagian Tugas (5 Anggota)
👤 Anggota 1 — Auth, User Management & Project Setup (PIC/Koordinator) (zidan)

Setup project: repo, struktur folder Express + React, konfigurasi MongoDB , environment
Autentikasi: Register/Login (JWT), hash password (bcrypt)
Otorisasi: Role-based access control (Admin, Manager, Kasir) — middleware proteksi route
CRUD User/Karyawan (tambah kasir baru, edit, hapus, nonaktifkan)
Halaman Login & manajemen akun di React
Koordinasi integrasi API antar modul + dokumentasi API (Postman/Swagger)

👤 Anggota 2 — Master Data Produk (cece)

Model MongoDB: Produk, Kategori, Supplier
CRUD Produk (nama, harga beli, harga jual, kategori, supplier, gambar, barcode/SKU)
CRUD Kategori & Supplier
Fitur pencarian & filter produk
Halaman React: daftar produk (tabel), form tambah/edit produk, upload gambar produk

👤 Anggota 3 — Transaksi Kasir (Core POS) (daffa)

Model MongoDB: Transaksi/Order, Detail Transaksi
API: buat transaksi baru, tambah item ke keranjang, hitung total (+diskon, pajak jika ada), proses pembayaran, generate nomor struk
Update stok otomatis saat transaksi (integrasi ke modul stok)
Halaman kasir di React: tampilan keranjang belanja, scan/cari produk, input jumlah, hitung kembalian, cetak/print struk (bisa pakai react-to-print atau generate PDF)
Ini modul paling krusial → alur bisnis utama toko

👤 Anggota 4 — Manajemen Stok & Customer (devara)

Model MongoDB: Stok/Inventory, Customer/Member
CRUD Stok: stok masuk (dari supplier), stok keluar, adjustment stok, histori pergerakan stok
Notifikasi/alert stok menipis (low stock warning)
CRUD Customer/Member (opsional: sistem poin/diskon member)
Halaman React: manajemen stok, riwayat stok masuk/keluar, manajemen customer

👤 Anggota 5 — Laporan, Dashboard & QA (rois)

API laporan: penjualan harian/mingguan/bulanan, produk terlaris, laba rugi sederhana, laporan stok
Dashboard admin: grafik penjualan (misal pakai Chart.js/Recharts), ringkasan omzet, transaksi terakhir
Export laporan ke Excel/PDF (opsional nilai tambah)
Testing keseluruhan sistem (cek alur bisnis end-to-end), perbaikan bug lintas modul
