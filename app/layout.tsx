import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trustbin",
  description: "Gamified sustainability app for the ASU community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
