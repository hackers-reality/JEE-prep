import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-hand" });

export const metadata: Metadata = {
  title: "JEE Prep",
  description: "JEE Main & Advanced preparation platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${kalam.variable} h-full`}>
      <body className="min-h-full">
        <header className="px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm" style={{ borderBottom: "2px solid var(--grid-line)", background: "rgba(250,247,240,.9)" }}>
          <Link href="/dashboard" className="font-hand text-xl font-bold" style={{ color: "var(--ink)" }}>JEE Prep</Link>
          <nav className="flex gap-3 sm:gap-5 text-xs sm:text-sm overflow-x-auto">
            <Link href="/dashboard" className="hover:underline" style={{ color: "var(--ink)" }}>Dashboard</Link>
            <Link href="/problems" className="hover:underline font-semibold" style={{ color: "var(--ink)" }}>Solve</Link>
            <Link href="/subjects" className="hover:underline" style={{ color: "var(--ink)" }}>Subjects</Link>
            <Link href="/mock-test/diagnostic" className="hover:underline" style={{ color: "var(--ink)" }}>Diagnostic</Link>
            <Link href="/mock-test/regular" className="hover:underline" style={{ color: "var(--ink)" }}>Tests</Link>
            <Link href="/chat" className="hover:underline" style={{ color: "var(--ink)" }}>AI</Link>
            <Link href="/settings" className="hover:underline" style={{ color: "var(--ink)" }}>Settings</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
