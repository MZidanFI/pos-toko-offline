import SimpleCrudManager from "../components/SimpleCrudManager";
import AppLayout from "../components/AppLayout";

export default function KategoriPage() {
  return (
    <AppLayout>
      <SimpleCrudManager
        title="Kategori Produk"
        subtitle="Kelola kategori untuk mengelompokkan produk"
        endpoint="/kategori"
        fields={[
          { name: "nama", label: "Nama Kategori", required: true },
          { name: "deskripsi", label: "Deskripsi", type: "textarea" },
        ]}
      />
    </AppLayout>
  );
}
