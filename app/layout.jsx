import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Meal Fit',
  description: '예산에 딱 맞춘 집밥 도우미',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="grain" />
        <Header />
        {children}
      </body>
    </html>
  );
}
