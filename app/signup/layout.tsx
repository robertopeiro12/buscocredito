export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      {children}
    </section>
  );
}
