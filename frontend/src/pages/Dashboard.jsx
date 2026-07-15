import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Ringkasan</div>
        <h1>Selamat datang, {user?.name}</h1>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={{ margin: 0, color: 'var(--color-muted)' }}>
          Modul kasir, produk, dan laporan penjualan akan tampil di sini
          setelah dikembangkan oleh anggota tim lain. Bagian ini (Anggota 1)
          menyediakan fondasi autentikasi, otorisasi role, dan manajemen
          karyawan yang menjadi dasar seluruh modul lainnya.
        </p>
      </div>
    </AppLayout>
  );
}
