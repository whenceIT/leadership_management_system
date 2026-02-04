import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import "toastr/build/toastr.min.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import TimeWatcherProvider from '@/components/TimeWatcherProvider';
import type { Metadata } from 'next';

const outfit = Outfit({
  subsets: ["latin"],
});

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
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <TimeWatcherProvider />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
