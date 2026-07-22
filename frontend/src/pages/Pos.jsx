import { useEffect, useMemo, useRef, useState } from 'react';
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

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-select" ref={wrapperRef}>
      <button
        type="button"
        className="custom-select-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="custom-select-label">
          {selected ? selected.label : placeholder}
        </span>
        <span className="custom-select-arrow">▾</span>
      </button>

      {open && (
        <div className="custom-select-menu">
          {placeholder && (
            <button
              type="button"
              className={`custom-select-option empty ${!value ? 'active' : ''}`}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {placeholder}
            </button>
          )}

          {options.length === 0 ? (
            <button type="button" className="custom-select-option" disabled>
              Tidak ada data
            </button>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`custom-select-option ${value === opt.value ? 'active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    if (!query.trim()) {
      setHasilCari([]);
      return;
    }

    setMencari(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/produk', {
          params: {
            search: query.trim(),
            limit: 8,
          },
        });

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

        const qtyBaru = Math.max(1, Math.min(qty || 1, it.stok));
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
    } else {
      setJumlahBayar('');
    }
  }, [metodePembayaran, total]);

  const kembalian =
    metodePembayaran === 'tunai' && jumlahBayar !== ''
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
        items: cart.map((it) => ({
          produk: it._id,
          qty: it.qty,
        })),
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
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(340px, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* KIRI */}
        <div>
          <div
            className="card"
            style={{
              padding: 16,
              marginBottom: 16,
              position: 'relative',
            }}
          >
            <input
              type="text"
              className="text-input"
              placeholder="Cari produk berdasarkan nama atau SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
              }}
            />

            {mencari && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-muted)',
                  marginTop: 8,
                }}
              >
                Mencari...
              </div>
            )}

            {hasilCari.length > 0 && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 16,
                  right: 16,
                  zIndex: 90,
                  marginTop: 6,
                  maxHeight: 300,
                  overflowY: 'auto',
                  padding: 8,
                }}
              >
                {hasilCari.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => p.stok >= 1 && tambahKeKeranjang(p)}
                    disabled={p.stok < 1}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: p.stok < 1 ? 'not-allowed' : 'pointer',
                      opacity: p.stok < 1 ? 0.5 : 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-ink)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fbf7ef';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div>
                      <strong>{p.nama}</strong>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--color-muted)',
                          marginTop: 2,
                        }}
                      >
                        SKU: {p.sku} · Stok: {p.stok}
                      </div>
                    </div>

                    <div style={{ fontWeight: 600 }}>
                      {formatRupiah(p.hargaJual)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 14 }}>
              Keranjang
            </h3>

            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 16px' }}>
                Belum ada item.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((it) => (
                    <tr key={it._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{it.nama}</div>
                        <div
                          className="mono"
                          style={{
                            fontSize: 12,
                            color: 'var(--color-muted)',
                            marginTop: 2,
                          }}
                        >
                          SKU: {it.sku}
                        </div>
                      </td>

                      <td>{formatRupiah(it.harga)}</td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => ubahQty(it._id, it.qty - 1)}
                            style={{
                              padding: '4px 8px',
                              minWidth: 28,
                            }}
                          >
                            -
                          </button>

                          <input
                            type="number"
                            value={it.qty}
                            min={1}
                            max={it.stok}
                            onChange={(e) => ubahQty(it._id, Number(e.target.value))}
                            style={{
                              width: 48,
                              textAlign: 'center',
                              padding: '6px 4px',
                              border: '1px solid var(--color-line)',
                              borderRadius: 'var(--radius-sm)',
                              background: '#fffdf9',
                              fontFamily: 'var(--font-body)',
                            }}
                          />

                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => ubahQty(it._id, it.qty + 1)}
                            style={{
                              padding: '4px 8px',
                              minWidth: 28,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        {formatRupiah(it.harga * it.qty)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn-link-danger"
                          onClick={() => hapusItem(it._id)}
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: 14 }}>
            Pembayaran
          </h3>

          <div className="form-field">
            <label>Diskon (Rp)</label>
            <input
              type="number"
              value={diskon}
              onChange={(e) => setDiskon(e.target.value)}
              min={0}
            />
          </div>

          <div className="form-field">
            <label>Pajak (%)</label>
            <input
              type="number"
              value={pajakPersen}
              onChange={(e) => setPajakPersen(e.target.value)}
              min={0}
            />
          </div>

          <div className="form-field">
            <label>Metode Pembayaran</label>
            <CustomSelect
              value={metodePembayaran}
              placeholder="Pilih metode pembayaran"
              options={METODE_OPTIONS}
              onChange={(value) => {
                if (!value) return;
                setMetodePembayaran(value);
              }}
            />
          </div>

          {metodePembayaran === 'tunai' && (
            <div className="form-field">
              <label>Jumlah Bayar</label>
              <input
                type="number"
                value={jumlahBayar}
                onChange={(e) => setJumlahBayar(e.target.value)}
                min={0}
                placeholder="Masukkan jumlah bayar"
              />
            </div>
          )}

          <hr
            style={{
              margin: '16px 0',
              border: 'none',
              borderTop: '1px solid var(--color-line)',
            }}
          />

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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <span>Kembalian</span>
              <span style={{ color: kembalian < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {formatRupiah(kembalian)}
              </span>
            </div>
          )}

          {error && (
            <div className="error-banner" style={{ marginTop: 14, marginBottom: 0 }}>
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={handleBayar}
            disabled={submitting || cart.length === 0}
            style={{
              marginTop: 16,
            }}
          >
            {submitting ? 'Memproses...' : 'Bayar'}
          </button>
        </div>
      </div>

      {struk && (
        <div className="modal-overlay" onClick={() => setStruk(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ textAlign: 'center' }}>Transaksi Berhasil</h2>

            <p
              className="mono"
              style={{
                textAlign: 'center',
                fontWeight: 700,
                marginTop: -8,
                marginBottom: 16,
              }}
            >
              {struk.nomorStruk}
            </p>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--color-line)',
                marginBottom: 14,
              }}
            />

            {struk.items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  marginBottom: 6,
                  gap: 12,
                }}
              >
                <span>
                  {it.nama} x{it.qty}
                </span>
                <span>{formatRupiah(it.subtotal)}</span>
              </div>
            ))}

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--color-line)',
                margin: '14px 0',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Total</span>
              <strong>{formatRupiah(struk.total)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Bayar</span>
              <span>{formatRupiah(struk.jumlahBayar)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Kembali</span>
              <span>{formatRupiah(struk.kembalian)}</span>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(`/transaksi/${struk._id}`)}
              >
                Lihat Detail
              </button>

              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto' }}
                onClick={() => setStruk(null)}
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