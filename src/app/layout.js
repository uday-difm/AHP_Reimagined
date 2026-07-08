import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import BackdropBlobs from "@/components/BackdropBlobs";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "A Health Place — Building Wellness into Your Life",
  description: "A Health Place - Empathetic, medically accurate health guides covering physical wellness, mental health, insurance, and holistic lifestyle guidelines.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}
    >
      <body>
        <CustomCursor />
        <BackdropBlobs />
        {children}
      </body>
    </html>
  );
}
