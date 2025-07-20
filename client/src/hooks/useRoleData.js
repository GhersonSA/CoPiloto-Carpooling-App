import { useState, useEffect } from 'react';
import { getUserRole } from '../utils/auth';

import { guestDrivers, adminDrivers, userDrivers } from '../utils/data/drivers'
import { guestPassengers, adminPassengers, userPassengers } from '../utils/data/passengers'
import { guestRoutes, adminRoutes, userRoutes } from '../utils/data/routes'
import { guestPayments, adminPayments, userPayments } from '../utils/data/payments'
import { guestRatings, adminRatings, userRatings } from '../utils/data/ratings'

export function useRoleData() {
    const [data, setData] = useState({
        drivers: [],
        passengers: [],
        routes: [],
        payments: [],
        ratings: [],
    });

    useEffect(() => {
        const role = getUserRole() || "guest";

        switch (role) {
            case "admin":
                setData({
                    drivers: adminDrivers,
                    passengers: adminPassengers,
                    routes: adminRoutes,
                    payments: adminPayments,
                    ratings: adminRatings,
                });
                break;
            case "user":
                setData ({
                    drivers: userDrivers,
                    passengers: userPassengers,
                    routes: userRoutes,
                    payments: userPayments,
                    ratings: userRatings,
                });
                break;
            default:
                setData({
                    drivers: guestDrivers,
                    passengers: guestPassengers,
                    routes: guestRoutes,
                    payments: guestPayments,
                    ratings: guestRatings,
                });
        }
    }, []);

    return data;
}