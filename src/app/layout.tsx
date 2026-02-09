import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainContent } from "@/components/layout/main-content";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrandPilot - AI Social Media Growth Platform",
  description:
    "Fully autonomous AI-powered social media growth platform for Instagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <SidebarProvider>
          <Sidebar />
          <MainContent>{children}</MainContent>
          <OnboardingWizard />
        </SidebarProvider>
      </body>
    </html>
  );
}
