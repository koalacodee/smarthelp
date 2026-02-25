export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cairo } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/Toasts/ToastContainer";
import ProgressBar from "@/components/ProgressBar";
import { PublicEnvScript } from "next-runtime-env";
import { getLanguage } from "@/locales/helpers";
import { isRTL } from "@/locales/isRTL";

const roboto = localFont({
  src: "../public/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf",
  variable: "--font-roboto",
  style: "normal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
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
  const lang = await getLanguage();
  return (
    <html lang={lang} dir={isRTL(lang) ? "rtl" : "ltr"}>
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${roboto.variable} ${cairo.variable} antialiased`}>
        <ProgressBar />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
