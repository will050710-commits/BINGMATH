import "./globalsbailam.css";

export const metadata = {
  title: "BINGSTEAM Test",
  description: "Reading Test",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}