import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";

export const metadata = {
  title: { default: "Raja Nxt — Women's Fashion | Daltonganj", template: "%s | Raja Nxt" },
  description: "Daltonganj's premier women's fashion store. Sarees, Kurtis, Lehengas, Western Wear & more. Shop now!",
  keywords: ["women fashion", "sarees", "kurtis", "lehengas", "daltonganj", "jharkhand", "ethnic wear"],
  openGraph: {
    title: "Raja Nxt — Women's Fashion",
    description: "Daltonganj's premier women's fashion store.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <StoreProvider>
          <div className="flex flex-col min-h-screen bg-cream">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toast />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
