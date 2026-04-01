/**
 * PublicRoute — Guard for public-only routes (e.g. login).
 * Redirects authenticated users to the dashboard.
 * Prevents accessing login via URL or browser back button when logged in.
 */

import { Navigate } from 'react-router-dom';
import { getAuthPersistence } from '@/utils/auth.utils';
import { ROUTES } from '@/routes';

interface PublicRouteProps {
    children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const isAuthenticated = getAuthPersistence();

    if (isAuthenticated) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <>{children}</>;
}
