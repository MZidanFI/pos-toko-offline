# POS Toko Offline — Modul Anggota 1 (Auth, User Management & Setup)

Fondasi untuk aplikasi kasir: autentikasi JWT, otorisasi role-based (Admin/Manager/Kasir),
dan CRUD karyawan. Modul lain (Produk, Transaksi, Laporan) tinggal mount routes-nya
ke `backend/server.js` dan tambah menu di `frontend/src/components/AppLayout.jsx`.

## Struktur Folder

```
pos-app/
├── backend/            # Express API
│   ├── config/db.js
│   ├── models/User.js
│   ├── middleware/      # authMiddleware, roleMiddleware, validators
│   ├── controllers/     # authController, userController
│   ├── routes/          # authRoutes, userRoutes
│   ├── seed/seedAdmin.js
│   └── server.js
└── frontend/            # React (Vite)
    └── src/
        ├── api/axiosConfig.js
        ├── context/AuthContext.jsx
        ├── components/ (ProtectedRoute, AppLayout)
        └── pages/ (Login, Dashboard, UserManagement)
```

## Menjalankan Backend

```bash
cd backend
cp .env.example .env      # lalu isi MONGO_URI & JWT_SECRET
npm install
node seed/seedAdmin.js    # buat akun Admin pertama (admin@toko.com / admin123)
npm run dev               # jalan di http://localhost:5000
```

## Menjalankan Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # jalan di http://localhost:5173
```

Login dengan `admin@toko.com` / `admin123`, lalu segera ganti password.

## Endpoint API

| Method | Endpoint                    | Akses           | Keterangan                        |
|--------|------------------------------|-----------------|------------------------------------|
| POST   | /api/auth/register           | Public          | Registrasi user baru               |
| POST   | /api/auth/login              | Public          | Login, dapat access & refresh token|
| POST   | /api/auth/refresh            | Public          | Perbarui access token              |
| GET    | /api/auth/me                 | Login           | Data user yang sedang login        |
| GET    | /api/users                   | Admin, Manager  | List semua karyawan                |
| GET    | /api/users/:id                | Admin, Manager  | Detail satu karyawan               |
| POST   | /api/users                    | Admin           | Tambah karyawan baru               |
| PUT    | /api/users/:id                | Admin           | Update data karyawan               |
| PUT    | /api/users/:id/password       | Admin / pemilik | Ganti password                     |
| PATCH  | /api/users/:id/toggle-active  | Admin           | Aktifkan/nonaktifkan karyawan      |
| DELETE | /api/users/:id                | Admin           | Hapus karyawan                     |

Semua request ber-otorisasi wajib header: `Authorization: Bearer <accessToken>`.

## Integrasi untuk Anggota Lain

- Import `protect` dari `middleware/authMiddleware.js` untuk memproteksi route baru.
- Import `authorize('Admin', 'Manager')` dari `middleware/roleMiddleware.js` untuk
  membatasi akses berdasarkan role di route kalian (mis. modul transaksi/laporan).
- `req.user` otomatis tersedia di controller setelah lewat `protect` (berisi data user login).
- Dokumentasikan endpoint baru kalian di file Postman/Swagger terpisah, lalu gabungkan
  dengan collection ini agar satu pintu.
