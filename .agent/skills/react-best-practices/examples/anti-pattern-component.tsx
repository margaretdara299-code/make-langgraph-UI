import React, { useState, useEffect } from 'react';

// ❌ ANTI-PATTERN: Everything done wrong
// 1. No TypeScript Interfaces (implicit any)
// 2. Fetching inside component (useEffect noise)
// 3. Inline arrow functions in JSX (causes re-renders)
// 4. Inconsistent variable naming (data vs users)
// 5. No loading or error states handled properly

export default function UserDashboard({ config, onSelect }: any) {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // Missing dependency array warnings
        fetch(config.apiUrl)
            .then(res => res.json())
            .then(users => setData(users));
    }, [config]); // config is an object, passes by reference causing infinite loops if parent re-renders

    // Unnecessary recreation of this function on every render
    const doSomething = (id: any) => {
        console.log("Selected", id);
        onSelect(id);
    };

    return (
        <div>
            <h1>Users</h1>
            {data.map((u: any, i: number) => (
                // Anti-pattern: using index as key
                <div key={i} onClick={() => doSomething(u.id)}>
                    {u.name}
                </div>
            ))}
        </div>
    );
}
