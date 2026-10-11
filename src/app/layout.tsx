import '@/styles/globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import { AppHeader } from '@/components/AppHeader';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { AdminModal } from '@/components/AdminModal';

export const metadata: Metadata = {
  title: 'Mundial 2026 — Simulador Interactivo',
  description: 'Aplicación web Full Stack para seguimiento, simulación y análisis del Mundial de Fútbol 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <div className="app-container">
            <AppHeader />
            <div className="app-body">
              <Sidebar />
              <main className="main-area">
                <Topbar />
                <div className="content-scroll">{children}</div>
              </main>
            </div>
            <AdminModal />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
