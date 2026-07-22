import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { getLaporanPenjualan, getLabaRugi } from '../api/laporanApi';
import { Calendar, RefreshCw, Printer, Download } from 'lucide-react';

const formatRupiah = (value = 0) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatTanggal = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTanggalFilter = (value) => {
  if (!value) return '';

  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/*
  Menyesuaikan beberapa kemungkinan struktur API.
  UserManagement memakai field `name`, tetapi backend lain kadang memakai `nama`.
*/
const getNamaKasir = (transaksi) =>
  transaksi?.kasir?.name ||
  transaksi?.kasir?.nama ||
  transaksi?.namaKasir ||
  transaksi?.kasirName ||
  transaksi?.user?.name ||
  transaksi?.user?.nama ||
  '-';

const escapeCsv = (value) =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function LaporanPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [labaRugi, setLabaRugi] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async (
    dariTanggal = startDate,
    sampaiTanggal = endDate
  ) => {
    try {
      setLoading(true);
      setError('');

      const [resPenjualan, resLaba] = await Promise.all([
        getLaporanPenjualan(dariTanggal, sampaiTanggal),
        getLabaRugi(),
      ]);

      if (resPenjualan?.success) {
        setTransaksi(
          Array.isArray(resPenjualan.data) ? resPenjualan.data : []
        );
        setTotalOmzet(resPenjualan.totalOmzet || 0);
      } else {
        setTransaksi([]);
        setTotalOmzet(0);
      }

      if (resLaba?.success) {
        setLabaRugi(resLaba.data);
      } else {
        setLabaRugi(null);
      }
    } catch (err) {
      console.error('Gagal memuat laporan:', err);
      setError(
        err?.response?.data?.message ||
          'Gagal memuat data laporan penjualan.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (event) => {
    event.preventDefault();
    fetchLaporan(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchLaporan('', '');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (transaksi.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'Tanggal',
      'No. Struk',
      'Kasir',
      'Metode Pembayaran',
      'Total Transaksi',
    ];

    const rows = transaksi.map((item) => [
      formatTanggal(item.createdAt),
      item.nomorStruk || '-',
      getNamaKasir(item),
      item.metodePembayaran || '-',
      item.total || 0,
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `Laporan_Penjualan_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const periodeLaporan = (() => {
    if (startDate && endDate) {
      return `${formatTanggalFilter(startDate)} - ${formatTanggalFilter(
        endDate
      )}`;
    }

    if (startDate) {
      return `Mulai ${formatTanggalFilter(startDate)}`;
    }

    if (endDate) {
      return `Sampai ${formatTanggalFilter(endDate)}`;
    }

    return 'Semua Periode';
  })();

  const waktuCetak = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <AppLayout>
      {/* ============================================ */}
      {/* Bagian layar biasa — tidak ikut cetak PDF */}
      {/* ============================================ */}
      <div className="report-no-print">
        <div className="page-header report-page-header">
          <div>
            <div className="eyebrow">Laporan & Analisis</div>
            <h1>Laporan Penjualan</h1>
          </div>

          <div className="report-header-actions">
            <button
              type="button"
              className="btn-primary report-export-btn"
              onClick={handleExportCSV}
            >
              <Download size={16} />
              Ekspor CSV
            </button>

            <button
              type="button"
              className="btn-secondary report-print-btn"
              onClick={handlePrint}
            >
              <Printer size={16} />
              Cetak / PDF
            </button>
          </div>
        </div>

        <div className="card report-filter-card">
          <form onSubmit={handleFilter} className="report-filter-form">
            <div className="form-field">
              <label>Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="report-filter-actions">
              <button type="submit" className="btn-primary">
                <Calendar size={16} />
                Filter Laporan
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================ */}
      {/* Area yang akan ditampilkan ketika print/PDF */}
      {/* ============================================ */}
      <div className="report-print-area">
        {/* Header khusus untuk PDF, tidak muncul di layar biasa */}
        <div className="report-print-only">
          <div className="report-print-brand">
            <h1>Kasirin</h1>
            <span>POS</span>
          </div>

          <h2>Laporan Penjualan</h2>

          <p>
            <strong>Periode:</strong> {periodeLaporan}
          </p>

          <p>
            <strong>Dicetak:</strong> {waktuCetak}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Ringkasan */}
        <div className="report-summary-grid">
          <div className="card report-summary-card report-summary-omzet">
            <p className="report-summary-label">Total Omzet Penjualan</p>
            <h2 className="report-summary-value">
              {loading ? '...' : formatRupiah(totalOmzet)}
            </h2>
          </div>

          <div className="card report-summary-card">
            <p className="report-summary-label">Estimasi Modal (HPP)</p>
            <h2 className="report-summary-value">
              {loading
                ? '...'
                : formatRupiah(labaRugi?.totalModalHPP)}
            </h2>
          </div>

          <div className="card report-summary-card report-summary-laba">
            <p className="report-summary-label">Estimasi Laba Kotor</p>
            <h2 className="report-summary-value">
              {loading ? '...' : formatRupiah(labaRugi?.labaKotor)}
            </h2>
          </div>
        </div>

        {/* Tabel laporan */}
        <div className="card report-table-card">
          <div className="report-table-header">
            <div>
              <div className="report-table-eyebrow">Rincian</div>
              <h2 className="report-table-title">
                Rincian Transaksi Penjualan
              </h2>
            </div>

            <span className="report-table-count">
              Total: {transaksi.length} Transaksi
            </span>
          </div>

          {loading ? (
            <div className="empty-state">Memuat laporan penjualan...</div>
          ) : transaksi.length === 0 ? (
            <div className="empty-state">
              Tidak ada data transaksi pada periode ini.
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table report-data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>No. Struk</th>
                    <th>Kasir</th>
                    <th>Metode</th>
                    <th style={{ textAlign: 'right' }}>
                      Total Transaksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transaksi.map((item) => (
                    <tr key={item._id}>
                      <td>{formatTanggal(item.createdAt)}</td>

                      <td
                        className="mono"
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.nomorStruk || '-'}
                      </td>

                      <td>{getNamaKasir(item)}</td>

                      <td style={{ textTransform: 'uppercase' }}>
                        {item.metodePembayaran || '-'}
                      </td>

                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                        }}
                      >
                        {formatRupiah(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}