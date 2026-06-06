import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/auth-context';
import Navbar from '../components/navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'CampusGig | Find Nearby Opportunities',
  description: 'Production marketplace matching hungry talent with immediate hyper-local opportunity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased selection:bg-accent selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}