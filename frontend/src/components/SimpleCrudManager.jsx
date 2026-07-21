import { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function SimpleCrudManager({ title, subtitle, endpoint, fields }) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("Admin", "Manager");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const emptyForm = () => fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      <div className="page-header">
        <div className="eyebrow">Master Data</div>
        <h1>{title}</h1>
        <p className="page-header-subtitle">{subtitle}</p>
      </div>

      <div className={`crud-grid ${!isAdmin ? 'crud-grid-single' : ''}`}>
        {isAdmin && (
          <div className="crud-form-card">
            <h2>{editingId ? "Edit Data" : "Tambah Data"}</h2>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              {fields.map((f) => (
                <div className="form-field" key={f.name}>
                  <label>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      name={f.name}
                      value={form[f.name] || ""}
                      onChange={handleChange}
                      rows={3}
                    />
                  ) : (
                    <input
                      name={f.name}
                      type={f.type || "text"}
                      value={form[f.name] || ""}
                      onChange={handleChange}
                      required={f.required}
                    />
                  )}
                </div>
              ))}

              <div className="form-actions-inline">
                <button type="submit" className="btn-primary">
                  {editingId ? "Update" : "Simpan"}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={handleCancel}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="empty-state">Memuat data...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">Belum ada data</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {fields.map((f) => (
                    <th key={f.name}>{f.label}</th>
                  ))}
                  {isAdmin && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {fields.map((f) => (
                      <td
                        key={f.name}
                        style={
                          f.type === "textarea"
                            ? { maxWidth: 260, whiteSpace: 'normal' }
                            : undefined
                        }
                      >
                        {item[f.name] || "-"}
                      </td>
                    ))}
                    {isAdmin && (
                      <td>
                        <div className="row-actions">
                          <button className="btn-secondary" onClick={() => handleEdit(item)}>
                            Edit
                          </button>
                          <button className="btn-danger" onClick={() => handleDelete(item)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}