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

        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />

        <link rel="stylesheet" href="/fontawesome-free-6.6.0-web/css/all.min.css" />


      </head>
      <body className={inter.className}>
        {children}

        <ToastContainer />
      </body>
    </html>
  );
}
