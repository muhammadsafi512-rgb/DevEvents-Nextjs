import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthModalProvider from "@/components/AuthModalProvider";
import CreateEventModalProvider from "@/components/CreateEventModalProvider";
import { ThemeProvider } from "next-themes";
import ThemedLightRays from "@/components/ThemedLightRays";
import Footer from "@/components/Footer";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for every Dev Event You Must not Miss",
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
