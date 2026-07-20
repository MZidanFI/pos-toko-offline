<<<<<<< HEAD
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

const QUICK_LINKS = [
  {
    to: '/produk',
    label: 'Master Data Produk',
    desc: 'Kelola daftar produk, harga, stok, kategori & supplier',
    roles: ['Admin', 'Manager', 'Kasir'],
  },
  {
    to: '/kategori',
    label: 'Kategori',
    desc: 'Kelola kategori produk',
    roles: ['Admin', 'Manager', 'Kasir'],
  },
  {
    to: '/supplier',
    label: 'Supplier',
    desc: 'Kelola data pemasok produk',
    roles: ['Admin', 'Manager', 'Kasir'],
  },
  {
    to: '/users',
    label: 'Manajemen Karyawan',
    desc: 'Kelola akun Admin, Manager & Kasir',
    roles: ['Admin', 'Manager'],
  },
];

export default function Dashboard() {
  const { user, hasRole } = useAuth();
=======
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
>>>>>>> upstream/main

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Ringkasan</div>
        <h1>Selamat datang, {user?.name}</h1>
      </div>

<<<<<<< HEAD
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={{ margin: 0, color: 'var(--color-muted)' }}>
          Aplikasi POS ini terdiri dari modul <strong>Auth &amp; Manajemen
          Karyawan</strong> serta modul <strong>Master Data Produk</strong>
          (Produk, Kategori, Supplier). Modul Transaksi &amp; Laporan
          Penjualan akan menyusul dikembangkan oleh anggota tim lain.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {QUICK_LINKS.filter((item) => hasRole(...item.roles)).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card"
            style={{ padding: 20, textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <h3 style={{ margin: '0 0 6px' }}>{item.label}</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)' }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
=======
      <div className="card" style={{ padding: 20 }}>
        <p style={{ margin: 0, color: 'var(--color-muted)' }}>
          Modul kasir, produk, dan laporan penjualan akan tampil di sini
          setelah dikembangkan oleh anggota tim lain. Bagian ini (Anggota 1)
          menyediakan fondasi autentikasi, otorisasi role, dan manajemen
          karyawan yang menjadi dasar seluruh modul lainnya.
        </p>
      </div>
>>>>>>> upstream/main
    </AppLayout>
  );
}
