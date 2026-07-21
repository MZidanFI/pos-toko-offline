import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import api from '../api/axiosConfig';

const formatRupiah = (angka = 0) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka || 0);

const METODE_OPTIONS = [
  { value: 'tunai', label: 'Tunai' },
  { value: 'debit', label: 'Kartu Debit' },
  { value: 'kredit', label: 'Kartu Kredit' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer' },
];

export default function Pos() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [hasilCari, setHasilCari] = useState([]);
  const [mencari, setMencari] = useState(false);

  const [cart, setCart] = useState([]);
  const [diskon, setDiskon] = useState(0);
  const [pajakPersen, setPajakPersen] = useState(11);
  const [metodePembayaran, setMetodePembayaran] = useState('tunai');
  const [jumlahBayar, setJumlahBayar] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [struk, setStruk] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); // Hilang otomatis setelah 3.5 detik
  };

  useEffect(() => {
    if (!query.trim()) {
      setHasilCari([]);
      return;
    }
    setMencari(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/produk', { params: { search: query.trim(), limit: 8 } });
        setHasilCari(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setMencari(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const tambahKeKeranjang = (produk) => {
    setCart((prev) => {
      const existing = prev.find((it) => it._id === produk._id);
      if (existing) {
        if (existing.qty >= produk.stok) return prev;
        return prev.map((it) =>
          it._id === produk._id ? { ...it, qty: it.qty + 1 } : it
        );
      }
      if (produk.stok < 1) return prev;
      return [
        ...prev,
        {
          _id: produk._id,
          nama: produk.nama,
          sku: produk.sku,
          harga: produk.hargaJual,
          stok: produk.stok,
          qty: 1,
        },
      ];
    });
    setQuery('');
    setHasilCari([]);
  };

  const ubahQty = (id, qty) => {
    setCart((prev) =>
      prev.map((it) => {
        if (it._id !== id) return it;
        const qtyBaru = Math.max(1, Math.min(qty, it.stok));
        return { ...it, qty: qtyBaru };
      })
    );
  };

  const hapusItem = (id) => {
    setCart((prev) => prev.filter((it) => it._id !== id));
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, it) => sum + it.harga * it.qty, 0),
    [cart]
  );

  const dpp = Math.max(subtotal - Number(diskon || 0), 0);
  const pajak = Math.round((dpp * Number(pajakPersen || 0)) / 100);
  const total = dpp + pajak;

  useEffect(() => {
    if (metodePembayaran !== 'tunai') {
      setJumlahBayar(total);
    }
  }, [metodePembayaran, total]);

  const kembalian =
    metodePembayaran === 'tunai' && jumlahBayar
      ? Number(jumlahBayar) - total
      : 0;

  const resetForm = () => {
    setCart([]);
    setDiskon(0);
    setPajakPersen(11);
    setMetodePembayaran('tunai');
    setJumlahBayar('');
    setError('');
  };

  const handleBayar = async () => {
    setError('');
    if (cart.length === 0) {
      setError('Keranjang masih kosong');
      return;
    }
    if (metodePembayaran === 'tunai' && Number(jumlahBayar) < total) {
      setError('Jumlah bayar kurang dari total transaksi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((it) => ({ produk: it._id, qty: it.qty })),
        diskon: Number(diskon || 0),
        pajakPersen: Number(pajakPersen || 0),
        metodePembayaran,
        jumlahBayar: Number(jumlahBayar || total),
      };
      const res = await api.post('/transaksi', payload);
      setStruk(res.data);
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memproses transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Kasir</div>
        <h1>Transaksi Baru</h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* KIRI */}
        <div>
          <div className="card" style={{ padding: 16, marginBottom: 16, position: 'relative' }}>
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                fontSize: 15,
              }}
            />
            {mencari && (
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 6 }}>
                Mencari...
              </div>
            )}
            {hasilCari.length > 0 && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  marginTop: 4,
                  maxHeight: 300,
                  overflowY: 'auto',
                  padding: 8,
                }}
              >
                {hasilCari.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => p.stok >= 1 && tambahKeKeranjang(p)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      cursor: p.stok < 1 ? 'not-allowed' : 'pointer',
                      opacity: p.stok < 1 ? 0.5 : 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong>{p.nama}</strong>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                        SKU: {p.sku} · Stok: {p.stok}
                      </div>
                    </div>
                    <div>{formatRupiah(p.hargaJual)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Keranjang</h3>
            {cart.length === 0 ? (
              <p style={{ color: 'var(--color-muted)' }}>Belum ada item.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: 8 }}>Produk</th>
                    <th style={{ padding: 8 }}>Harga</th>
                    <th style={{ padding: 8, width: 110 }}>Qty</th>
                    <th style={{ padding: 8 }}>Subtotal</th>
                    <th style={{ padding: 8 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((it) => (
                    <tr key={it._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 8 }}>
                        <div>{it.nama}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                          SKU: {it.sku}
                        </div>
                      </td>
                      <td style={{ padding: 8 }}>{formatRupiah(it.harga)}</td>
                      <td style={{ padding: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => ubahQty(it._id, it.qty - 1)}>-</button>
                          <input
                            type="number"
                            value={it.qty}
                            min={1}
                            max={it.stok}
                            onChange={(e) => ubahQty(it._id, Number(e.target.value))}
                            style={{ width: 45, textAlign: 'center' }}
                          />
                          <button onClick={() => ubahQty(it._id, it.qty + 1)}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: 8 }}>{formatRupiah(it.harga * it.qty)}</td>
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => hapusItem(it._id)}
                          style={{ color: 'crimson', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* KANAN */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Pembayaran</h3>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Diskon (Rp)</label>
            <input
              type="number"
              value={diskon}
              onChange={(e) => setDiskon(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid var(--color-border)', borderRadius: 6 }}
              min={0}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Pajak (%)</label>
            <input
              type="number"
              value={pajakPersen}
              onChange={(e) => setPajakPersen(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid var(--color-border)', borderRadius: 6 }}
              min={0}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Metode Pembayaran</label>
            <select
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid var(--color-border)', borderRadius: 6 }}
            >
              {METODE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {metodePembayaran === 'tunai' && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Jumlah Bayar</label>
              <input
                type="number"
                value={jumlahBayar}
                onChange={(e) => setJumlahBayar(e.target.value)}
                style={{ width: '100%', padding: 8, border: '1px solid var(--color-border)', borderRadius: 6 }}
                min={0}
              />
            </div>
          )}

          <hr style={{ margin: '16px 0', borderColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Diskon</span>
            <span>- {formatRupiah(diskon)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Pajak ({pajakPersen}%)</span>
            <span>{formatRupiah(pajak)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 18,
              marginTop: 8,
            }}
          >
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>

          {metodePembayaran === 'tunai' && jumlahBayar !== '' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span>Kembalian</span>
              <span style={{ color: kembalian < 0 ? 'crimson' : 'green' }}>
                {formatRupiah(kembalian)}
              </span>
            </div>
          )}

          {error && <div style={{ color: 'crimson', marginTop: 10, fontSize: 14 }}>{error}</div>}

          <button
            onClick={handleBayar}
            disabled={submitting || cart.length === 0}
            style={{
              width: '100%',
              padding: 12,
              marginTop: 16,
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Memproses...' : 'Bayar'}
          </button>
        </div>
      </div>

      {struk && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div className="card" style={{ padding: 24, width: 380, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>Transaksi Berhasil</h3>
            <p style={{ textAlign: 'center', fontWeight: 700 }}>{struk.nomorStruk}</p>
            <hr style={{ borderColor: 'var(--color-border)' }} />
            {struk.items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span>{it.nama} x{it.qty}</span>
                <span>{formatRupiah(it.subtotal)}</span>
              </div>
            ))}
            <hr style={{ borderColor: 'var(--color-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total</span>
              <strong>{formatRupiah(struk.total)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bayar</span>
              <span>{formatRupiah(struk.jumlahBayar)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Kembali</span>
              <span>{formatRupiah(struk.kembalian)}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => navigate(`/transaksi/${struk._id}`)} style={{ flex: 1, padding: 10 }}>
                Lihat Detail
              </button>
              <button
                onClick={() => setStruk(null)}
                style={{
                  flex: 1,
                  padding: 10,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                }}
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}