import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBC Fictional Markets",
  description: "QueensHack '25 Bull or Bust",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800&family=Lexend:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Tangerine&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-Outfit">{children}</body>
    </html>
  );
}
