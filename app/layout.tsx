import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "HerPath AI — O‘z yo‘lingni top. Kelajagingni yarat.",
    template: "%s — HerPath AI",
  },
  description:
    "Qizlar uchun sun’iy intellekt asosidagi IT karyera platformasi: AI diagnostika testi, shaxsiy yo‘l xaritasi va AI mentor.",
  openGraph: {
    title: "HerPath AI",
    description: "O‘z yo‘lingni top. Kelajagingni yarat. Qizlar uchun AI karyera platformasi.",
    images: ["/hero-girl.jpg"],
    locale: "uz_UZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${jakarta.variable} ${instrument.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
