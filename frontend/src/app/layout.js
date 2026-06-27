import "./globals.css";

export const metadata = {
  title: "Heliport Design Simulator",
  description:
    "Simulator desain heliport untuk pembelajaran. Merujuk ICAO Annex 14 Vol II, ICAO Doc 9261, FAA AC 150/5390-2D.",
  icons: {
    icon: "/logo-poltekbang.png",
    apple: "/logo-poltekbang.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
