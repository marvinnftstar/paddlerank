import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaddleRank | Track. Compete. Rank Up.",
  description:
    "Join the PaddleRank waitlist for pickleball match tracking and rankings in the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
