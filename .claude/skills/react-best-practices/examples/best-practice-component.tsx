import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ✅ BEST PRACTICE
// 1. Strict TypeScript Interfaces
// 2. Logic isolated to a hook
// 3. Callbacks wrapped to prevent re-rendering
// 4. Loading/Error states explicitly managed

export interface User {
    id: string;
    name: string;
    email: string;
}

interface UserDashboardProps {
    apiUrl: string;
    onUserSelect: (id: string) => void;
}

// Custom Hook for Data Logic
function useUserData(apiUrl: string) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchUsers() {
            try {
                setIsLoading(true);
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();
                if (isMounted) setUsers(data);
            } catch (err: any) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchUsers();
        return () => { isMounted = false; };
    }, [apiUrl]);

    return { users, isLoading, error };
}

// UI Component Layer
export default function UserDashboard({ apiUrl, onUserSelect }: UserDashboardProps) {
    const { users, isLoading, error } = useUserData(apiUrl);

    // Memoize the handler so child components don't re-render unnecessarily
    const handleSelect = useCallback((id: string) => {
        onUserSelect(id);
    }, [onUserSelect]);

    // Derived state memoized
    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => a.name.localeCompare(b.name));
    }, [users]);

    if (isLoading) return <div className="loading-spinner">Loading users...</div>;
    if (error) return <div className="error-banner">Error: {error}</div>;
    if (!users.length) return <div className="empty-state">No users found.</div>;

    return (
        <section className="user-dashboard">
            <h1 className="user-dashboard__title">Users</h1>
            <ul className="user-dashboard__list">
                {sortedUsers.map(user => (
                    <li
                      key={user.id}
                      className="user-dashboard__item"
                      onClick={() => handleSelect(user.id)}
                    >
                        {user.name}
                    </li>
                ))}
            </ul>
        </section>
    );
}
