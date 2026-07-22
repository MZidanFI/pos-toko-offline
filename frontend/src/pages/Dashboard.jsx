import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getDashboardData, getProdukTerlaris, getLabaRugi } from '../api/laporanApi';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  {
    to: '/stok',
    label: 'Manajemen Stok',
    desc: 'Kelola stok masuk, keluar, dan penyesuaian',
    roles: ['Admin', 'Manager'],
  },
  {
    to: '/customers',
    label: 'Data Customer',
    desc: 'Kelola data pelanggan dan poin loyalitas',
    roles: ['Admin', 'Manager', 'Kasir'],
  },
];

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [labaRugi, setLabaRugi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSummary, resTop, resLaba] = await Promise.all([
        getDashboardData(),
        getProdukTerlaris(),
        getLabaRugi(),
      ]);

      if (resSummary.success) setSummary(resSummary.data);
      if (resTop.success) setTopProducts(resTop.data);
      if (resLaba.success) setLabaRugi(resLaba.data);
    } catch (error) {
      console.error('Gagal memuat data dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Ringkasan</div>
        <h1>Selamat datang, {user?.nama || user?.name || 'User'}</h1>
      </div>

      {/* Ringkasan Cards (Modul Anggota 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Omzet</p>
            <h3 className="text-lg font-bold text-gray-800">{loading ? '...' : formatRupiah(summary?.omzet)}</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Transaksi</p>
            <h3 className="text-lg font-bold text-gray-800">{loading ? '...' : summary?.totalTransaksi || 0}</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Laba Kotor</p>
            <h3 className="text-lg font-bold text-gray-800">{loading ? '...' : formatRupiah(labaRugi?.labaKotor)}</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Stok Menipis (≤5)</p>
            <h3 className="text-lg font-bold text-amber-600">{loading ? '...' : summary?.lowStockProduk || 0} Produk</h3>
          </div>
        </div>
      </div>

      {/* Grafik Top Produk (Modul Anggota 5) */}
      <div className="p-5 bg-white rounded-xl shadow-sm border mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Top 10 Produk Terlaris</h2>
        {topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nama" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalQty" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Terjual (Qty)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">Belum ada data transaksi penjualan.</p>
        )}
      </div>

      {/* Quick Links Navigasi Bawaan */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Akses Cepat Menu</h2>
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