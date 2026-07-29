import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { GlobalPageLoader } from '@/components/ui/loader/GlobalLoading';
import InternetStatus from '@/components/InternetStatus/InternetStatus';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.jpg',
    shortcut: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark:bg-gray-900">
        <ThemeProvider>
          <SidebarProvider>
            <LoadingProvider>
              <GlobalPageLoader />
              <InternetStatus />
              {children}
            </LoadingProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
