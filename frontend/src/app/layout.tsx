import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WanderAI – AI-Powered Travel Planner',
  description: 'Plan your perfect trip with AI. Generate personalized itineraries, budget estimates, and hotel recommendations in seconds.',
  keywords: 'travel planner, AI itinerary, trip planning, travel budget',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
