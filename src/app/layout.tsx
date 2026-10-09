import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Aryx Movies and Series",
  description:
    "Browse trending movies and TV series. Powered by TMDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] antialiased">
        <Navbar />
        <main className="pb-12">{children}</main>
      </body>
    </html>
  );
}
