import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const formatRupiah = (angka = 0) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka || 0);

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-';
  return new Date(tanggal).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function RiwayatTransaksi() {
  const { hasRole } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState({ dari: '', sampai: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const muatData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/transaksi', { params: { ...filter, page, limit: 10 } });
      setData(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, [page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    muatData();
  };

  const handleBatalkan = async (id) => {
    if (!window.confirm('Batalkan transaksi ini? Stok produk akan dikembalikan.')) return;
    try {
      await api.patch(`/transaksi/${id}/batal`);
      muatData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal membatalkan transaksi');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Transaksi</div>
        <h1>Riwayat Transaksi</h1>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="card"
        style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--color-muted)' }}>
            Dari Tanggal
          </label>
          <input
            type="date"
            value={filter.dari}
            onChange={(e) => setFilter({ ...filter, dari: e.target.value })}
            style={{ padding: 8, border: '1px solid var(--color-border)', borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--color-muted)' }}>
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={filter.sampai}
            onChange={(e) => setFilter({ ...filter, sampai: e.target.value })}
            style={{ padding: 8, border: '1px solid var(--color-border)', borderRadius: 6 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--color-muted)' }}>
            Cari Nomor Struk
          </label>
          <input
            type="text"
            placeholder="TRX-20250115-0001"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            style={{ padding: 8, width: '100%', border: '1px solid var(--color-border)', borderRadius: 6 }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 20px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            height: 38,
          }}
        >
          Cari
        </button>
      </form>

      <div className="card" style={{ padding: 16 }}>
        {loading ? (
          <p style={{ color: 'var(--color-muted)' }}>Memuat...</p>
        ) : error ? (
          <p style={{ color: 'crimson' }}>{error}</p>
        ) : data.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>Belum ada transaksi.</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: 10 }}>Nomor Struk</th>
                  <th style={{ padding: 10 }}>Tanggal</th>
                  <th style={{ padding: 10 }}>Kasir</th>
                  <th style={{ padding: 10 }}>Total</th>
                  <th style={{ padding: 10 }}>Metode</th>
                  <th style={{ padding: 10 }}>Status</th>
                  <th style={{ padding: 10 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((trx) => (
                  <tr key={trx._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{trx.nomorStruk}</td>
                    <td style={{ padding: 10 }}>{formatTanggal(trx.createdAt)}</td>
                    <td style={{ padding: 10 }}>{trx.kasir?.name || '-'}</td>
                    <td style={{ padding: 10 }}>{formatRupiah(trx.total)}</td>
                    <td style={{ padding: 10, textTransform: 'capitalize' }}>{trx.metodePembayaran}</td>
                    <td style={{ padding: 10 }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          background: trx.status === 'selesai' ? '#e6f7ec' : '#fdeaea',
                          color: trx.status === 'selesai' ? '#1b8a4c' : '#c0392b',
                        }}
                      >
                        {trx.status}
                      </span>
                    </td>
                    <td style={{ padding: 10, display: 'flex', gap: 8 }}>
                      <Link to={`/transaksi/${trx._id}`} style={{ color: 'var(--color-primary)' }}>
                        Detail
                      </Link>
                      {hasRole('Admin', 'Manager') && trx.status === 'selesai' && (
                        <button
                          onClick={() => handleBatalkan(trx._id)}
                          style={{ color: 'crimson', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </button>
              <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                Halaman {page} dari {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Berikutnya
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}