import { Toaster } from "react-hot-toast";

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            marginTop: "80px",
          },
          success: {
            duration: 3000,
            style: {
              background: "#8B5CF6",
              color: "white",
              padding: "16px",
              borderRadius: "8px",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#EF4444",
              color: "white",
              padding: "16px",
              borderRadius: "8px",
            },
          },
        }}
      />
      <section>{children}</section>
    </main>
  );
}
