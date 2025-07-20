import { Outlet } from 'react-router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Layout = () => {
    return (
        <main className="flex h-screen overflow-hidden">
            <Sidebar />
            <section className="w-full h-full min-w-0 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-200">
                    <Outlet />
                </main>
            </section>
        </main>
    )
}

export default Layout;