import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maxgen Systems",
  description:
    "Maxgen Systems is a systems-driven parent company focused on building and operating structured initiatives with enterprise reliability, disciplined execution, and long-term value.",
  metadataBase: new URL("https://maxgensys.com"),
  openGraph: {
    title: "Maxgen Systems",
    description:
      "Engineering systems that scale with certainty. A systems-driven parent company focused on enterprise reliability and disciplined execution.",
    url: "https://maxgensys.com",
    siteName: "Maxgen Systems",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={{ background: "var(--mx-bg)", color: "var(--mx-text)" }}
      >
        {children}
      </body>
    </html>
  );
}
