import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { getLaporanPenjualan, getLabaRugi } from '../api/laporanApi';
import { Calendar, RefreshCw, Printer, Download } from 'lucide-react';

export default function LaporanPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [labaRugi, setLabaRugi] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const [resPenjualan, resLaba] = await Promise.all([
        getLaporanPenjualan(startDate, endDate),
        getLabaRugi(),
      ]);

      if (resPenjualan.success) {
        setTransaksi(resPenjualan.data);
        setTotalOmzet(resPenjualan.totalOmzet);
      }
      if (resLaba.success) {
        setLabaRugi(resLaba.data);
      }
    } catch (error) {
      console.error('Gagal memuat laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLaporan();
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fungsi Cetak PDF / Print
  const handlePrint = () => {
    window.print();
  };

  // Fungsi Ekspor ke File CSV (Excel)
  const handleExportCSV = () => {
    if (transaksi.length === 0) return alert('Tidak ada data untuk diekspor!');

    const headers = ['Tanggal', 'No Struk', 'Kasir', 'Metode Pembayaran', 'Total'];
    const rows = transaksi.map((t) => [
      formatDate(t.createdAt),
      t.nomorStruk,
      t.kasir?.nama || '-',
      t.metodePembayaran,
      t.total,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="eyebrow">Laporan & Analisis</div>
          <h1>Laporan Penjualan</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition text-sm flex items-center gap-1.5"
          >
            <Download size={16} /> Ekspor CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition text-sm flex items-center gap-1.5 bg-white"
          >
            <Printer size={16} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* Filter Tanggal */}
      <div className="p-4 bg-white rounded-xl shadow-sm border mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition text-sm flex items-center gap-2"
          >
            <Calendar size={16} /> Filter Laporan
          </button>
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              fetchLaporan();
            }}
            className="px-3 py-2 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} /> Reset
          </button>
        </form>
      </div>

      {/* Kartu Summary Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-medium">Total Omzet Penjualan</p>
          <h3 className="text-xl font-bold text-emerald-700">{formatRupiah(totalOmzet)}</h3>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-medium">Estimasi Modal (HPP)</p>
          <h3 className="text-xl font-bold text-gray-700">{formatRupiah(labaRugi?.totalModalHPP)}</h3>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-medium">Estimasi Laba Kotor</p>
          <h3 className="text-xl font-bold text-blue-600">{formatRupiah(labaRugi?.labaKotor)}</h3>
        </div>
      </div>

      {/* Tabel Data Laporan */}
      <div className="p-5 bg-white rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-800">Rincian Transaksi Penjualan</h2>
          <span className="text-xs font-medium text-gray-500">Total: {transaksi.length} Transaksi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">No. Struk</th>
                <th className="p-3">Kasir</th>
                <th className="p-3">Metode</th>
                <th className="p-3 text-right">Total Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6">Memuat laporan...</td>
                </tr>
              ) : transaksi.length > 0 ? (
                transaksi.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{formatDate(t.createdAt)}</td>
                    <td className="p-3 font-mono text-xs font-semibold">{t.nomorStruk}</td>
                    <td className="p-3">{t.kasir?.nama || '-'}</td>
                    <td className="p-3 uppercase text-xs font-medium">{t.metodePembayaran}</td>
                    <td className="p-3 text-right font-semibold text-gray-800">{formatRupiah(t.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-400">
                    Tidak ada data transaksi pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}