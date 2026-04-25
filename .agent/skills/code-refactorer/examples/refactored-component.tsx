// 1. THE HOOK (useUserList.hook.ts)
import { useState, useEffect, useMemo } from 'react';

export function useUserList() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            });
    }, []);

    const filteredUsers = useMemo(() => 
        users.filter(u => u.name.includes(search)), 
    [users, search]);

    return { filteredUsers, loading, search, setSearch };
}

// ============================================

// 2. THE UI COMPONENT (UserList.tsx)
import React from 'react';

// ✅ BEST PRACTICE
// The UI is incredibly clean. All logic lives in the hook.

export default function UserList() {
    const { filteredUsers, loading, search, setSearch } = useUserList();

    return (
        <div className="user-list-container">
            <input 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
               placeholder="Search..." 
            />
            {loading ? <p>Loading...</p> : (
                <ul>
                    {filteredUsers.map((user: any) => <li key={user.id}>{user.name}</li>)}
                </ul>
            )}
        </div>
    );
}
