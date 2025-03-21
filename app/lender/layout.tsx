// import Navbar from '../components/Navbar';
import { Toaster } from "react-hot-toast";

export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10B981",
            },
          },
          error: {
            style: {
              background: "#EF4444",
            },
          },
        }}
      />
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
