import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";
import { ChatProvider } from "@/components/chat/ChatContext";
import { getAllHubItems } from "@/lib/content";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Notion Diagrams Hub | Interactive Cloud Architecture & Engineering Docs",
  description:
    "Interactive, pan-and-zoom cloud architecture diagrams and technical documentation vaults, optimized for embedding into Notion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = getAllHubItems();

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-hub-bg text-hub-primary font-sans antialiased min-h-screen flex flex-col">
        <ChatProvider>
          <Suspense fallback={null}>
            <Navbar categories={categories} />
          </Suspense>
          <div className="flex-1 flex flex-col">{children}</div>
          <Suspense fallback={null}>
            <FloatingChatWidget />
          </Suspense>
        </ChatProvider>
      </body>
    </html>
  );
}
