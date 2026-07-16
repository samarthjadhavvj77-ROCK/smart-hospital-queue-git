import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JEEVIKA AI - Healthcare Dashboard",
  description: "Multilingual Voice-First Healthcare Triage and Clinic Booking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700&family=Source+Serif+4:ital,wght@0,400;1,400&family=Poppins:wght@500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
