import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <main className="h-screen overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
