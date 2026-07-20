import { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

// Komponen generik untuk mengelola data master sederhana (Kategori / Supplier)
// fields: [{ name, label, type }]
export default function SimpleCrudManager({ title, subtitle, endpoint, fields }) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("Admin", "Manager");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const emptyForm = () =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    setForm(emptyForm());
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchItems]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, form);
      } else {
        await api.post(endpoint, form);
      }
      setForm(emptyForm());
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm(fields.reduce((acc, f) => ({ ...acc, [f.name]: item[f.name] || "" }), {}));
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus "${item.nama}"?`)) return;
    await api.delete(`${endpoint}/${item._id}`);
    fetchItems();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 h-fit">
            <h2 className="text-sm font-semibold mb-3">
              {editingId ? "Edit Data" : "Tambah Data"}
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium mb-1">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      name={f.name}
                      value={form[f.name] || ""}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <input
                      name={f.name}
                      type={f.type || "text"}
                      value={form[f.name] || ""}
                      onChange={handleChange}
                      required={f.required}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg"
                >
                  {editingId ? "Update" : "Simpan"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${isAdmin ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {fields.map((f) => (
                  <th key={f.name} className="text-left px-4 py-3">
                    {f.label}
                  </th>
                ))}
                {isAdmin && <th className="text-center px-4 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={fields.length + 1} className="text-center py-8 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="text-center py-8 text-gray-400">
                    Belum ada data
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    {fields.map((f) => (
                      <td key={f.name} className="px-4 py-2">
                        {item[f.name] || "-"}
                      </td>
                    ))}
                    {isAdmin && (
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-600 hover:underline text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:underline text-xs font-medium"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
