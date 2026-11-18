import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Sugandhika | Pure Eco-Friendly Fragrance & Organic Mosquito Solutions",
    template: "%s | Sugandhika",
  },
  description:
    "Shop 100% natural, chemical-free herbal mosquito killer sticks, organic incense, and Himalayan room fresheners. Safe for kids & pets. Free shipping available across Nepal.",
  keywords: [
    "mosquito killer stick",
    "herbal mosquito repellent",
    "organic incense",
    "dhoop",
    "air freshener",
    "sugandhika",
    "nepal eco store",
  ],
  authors: [{ name: "Sugandhika" }],
  openGraph: {
    title: "Sugandhika | Pure Eco-Friendly Fragrance & Organic Mosquito Solutions",
    description: "Chemical-free organic mosquito sticks & Himalayan luxury air fresheners.",
    url: "https://sugandhika.com",
    siteName: "Sugandhika",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <CartDrawer />
              <Footer />
              <Toaster position="bottom-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
