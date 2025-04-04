import "./globals.css";
import { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers/Providers";
import MainLayout from "@/components/Layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header/Header";
import DatePickerProvider from "@/components/Providers/DatePickerProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "餐廳點餐系統",
  description: "A restaurant ordering system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeRegistry>
          <DatePickerProvider>
            <AuthProvider>
              <Providers>
                <MainLayout>
                  <Header />
                  {children}
                </MainLayout>
              </Providers>
            </AuthProvider>
          </DatePickerProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
