import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='w-screen flex h-screen items-center justify-center overflow-hidden bg-[#4880FF]'>
      {children}
    </main>
  );
}
