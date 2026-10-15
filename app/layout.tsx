import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthModalProvider from "@/components/AuthModalProvider";
import CreateEventModalProvider from "@/components/CreateEventModalProvider";
import { ThemeProvider } from "next-themes";
import ThemedLightRays from "@/components/ThemedLightRays";

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
    <body className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <AuthModalProvider>
      <CreateEventModalProvider>
    <Navbar/>

    <div className= "absolute inset-0 top-0 z-[-1] min-h-screen" >
      <ThemedLightRays />
    </div>

    <main>
      {children}
    </main>
      </CreateEventModalProvider>
    </AuthModalProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
