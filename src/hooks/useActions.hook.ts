/**
 * useActions — fetches action definitions and groups them by category.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ActionDefinition } from '@/interfaces';
import { fetchActions } from '@/services';

export default function useActions() {
    const [actions, setActions] = useState<ActionDefinition[]>([]);
    const [actionsByCategory, setActionsByCategory] = useState<Record<string, ActionDefinition[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadActions = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchActions();
            setActions(result);

            // Group by category
            const grouped: Record<string, ActionDefinition[]> = {};
            for (const action of result) {
                if (!grouped[action.category]) {
                    grouped[action.category] = [];
                }
                grouped[action.category].push(action);
            }
            setActionsByCategory(grouped);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActions();
    }, [loadActions]);

    return { actions, actionsByCategory, isLoading, refetch: loadActions };
}
