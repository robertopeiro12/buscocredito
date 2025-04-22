export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-background">
      <section className="bg-white">{children}</section>
    </main>
  );
}
