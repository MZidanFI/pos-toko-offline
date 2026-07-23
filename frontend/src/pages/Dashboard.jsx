import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardData,
  getProdukTerlaris,
  getLabaRugi,
  getLowStockProduk, // fungsi baru — tambahkan di laporanApi.js
} from '../api/laporanApi';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const QUICK_LINKS = [
  { to: '/pos', label: 'Transaksi Baru', desc: 'Buat transaksi penjualan baru', roles: ['Kasir'], highlight: true },
  { to: '/transaksi', label: 'Riwayat Transaksi', desc: 'Lihat daftar transaksi dan cetak struk', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/produk', label: 'Master Data Produk', desc: 'Kelola produk, harga, stok, kategori, dan supplier', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/kategori', label: 'Kategori', desc: 'Kelola kategori produk toko', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/supplier', label: 'Supplier', desc: 'Kelola data pemasok produk', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/laporan', label: 'Laporan Penjualan', desc: 'Lihat laporan transaksi dan omzet', roles: ['Admin', 'Manager'] },
  { to: '/users', label: 'Manajemen Karyawan', desc: 'Kelola akun Admin, Manager, dan Kasir', roles: ['Admin', 'Manager'] },
  { to: '/stok', label: 'Manajemen Stok', desc: 'Catat stok masuk, keluar, dan penyesuaian', roles: ['Admin', 'Manager'] },
];

