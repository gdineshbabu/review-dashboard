import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Review Dash",
  description: "Internal dashboard for recent AliveCor product reviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
