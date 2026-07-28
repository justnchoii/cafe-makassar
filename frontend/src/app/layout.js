import './globals.css';

export const metadata = {
  title: 'Cafe Makassar - Temukan Cafe Terbaik di Makassar',
  description: 'Jelajahi cafe-cafe terbaik di Makassar dengan rekomendasi AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
