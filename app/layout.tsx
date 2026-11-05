import './globals.css';
import Shell from '@/components/Shell';

export const metadata = { title: '모퉁이 어드민' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
