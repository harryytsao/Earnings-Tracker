import type { Metadata } from "next";
import "./globals.css";
// import Providers from './providers'

export const metadata: Metadata = {
  title: "Quartely Earnings Tracker",
  description: "Track public company earnings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
