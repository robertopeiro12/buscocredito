export default function SignUpAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-[#f8fdf8]">
      <section className="flex justify-center items-center w-full min-h-screen px-4 py-8">
        {children}
      </section>
    </main>
  );
}
