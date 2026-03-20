/**
 * useDesignerActions — fetches published actions specifically formatted for the Skill Designer Canvas palette.
 * Uses the /api/actions/grouped endpoint which returns actions pre-grouped by category name.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchGroupedActions } from '@/services';
import type { ActionDefinition } from '@/interfaces';

export default function useDesignerActions() {
    // Grouped actions for the accordion in NodePalette
    const [actionsByCategory, setActionsByCategory] = useState<Record<string, ActionDefinition[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadActions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch actions pre-grouped by category name from the backend
            const grouped = await fetchGroupedActions();
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
