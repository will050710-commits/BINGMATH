import "./globalsbailam.css";

export const metadata = {
  title: "DUOSTEAM Test",
  description: "Reading Test",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}