import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Strinova Map Planner',
  description: 'Plan your Strinova strategies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
