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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Produk" : "Tambah Produk"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-4 items-start">
            <div className="w-28 h-28 rounded-xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 text-center px-2">Belum ada gambar</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Gambar Produk</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFile}
                className="text-sm w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Format JPG/PNG/WEBP, maks 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Produk</label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU / Barcode</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Satuan</label>
              <input
                name="satuan"
                value={form.satuan}
                onChange={handleChange}
                placeholder="pcs, box, kg, dll"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Harga Beli</label>
              <input
                type="number"
                min="0"
                name="hargaBeli"
                value={form.hargaBeli}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Harga Jual</label>
              <input
                type="number"
                min="0"
                name="hargaJual"
                value={form.hargaJual}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stok</label>
              <input
                type="number"
                min="0"
                name="stok"
                value={form.stok}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Pilih kategori</option>
                {kategoriList.map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Pilih supplier</option>
                {supplierList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
