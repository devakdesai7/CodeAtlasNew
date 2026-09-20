import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aegis Command — Intelligent Emergency Response & Resource Coordination Platform",
  description:
    "Credible, calm, high-stakes emergency operations platform designed for dispatch supervisors. Prioritize incidents, deploy field resources, and track tactical GIS response from one unified command view.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">{children}</body>
    </html>
  );
}
