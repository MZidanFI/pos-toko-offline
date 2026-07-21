import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const initialState = {
  nama: "",
  sku: "",
  hargaBeli: "",
  hargaJual: "",
  stok: "",
  satuan: "pcs",
  kategori: "",
  supplier: "",
  deskripsi: "",
};

const IMG_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export default function ProdukForm({ produk, kategoriList, supplierList, onClose, onSaved }) {
  const [form, setForm] = useState(initialState);
  const [gambarFile, setGambarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(produk);

  useEffect(() => {
    if (produk) {
      setForm({
        nama: produk.nama || "",
        sku: produk.sku || "",
        hargaBeli: produk.hargaBeli ?? "",
        hargaJual: produk.hargaJual ?? "",
        stok: produk.stok ?? "",
        satuan: produk.satuan || "pcs",
        kategori: produk.kategori?._id || "",
        supplier: produk.supplier?._id || "",
        deskripsi: produk.deskripsi || "",
      });
      setPreview(produk.gambar ? `${IMG_BASE}/uploads/${produk.gambar}` : null);
    }
  }, [produk]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGambarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (gambarFile) formData.append("gambar", gambarFile);

      if (isEdit) {
        await api.put(`/produk/${produk._id}`, formData);
      } else {
        await api.post("/produk", formData);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ padding: 20 }}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              lineHeight: 1,
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}

          {/* Upload Gambar */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--color-line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'var(--color-bg)',
                flexShrink: 0,
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textAlign: 'center', padding: '0 8px' }}>
                  Belum ada gambar
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
                Gambar Produk
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFile}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 4 }}>
                Format JPG/PNG/WEBP, maks 2MB
              </p>
            </div>
          </div>

          {/* Form Grid 2 Kolom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Nama Produk</label>
              <input name="nama" value={form.nama} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>SKU / Barcode</label>
              <input name="sku" value={form.sku} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Satuan</label>
              <input
                name="satuan"
                value={form.satuan}
                onChange={handleChange}
                placeholder="pcs, box, kg, dll"
              />
            </div>

            <div className="form-field">
              <label>Harga Beli</label>
              <input
                type="number"
                min="0"
                name="hargaBeli"
                value={form.hargaBeli}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Harga Jual</label>
              <input
                type="number"
                min="0"
                name="hargaJual"
                value={form.hargaJual}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Stok</label>
              <input
                type="number"
                min="0"
                name="stok"
                value={form.stok}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Kategori</label>
              <select name="kategori" value={form.kategori} onChange={handleChange} required>
                <option value="">Pilih kategori</option>
                {kategoriList.map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Supplier</label>
              <select name="supplier" value={form.supplier} onChange={handleChange} required>
                <option value="">Pilih supplier</option>
                {supplierList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Deskripsi</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Tombol Aksi - sticky di bawah */}
          <div
            className="modal-actions"
            style={{
              position: 'sticky',
              bottom: 0,
              background: 'var(--color-surface)',
              paddingTop: 16,
              marginTop: 20,
              borderTop: '1px solid var(--color-line)',
            }}
          >
            <button type="button" className="btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}