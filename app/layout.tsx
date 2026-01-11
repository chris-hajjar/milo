import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milo - Stock Assistant",
  description: "AI-powered stock market assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
