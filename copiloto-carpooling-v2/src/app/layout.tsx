import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import ClientLayout from './ClientLayout';
import { ToastProvider } from '@/components/Toast/ToastContainer';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // Tengo que cambiar esto en producción
  title: 'CoPiloto Carpooling App 🚘 - Tu compañero de ruta',
  description: 'CoPiloto es la plataforma para compartir coche en tu ciudad. Encuentra trayectos, conductores y compañeros para tus desplazamientos diarios de forma segura y cómoda.',
  keywords: 'carpooling, compartir coche, CoPiloto, viajes, movilidad, transporte, Zaragoza, Aragon, España conductor, pasajero, rutas, Gherson, GhersonSA',
  authors: [{ name: 'Gherson Sánchez' }],
  openGraph: {
    title: 'CoPiloto Carpooling App 🚘 - Tu compañero de ruta',
    description: 'Encuentra trayectos, conductores y compañeros para tus desplazamientos diarios de forma segura y cómoda.',
    images: ['/assets/copiloto.webp'],
    url: 'https://copiloto-carpooling.vercel.app/',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoPiloto Carpooling App 🚘',
    description: 'Tu compañero de ruta para compartir coche',
    images: ['/assets/copiloto.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <Script
          src="https://kit.fontawesome.com/729e7aed89.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
          <ToastProvider>
          <ClientLayout>{children}</ClientLayout>
        </ToastProvider>
      </body>
    </html>
  );
}