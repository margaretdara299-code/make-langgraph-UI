/**
 * PrivateRoute — Auth guard for protected routes.
 * Redirects unauthenticated users to the login page.
 */

import { Navigate } from 'react-router-dom';
import { getAuthPersistence } from '@/utils/auth.utils';
import { ROUTES } from '@/routes';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const isAuthenticated = getAuthPersistence();

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <>{children}</>;
}
