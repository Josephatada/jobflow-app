import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TopNav } from "@/components/ui/TopNav";

export const metadata: Metadata = {
  title: "JobFlow",
  description: "Personal job application tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${GeistSans.className} ${GeistMono.variable} h-full bg-[#111110]`}>
        <div className="flex flex-col h-full">
          <TopNav />
          <main className="flex-1 overflow-hidden flex flex-col pb-[64px] sm:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
