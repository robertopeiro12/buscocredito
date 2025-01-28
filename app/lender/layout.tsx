// import Navbar from '../components/Navbar';

export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
      {/* <footer className="bg-gray-200 text-gray-600 p-4">
        <div className="container mx-auto text-center">
          © 2023 Worker Dashboard. All rights reserved.
        </div>
      </footer> */}
    </div>
  );
}
