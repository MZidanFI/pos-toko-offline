import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
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

export default function DetailTransaksi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trx, setTrx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/transaksi/${id}`)
      .then((res) => setTrx(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <p style={{ color: 'var(--color-muted)' }}>Memuat...</p>
      </AppLayout>
    );
  }

  if (!trx) {
    return (
      <AppLayout>
        <p style={{ color: 'var(--color-muted)' }}>Transaksi tidak ditemukan.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header no-print">
        <div className="eyebrow">Detail Transaksi</div>
        <h1>{trx.nomorStruk}</h1>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'max(100%, calc(100vw - 320px))',
          maxWidth: 'none',
        }}
      >
        <div
          className="card print-area"
          style={{
            padding: 24,
            maxWidth: 480,
            width: '100%',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>KASIRIN</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>
              {formatTanggal(trx.createdAt)}
            </p>
            <p style={{ margin: 0, fontSize: 13 }}>Kasir: {trx.kasir?.name || '-'}</p>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />

          {trx.items.map((it, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{it.nama}</span>
                <span>{formatRupiah(it.subtotal)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                {it.qty} x {formatRupiah(it.harga)}
              </div>
            </div>
          ))}

          <hr style={{ borderColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>{formatRupiah(trx.subtotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Diskon</span>
            <span>- {formatRupiah(trx.diskon)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pajak ({trx.pajakPersen}%)</span>
            <span>{formatRupiah(trx.pajak)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 17,
              marginTop: 6,
            }}
          >
            <span>Total</span>
            <span>{formatRupiah(trx.total)}</span>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Metode</span>
            <span style={{ textTransform: 'capitalize' }}>{trx.metodePembayaran}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bayar</span>
            <span>{formatRupiah(trx.jumlahBayar)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Kembali</span>
            <span>{formatRupiah(trx.kembalian)}</span>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 12,
              color: 'var(--color-muted)',
            }}
          >
            Status: {trx.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
          </div>
        </div>

        <div
          className="no-print"
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 16,
            maxWidth: 480,
            width: '100%',
          }}
        >
          <button
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={() => navigate('/transaksi')}
          >
            Kembali
          </button>

          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={() => window.print()}
          >
            Cetak Struk
          </button>
        </div>
      </div>
    </AppLayout>
  );
}