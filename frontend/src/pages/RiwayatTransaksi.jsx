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

      <form onSubmit={handleFilterSubmit} className="card filter-bar" style={{ alignItems: 'flex-end' }}>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label>Dari Tanggal</label>
          <input
            type="date"
            value={filter.dari}
            onChange={(e) => setFilter({ ...filter, dari: e.target.value })}
          />
        </div>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label>Sampai Tanggal</label>
          <input
            type="date"
            value={filter.sampai}
            onChange={(e) => setFilter({ ...filter, sampai: e.target.value })}
          />
        </div>
        <div className="form-field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label>Cari Nomor Struk</label>
          <input
            type="text"
            placeholder="TRX-20250115-0001"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: 'auto', height: 42 }}>
          Cari
        </button>
      </form>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : data.length === 0 ? (
          <div className="empty-state">Belum ada transaksi.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nomor Struk</th>
                  <th>Tanggal</th>
                  <th>Kasir</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((trx) => (
                  <tr key={trx._id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{trx.nomorStruk}</td>
                    <td>{formatTanggal(trx.createdAt)}</td>
                    <td>{trx.kasir?.name || '-'}</td>
                    <td>{formatRupiah(trx.total)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{trx.metodePembayaran}</td>
                    <td>
                      <span className={`badge ${trx.status === 'selesai' ? 'badge-selesai' : 'badge-batal'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link to={`/transaksi/${trx._id}`} className="link-action">
                          Detail
                        </Link>
                        {hasRole('Admin', 'Manager') && trx.status === 'selesai' && (
                          <button className="btn-link-danger" onClick={() => handleBatalkan(trx._id)}>
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span>
                Halaman {page} dari {totalPages}
              </span>
              <div className="pagination-controls">
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Sebelumnya
                </button>
                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}