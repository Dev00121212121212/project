
import AdminLayout from '../admin/layout';

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
