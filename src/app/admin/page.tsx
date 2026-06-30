import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata = {
  title: "Admin | Thais Monteiro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminPanel />;
}
