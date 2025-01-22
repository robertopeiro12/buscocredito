import NavBar from "@/components/navbar";
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-[100vh]">
      <NavBar />
      <div className="text-center justify-center">{children}</div>
    </section>
  );
}
