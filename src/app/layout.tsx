import type { Metadata } from "next";
import { Inter, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "JEE Prep",
  description: "JEE Main & Advanced preparation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${kalam.variable} h-full`}>
      <body className="min-h-full">
        <header
          className="px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: "2px solid var(--grid-line)" }}
        >
          <a href="/" className="font-hand text-xl font-bold" style={{ color: "var(--ink)" }}>
            JEE Prep
          </a>
          <nav className="flex gap-4 text-sm">
            <a href="/subjects" className="hover:underline" style={{ color: "var(--ink)" }}>Subjects</a>
            <a href="/settings" className="hover:underline" style={{ color: "var(--ink)" }}>Settings</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
