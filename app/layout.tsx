import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import { ConditionalNavBar } from "@/components/common/layout/ConditionalNavBar";
import { NotificationProvider } from "@/components/common/ui/NotificationProvider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  // Añadido metadatos adicionales para SEO
  themeColor: "#2EA043", // Color principal de tu app
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
      <head />
      <body
        suppressHydrationWarning={true}
        className={clsx(
          "min-h-screen bg-background antialiased",
          "flex flex-col relative",
          "selection:bg-green-200 selection:text-green-900",
          fontSans.variable
        )}
      >
        <NotificationProvider>
          <Providers themeProps={{ attribute: "class", defaultTheme: "white" }}>
            {/* Skip to main content - Accesibilidad */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:p-4 focus:bg-white focus:text-green-600"
            >
              Saltar al contenido principal
            </a>

            {/* Navigation - Condicional */}
            <ConditionalNavBar />

            {/* Main content */}
            <main id="main-content" className="flex-grow relative z-0">
              {children}
            </main>

            {/* Overlay para efectos de loading o modales si los necesitas */}
            <div id="overlay-root" />
          </Providers>
        </NotificationProvider>

        {/* Scripts adicionales si los necesitas */}
        <div id="scripts-root" />
      </body>
    </html>
  );
}
