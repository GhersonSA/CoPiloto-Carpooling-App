'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import { ToastProvider } from '@/components/Toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLogin = pathname === '/';

    return (
        <SessionProvider>
            <ToastProvider>
                {isLogin ? (
                    <>{children}</>
                ) : (
                    <main className="flex h-dvh overflow-hidden">
                        <Sidebar />
                        <section className="w-full h-full min-w-0 flex flex-col">
                            <Header />
                            <main className="flex-1 overflow-y-auto bg-gray-200">
                                {children}
                            </main>
                            <TabBar />
                        </section>
                    </main>
                )}
            </ToastProvider>
        </SessionProvider>
    );
}