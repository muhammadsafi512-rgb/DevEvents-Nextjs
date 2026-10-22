import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthModalProvider from "@/components/AuthModalProvider";
import CreateEventModalProvider from "@/components/CreateEventModalProvider";
import { ThemeProvider } from "next-themes";
import ThemedLightRays from "@/components/ThemedLightRays";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import { baseUrl} from "@/lib/base-url";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: {default: `${site.name} | The hub for every dev event`, template: `%s | ${site.name}`},
  description: site.tagline,
  openGraph: { siteName: site.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={`${schibstedGrotesk.variable} ${martianMono.variable} flex min-h-screen flex-col antialiased`}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <AuthModalProvider>
      <CreateEventModalProvider>
    <Navbar/>

    <div className= "pointer-events-none fixed inset-0 z-[-1] " >
      <ThemedLightRays />
    </div>

    <main>
      {children}
    </main>
    <Footer />
      </CreateEventModalProvider>
    </AuthModalProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