export default function Dashboard() {
  const { user, hasRole } = useAuth();

  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [labaRugi, setLabaRugi] = useState(null);
  const [lowStockList, setLowStockList] = useState([]); // stok kritis, untuk SEMUA role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1) Data stok kritis — bisa diakses semua role (Kasir termasuk)
      try {
        const resLowStock = await getLowStockProduk();
        const lowStockData = Array.isArray(resLowStock) ? resLowStock : resLowStock?.data || [];
        setLowStockList(lowStockData);
      } catch (err) {
        console.error('Gagal memuat data stok kritis:', err);
        setLowStockList([]);
      }

      // 2) Data khusus Admin & Manager
      if (hasRole('Admin', 'Manager')) {
        const [resSummary, resTop, resLaba] = await Promise.all([
          getDashboardData(),
          getProdukTerlaris(),
          getLabaRugi(),
        ]);

        if (resSummary.success) setSummary(resSummary.data);
        if (resTop.success) setTopProducts(resTop.data);
        if (resLaba.success) setLabaRugi(resLaba.data);
      }
    } catch (error) {
      console.error('Gagal memuat data dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);

  const formatAngka = (value = 0) => new Intl.NumberFormat('id-ID').format(value || 0);

  const tanggalHariIni = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  // Sumber kebenaran jumlah stok kritis: dari lowStockList (bukan summary)
  const lowStockCount = lowStockList?.length || 0;
  const LowStockIcon = lowStockCount > 0 ? AlertTriangle : TrendingUp;

  const visibleQuickLinks = QUICK_LINKS.filter((item) => hasRole(...item.roles));

  return (
    <AppLayout>
      <div className="page-header dashboard-header">
        <div className="eyebrow">Ringkasan Toko</div>
        <h1>Selamat datang, {user?.nama || user?.name || 'User'}</h1>
        <p className="dashboard-date">{tanggalHariIni}</p>
      </div>

      {hasRole('Admin', 'Manager') && (
        <section className="dashboard-summary-grid">
          <div className="card dashboard-stat dashboard-stat-primary">
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Omzet Tercatat</p>
              <h2 className="dashboard-stat-value">{loading ? '...' : formatRupiah(summary?.omzet)}</h2>
              <span className="dashboard-stat-caption">Total penjualan yang tercatat</span>
            </div>
          </div>

          <div className="card dashboard-stat">
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Transaksi</p>
              <h2 className="dashboard-stat-value">{loading ? '...' : formatAngka(summary?.totalTransaksi)}</h2>
              <span className="dashboard-stat-caption">Transaksi berhasil dicatat</span>
            </div>
          </div>

          <div className="card dashboard-stat">
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Laba Kotor</p>
              <h2 className="dashboard-stat-value">{loading ? '...' : formatRupiah(labaRugi?.labaKotor)}</h2>
              <span className="dashboard-stat-caption">Perkiraan laba dari penjualan</span>
            </div>
          </div>

          <div className={`card dashboard-stat ${lowStockCount > 0 ? 'dashboard-stat-warning' : ''}`}>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Stok Menipis</p>
              <h2 className={`dashboard-stat-value ${lowStockCount > 0 ? 'dashboard-warning-value' : ''}`}>
                {loading ? '...' : lowStockCount > 0 ? `${lowStockCount} Produk` : 'Aman'}
              </h2>
              <span className="dashboard-stat-caption">Produk dengan stok ≤ 5</span>
            </div>
          </div>
        </section>
      )}

      <section className="dashboard-insight-grid">
        {hasRole('Admin', 'Manager') && (
          <div className="card dashboard-panel dashboard-chart-panel">
            <div className="dashboard-panel-header">
              <div>
                <div className="dashboard-panel-eyebrow">Penjualan</div>
                <h2 className="dashboard-panel-title">Produk Terlaris</h2>
              </div>
              <span className="dashboard-panel-note">Berdasarkan jumlah produk terjual</span>
            </div>

            {loading ? (
              <div className="empty-state">Memuat data produk terlaris...</div>
            ) : topProducts.length > 0 ? (
              <div className="dashboard-chart-wrap">
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={topProducts} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nama" axisLine={false} tickLine={false} tick={{ fill: '#6b6560', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#6b6560', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(31, 75, 63, 0.06)' }}
                      contentStyle={{ background: '#fffdf9', border: '1px solid #e4ddd0', borderRadius: '6px', boxShadow: '0 8px 20px rgba(28, 28, 26, 0.08)', fontSize: '0.82rem' }}
                      labelStyle={{ color: '#1c1c1a', fontWeight: 600 }}
                      formatter={(value) => [`${formatAngka(value)} qty`, 'Terjual']}
                    />
                    <Bar dataKey="totalQty" fill="#1f4b3f" radius={[4, 4, 0, 0]} name="Terjual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">Belum ada transaksi penjualan untuk ditampilkan.</div>
            )}
          </div>
        )}

        {/* Kartu Persediaan — tampil untuk SEMUA role, termasuk Kasir */}
        <div className={`card dashboard-stock-note ${lowStockCount > 0 ? 'has-warning' : 'is-safe'}`}>
          <div className="dashboard-stock-note-icon">
            <LowStockIcon size={22} strokeWidth={2.1} />
          </div>

          <div className="dashboard-panel-eyebrow">Persediaan</div>

          <h2 className="dashboard-stock-note-title">
            {loading ? 'Memeriksa stok...' : lowStockCount > 0 ? 'Stok Perlu Perhatian' : 'Stok Dalam Kondisi Aman'}
          </h2>

          <p className="dashboard-stock-note-text">
            {loading
              ? 'Data stok produk sedang dimuat.'
              : lowStockCount > 0
              ? `${lowStockCount} produk memiliki stok tersisa lima atau kurang. Periksa persediaan agar penjualan tidak terganggu.`
              : 'Tidak ada produk dengan stok kritis saat ini.'}
          </p>

          {hasRole('Admin', 'Manager') && (
            <Link to="/stok" className="dashboard-stock-link">
              Buka Manajemen Stok <span>→</span>
            </Link>
          )}
        </div>
      </section>

      <section className="dashboard-shortcut-section">
        <div className="dashboard-section-header">
          <div>
            <div className="dashboard-panel-eyebrow">Navigasi</div>
            <h2 className="dashboard-section-title">Akses Cepat</h2>
          </div>
          <p className="dashboard-section-desc">Pilih menu untuk melanjutkan pekerjaan.</p>
        </div>

        <div className="dashboard-quick-grid">
          {visibleQuickLinks.map((item, index) => (
            <Link key={item.to} to={item.to} className={`card dashboard-quick-link ${item.highlight ? 'dashboard-quick-link-highlight' : ''}`}>
              <span className="dashboard-quick-number">{String(index + 1).padStart(2, '0')}</span>
              <div className="dashboard-quick-content">
                <h3 className="dashboard-quick-title">{item.label}</h3>
                <p className="dashboard-quick-desc">{item.desc}</p>
              </div>
              <span className="dashboard-quick-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}