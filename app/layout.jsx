import "./globals.css";

export const metadata = {
  title: "Trading Terminal",
  description: "Local production trading terminal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
