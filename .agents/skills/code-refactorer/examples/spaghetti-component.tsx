import React, { useState, useEffect } from 'react';

// ❌ BAD PRACTICE (Spaghetti Code)
// Logic, API calls, and UI are all mashed together in one file.

export default function UserList() {
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

    const filteredUsers = users.filter(u => u.name.includes(search));

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
