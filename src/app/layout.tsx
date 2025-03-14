import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { KeyboardShortcutsProvider } from "./components/KeyboardShortcutsProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get the base path from the environment variable
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "BranchPad | Computational Notebook with Branching",
  description:
    "A powerful computational notebook with branching capabilities for data science and machine learning workflows",
  icons: {
    icon: `${basePath}/favicon.ico`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        {/* Add base tag to ensure all relative URLs are resolved correctly */}
        <base href={basePath || "/"} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
      </body>
    </html>
  );
}
