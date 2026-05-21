import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Medi AI",
  description: "Advanced Healthcare AI Platform",
  icons: {
    icon: "/icon.svg",
  },
};

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
    className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col select-none">
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
