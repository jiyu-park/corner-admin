import './globals.css';
import Shell from '@/components/Shell';

export const metadata = { title: '모퉁이 어드민' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
