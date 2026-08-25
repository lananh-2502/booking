import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anh Soobin ẹp zai',
  description: 'Tạo nhóm, chọn lịch rảnh, chờ đủ người rồi chốt kèo.',
  metadataBase: new URL('https://hen-nha.accounts626891.chatgpt.site'),
  openGraph: {
    title: 'Anh Soobin ẹp zai',
    description: 'Tạo nhóm, chọn lịch rảnh, chờ đủ người rồi chốt kèo.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anh Soobin ẹp zai',
    description: 'Tạo nhóm, chọn lịch rảnh, chờ đủ người rồi chốt kèo.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
