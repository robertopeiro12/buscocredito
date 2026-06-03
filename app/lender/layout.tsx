export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow bg-gray-50">
        {children}
      </div>
      {/* <footer className="bg-gray-200 text-gray-600 p-4">
        <div className="container mx-auto text-center">
          © 2023 Worker Dashboard. All rights reserved.
        </div>
      </footer> */}
    </div>
  );
}
