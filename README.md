<<<<<<< HEAD
# POS Toko — Kasirin

Aplikasi Point of Sale (Kasir Toko Offline), gabungan dari dua modul tim:

- **Anggota 1 (PIC/Koordinator)** — Auth, User Management & Project Setup
- **Anggota 2** — Master Data Produk (Produk, Kategori, Supplier)

Dibangun dengan:
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite) + React Router, CSS custom (`global.css`) untuk modul Auth/User, Tailwind CSS untuk modul Produk
- **Autentikasi & Otorisasi:** JWT (access + refresh token), role `Admin` / `Manager` / `Kasir`

## Fitur

### Modul Auth, User Management (Anggota 1)
- Register/Login dengan JWT (access token + refresh token), password di-hash pakai bcrypt
- Role-based access control: `Admin`, `Manager`, `Kasir` — middleware `protect` & `authorize`
- CRUD User/Karyawan: tambah kasir baru, edit, hapus, nonaktifkan/aktifkan
- Halaman Login & Manajemen Akun di React

### Modul Master Data Produk (Anggota 2)
- Model MongoDB: `Produk`, `Kategori`, `Supplier`
- CRUD Produk (nama, harga beli, harga jual, stok, satuan, kategori, supplier, gambar, SKU/barcode, deskripsi)
- CRUD Kategori & Supplier
- Pencarian produk (nama/SKU) & filter (kategori/supplier) + pagination
- Upload & preview gambar produk (multer, disimpan di `backend/uploads`, disajikan lewat `/uploads`)
- Halaman React: daftar produk (tabel), form tambah/edit, manajemen Kategori & Supplier

### Pembagian akses (role)
| Role      | Lihat data (Produk/Kategori/Supplier) | Kelola data (tambah/edit/hapus) | Manajemen Karyawan |
|-----------|----------------------------------------|----------------------------------|---------------------|
| Admin     | ✅                                      | ✅                                | ✅                  |
| Manager   | ✅                                      | ✅                                | Lihat only          |
| Kasir     | ✅                                      | ❌                                | ❌                  |

## Struktur Folder

```
pos-toko-kasirin/
├── backend/
│   ├── config/db.js
│   ├── models/          (User, Produk, Kategori, Supplier)
│   ├── controllers/      (authController, userController, produkController, kategoriController, supplierController)
│   ├── routes/            (authRoutes, userRoutes, produkRoutes, kategoriRoutes, supplierRoutes)
│   ├── middleware/        (authMiddleware, roleMiddleware, validators, uploadMiddleware, errorMiddleware)
│   ├── seed/seedAdmin.js  (buat akun Admin awal)
│   ├── uploads/           (gambar produk tersimpan di sini)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axiosConfig.js     (koneksi ke backend, auto JWT header + auto-refresh token)
    │   ├── context/AuthContext.jsx
    │   ├── components/            (AppLayout, ProtectedRoute, ProdukForm, SimpleCrudManager)
    │   ├── pages/                 (Login, Dashboard, UserManagement, ProdukPage, KategoriPage, SupplierPage)
    │   ├── styles/                (global.css untuk shell/Auth, tailwind.css untuk modul Produk)
    │   └── App.jsx
    └── .env.example
```

## Cara Menjalankan

### 1. Backend

```bash
cd backend
cp .env.example .env      # sesuaikan MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run seed:admin        # buat akun Admin awal (email: admin@toko.com, password: admin123)
npm run dev                # jalan di http://localhost:5000
```

Pastikan MongoDB berjalan (lokal via `mongod`, atau gunakan MongoDB Atlas — tinggal ganti `MONGO_URI`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # sesuaikan VITE_API_URL jika perlu
npm install
npm run dev                # jalan di http://localhost:5173
```

### 3. Login

Buka `http://localhost:5173`, login dengan:
- **Email:** `admin@toko.com`
- **Password:** `admin123`

Setelah login sebagai Admin, buat akun `Manager`/`Kasir` lain lewat halaman **Manajemen Karyawan** (`/users`).

## Ringkasan Endpoint API

| Method | Endpoint                    | Akses            | Keterangan                          |
|--------|------------------------------|-------------------|--------------------------------------|
| POST   | /api/auth/register            | Publik            | Registrasi user                      |
| POST   | /api/auth/login                | Publik            | Login, dapat access + refresh token  |
| POST   | /api/auth/refresh              | Publik*            | Ambil access token baru              |
| GET    | /api/auth/me                    | Login (semua)      | Data user yang sedang login          |
| GET    | /api/users                      | Admin, Manager     | List karyawan (filter role/isActive) |
| POST   | /api/users                      | Admin              | Tambah karyawan baru                 |
| PUT    | /api/users/:id                  | Admin              | Update data karyawan                 |
| PUT    | /api/users/:id/password         | Admin / pemilik akun | Ganti password                    |
| PATCH  | /api/users/:id/toggle-active    | Admin              | Nonaktifkan / aktifkan karyawan      |
| DELETE | /api/users/:id                  | Admin              | Hapus karyawan                       |
| GET    | /api/produk                     | Login (semua)      | List + search + filter + pagination  |
| GET    | /api/produk/:id                 | Login (semua)      | Detail produk                        |
| POST   | /api/produk                     | Admin, Manager     | Tambah produk (multipart form)       |
| PUT    | /api/produk/:id                 | Admin, Manager     | Update produk                        |
| DELETE | /api/produk/:id                 | Admin, Manager     | Hapus produk                         |
| GET/POST/PUT/DELETE | /api/kategori     | Login / Admin,Manager | CRUD kategori                   |
| GET/POST/PUT/DELETE | /api/supplier     | Login / Admin,Manager | CRUD supplier                   |

\* Butuh refresh token valid di body request.

## Catatan Penggabungan Project

Project ini digabung dari dua repo terpisah (`pos-toko-offline-main` milik Anggota 1 dan `pos-app` milik Anggota 2). Beberapa penyesuaian yang dilakukan saat penggabungan:

- Sumber kebenaran (source of truth) untuk Auth & User memakai punya Anggota 1: login pakai **email** (bukan username), role `Admin/Manager/Kasir` (bukan `admin/kasir`), dan token JWT berupa access + refresh token.
- Route Produk/Kategori/Supplier disesuaikan memakai `protect` + `authorize` milik Anggota 1 (sebelumnya `authorize("admin")` diubah jadi `authorize("Admin", "Manager")`).
- Frontend modul Produk memakai Tailwind CSS, sedangkan shell aplikasi (Login, Dashboard, sidebar) memakai `global.css` buatan Anggota 1 — keduanya digabung dengan Tailwind `preflight` dimatikan agar tidak saling menimpa style.
- `express-async-errors` ditambahkan di `server.js` supaya error di controller Produk (async tanpa try/catch) otomatis tertangani oleh error handler terpusat.
- Folder `uploads/` untuk gambar produk & endpoint statis `/uploads` ditambahkan ke `server.js`.

## Catatan Pengembangan Lanjutan (di luar scope kedua modul ini)

- Transaksi Penjualan (keranjang, pembayaran, cetak struk) — akan mengurangi `stok` Produk otomatis
- Laporan penjualan & stok
- Riwayat perubahan stok (kartu stok / stock opname)
- Dokumentasi API lengkap (Postman/Swagger)
=======
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
>>>>>>> upstream/main
