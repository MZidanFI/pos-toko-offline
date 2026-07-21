import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

const QUICK_LINKS = [
  {
    to: '/pos',
    label: 'Transaksi Baru',
    desc: 'Buat transaksi penjualan baru',
    roles: ['Kasir'],
    highlight: true,
  },
  {
    to: '/transaksi',
    label: 'Riwayat Transaksi',
    desc: 'Lihat daftar transaksi & cetak struk',
    roles: ['Admin', 'Manager', 'Kasir'],
  },
  {
    to: '/produk',
    label: 'Master Data Produk',
    desc: 'Kelola produk, harga, stok, kategori & supplier',
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
    to: '/laporan',
    label: 'Laporan Penjualan',
    desc: 'Laporan transaksi & omzet',
    roles: ['Admin', 'Manager'],
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

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Ringkasan</div>
        <h1>Selamat datang, {user?.name}</h1>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <p style={{ margin: 0, color: 'var(--color-muted)', lineHeight: 1.6 }}>
          Aplikasi POS ini sudah dilengkapi dengan modul <strong>Transaksi</strong> (Kasir). 
          Anda dapat melakukan penjualan, melihat riwayat transaksi, dan mencetak struk.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {QUICK_LINKS.filter((item) => hasRole(...item.roles)).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card"
            style={{
              padding: 20,
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              border: item.highlight ? '2px solid var(--color-primary)' : undefined,
              transition: 'all 0.2s',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{item.label}</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)' }}>
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}