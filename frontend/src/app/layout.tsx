/* eslint-disable @next/next/no-page-custom-font */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from 'react-toastify';

import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Redis Utilities",
  description: "Utilities to support Redis operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fontawesome-free-6.6.0-web/css/all.min.css" />
      </head>
      <body className={inter.className + " theme-redis"}>
        {children}

        <ToastContainer />
      </body>
    </html>
  );
}
