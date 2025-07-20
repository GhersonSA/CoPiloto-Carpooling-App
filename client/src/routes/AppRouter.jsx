import { createBrowserRouter } from 'react-router-dom'

import LoginHero from '../features/Auth/LoginHero'
import Layout from '../layout/Layout'
import Home from '../features/Home/Home'
import Dashboard from '../features/Dashboard/Dashboard';
import Passenger from '../features/Passenger/Passenger';
import Travel from '../features/Travel/Travel';
import Payments from '../features/Payments/Payments';
import Stars from '../features/Stars/Stars';
import Profile from '../features/Profile/Profile';
import Settings from '../features/Settings/Settings';


const AppRouter = createBrowserRouter([
    { path: '/', element: <LoginHero /> },
    { path: '/', element: <Layout />,
        children: [
            { path: '/home', element: <Home /> },
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/passenger', element: <Passenger /> },
            { path: '/travel', element: <Travel /> },
            { path: '/payments', element: <Payments /> },
            { path: '/stars', element: <Stars /> },
            { path: '/profile', element: <Profile /> },
            { path: '/settings', element: <Settings /> }
        ],
    },
]);

export default AppRouter;