/**
 * useDesignerActions — fetches published actions specifically formatted for the Skill Designer Canvas palette.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchActions } from '@/services';
import type { ActionDefinition } from '@/interfaces';

export default function useDesignerActions() {
    // Grouped actions for the accordion in NodePalette
    const [actionsByCategory, setActionsByCategory] = useState<Record<string, ActionDefinition[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadActions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all published actions for the palette
            const result = await fetchActions({ status: 'published', pageSize: 100 });
            const items = result.data || [];

            // Group by category for the NodePalette accordion
            const grouped: Record<string, ActionDefinition[]> = {};
            for (const action of items) {
                const cat = action.category || 'Uncategorized';
                if (!grouped[cat]) {
                    grouped[cat] = [];
                }
                grouped[cat].push(action);
            }
            setActionsByCategory(grouped);
        } catch (error) {
            console.error('Failed to load designer actions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActions();
    }, [loadActions]);

    return {
        actionsByCategory,
        isLoading,
        refetch: loadActions,
    };
}
