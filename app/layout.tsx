import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SavedCoursesProvider } from '@/components/SavedCourses';

export const metadata: Metadata = {
  title: {
    default: 'Study Bison — Study Smarter, Rise Higher',
    template: '%s · Study Bison',
  },
  description:
    "A free study companion streaming lectures, notes and PDFs from India's top educators — JEE, NEET, UPSC, GATE and 50+ more goals.",
  icons: { icon: '/icons/logo.svg' },
  openGraph: {
    title: 'Study Bison — Study Smarter, Rise Higher',
    description: 'Free lectures, handwritten notes and PDFs for 50+ exams.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#07070b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <div className="aurora" aria-hidden />
        <div className="grid-lines" aria-hidden />
        <SavedCoursesProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SavedCoursesProvider>
      </body>
    </html>
  );
}
