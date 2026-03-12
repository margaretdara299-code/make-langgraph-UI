/**
 * useDesignerActions — fetches published actions specifically formatted for the Skill Designer Canvas palette.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchDesignerActions } from '@/services';

export default function useDesignerActions(clientId = 'c_demo', environment = 'dev') {
    // We type this as any to align with the current node data structures without refactoring all interfaces yet
    const [actionsByCategory, setActionsByCategory] = useState<Record<string, any[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadActions = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchDesignerActions(clientId, environment);
            const items = result.items || [];

            // Group by category for the NodePalette accordion
            const grouped: Record<string, any[]> = {};
            for (const action of items) {
                const anyAction = action as any;
                const cat = anyAction.category || 'Uncategorized';
                if (!grouped[cat]) {
                    grouped[cat] = [];
                }
                grouped[cat].push(anyAction);
            }
            setActionsByCategory(grouped);
        } catch (error) {
            console.error('Failed to load designer actions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [clientId, environment]);

    useEffect(() => {
        loadActions();
    }, [loadActions]);

    return {
        actionsByCategory,
        isLoading,
        refetch: loadActions,
    };
}
