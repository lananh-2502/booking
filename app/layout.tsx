import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hẹn nha! — Chốt lịch cả nhóm',
  description: 'Chọn lịch rảnh cùng nhau và tự động tìm ra ngày giờ phù hợp cho cả nhóm.',
  metadataBase: new URL('https://hen-nha.accounts626891.chatgpt.site'),
  openGraph: {
    title: 'Hẹn nha! — Chốt lịch cả nhóm',
    description: 'Chọn lịch rảnh cùng nhau và tự động tìm ra ngày giờ phù hợp cho cả nhóm.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hẹn nha! — Chốt lịch cả nhóm',
    description: 'Chọn lịch rảnh cùng nhau và tự động tìm ra ngày giờ phù hợp cho cả nhóm.',
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
