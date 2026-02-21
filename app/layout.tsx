import "./globals.css";
import BackgroundGlow from "@/components/layout/BackgroundGlow";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
  <BackgroundGlow />
  {children}
</body>

    </html>
  );
}
