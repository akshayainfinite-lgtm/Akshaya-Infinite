import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akshaya Infinite | Bespoke Tailoring",
  description: "Custom tailoring for ladies, boys and girls. Your style. Your fit. Your creation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}