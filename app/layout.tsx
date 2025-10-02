export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ToastContainer from "@/components/Toasts/ToastContainer";
import ProgressBar from "@/components/ProgressBar";
import { PublicEnvScript } from "next-runtime-env";
import AttachmentsResetter from "@/components/AttachmentsResetter";

const roboto = localFont({
  src: "../public/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf",
  variable: "--font-roboto",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard | Task Management System",
  description:
    "Comprehensive task management, ticket support, and team collaboration platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        <ProgressBar />
        <ToastContainer />
        {children}
        <AttachmentsResetter />
      </body>
    </html>
  );
}
