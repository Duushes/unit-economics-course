import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import InstallPrompt from "@/components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Юнит-экономика — интерактивный курс (фокус Robotics)",
  description:
    "Интерактивный курс по юнит-экономике на двух сквозных робо-кейсах: роверы (CPO/OpD) и RaaS (модель Красинского). С живым калькулятором.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('uecon-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `,
          }}
        />
        <link rel="manifest" href="manifest.webmanifest" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="icon" href="icon.svg" type="image/svg+xml" />
        <link rel="icon" href="icon-192.png" type="image/png" sizes="192x192" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Юнит-эконом" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <RegisterSW />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
