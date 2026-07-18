import SimpleCrudManager from "../components/SimpleCrudManager";
import AppLayout from "../components/AppLayout";

export default function SupplierPage() {
  return (
    <AppLayout>
      <SimpleCrudManager
        title="Supplier"
        subtitle="Kelola data pemasok produk toko"
        endpoint="/supplier"
        fields={[
          { name: "nama", label: "Nama Supplier", required: true },
          { name: "kontakPerson", label: "Kontak Person" },
          { name: "telepon", label: "Telepon" },
          { name: "email", label: "Email", type: "email" },
          { name: "alamat", label: "Alamat", type: "textarea" },
        ]}
      />
    </AppLayout>
  );
}
