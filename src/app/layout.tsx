import "./globals.scss";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import ConvexClientProvider from "../contexts/ConvexClientProvider";
import Navbar from "@/components/navbar";
import { InitUser } from "@/helpers/InitUser";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "/retrospectool",
  description: "Create and manage retrospectives for your team.",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ConvexClientProvider>
          <Navbar />
          <InitUser />
          {children}
          <ToastContainer />
        </ConvexClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
