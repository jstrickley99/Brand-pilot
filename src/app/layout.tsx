import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
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
    <ClerkProvider dynamic>
      <html lang="en" className="dark">
        <body className={`${inter.variable} antialiased`}>
          <SignedIn>
            <SidebarProvider>
              <Sidebar />
              <MainContent>{children}</MainContent>
              <OnboardingWizard />
            </SidebarProvider>
          </SignedIn>
          <SignedOut>
            {children}
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  );
}
