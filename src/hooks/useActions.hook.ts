/**
 * useActions — fetches action definitions and groups them by category.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ActionDefinition, ActionFilters } from '@/interfaces';
import { fetchActions, fetchActionStatusCounts, fetchActionCategoryCounts, fetchActionCapabilityCounts } from '@/services';

export default function useActions(initialFilters?: ActionFilters) {
    const defaultFilters: ActionFilters = initialFilters || { page: 1, pageSize: 12 };

    const [actions, setActions] = useState<ActionDefinition[]>([]);
    const [actionsByCategory, setActionsByCategory] = useState<Record<string, ActionDefinition[]>>({});
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [capabilityCounts, setCapabilityCounts] = useState<Record<string, number>>({});
    const [totalActions, setTotalActions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<ActionFilters>(defaultFilters);

    const loadActions = useCallback(async (currentFilters: ActionFilters = filters) => {
        setIsLoading(true);
        try {
            const [result, sCounts, cCounts, capCounts] = await Promise.all([
                fetchActions(currentFilters),
                fetchActionStatusCounts(),
                fetchActionCategoryCounts(),
                fetchActionCapabilityCounts()
            ]);

            setActions(result.data || []);
            setTotalActions(result.total || 0);
            setStatusCounts(sCounts);
            setCategoryCounts(cCounts);
            setCapabilityCounts(capCounts);

            // Group by category (primarily for NodePalette)
            const grouped: Record<string, ActionDefinition[]> = {};
            for (const action of (result.data || [])) {
                if (!grouped[action.category]) {
                    grouped[action.category] = [];
                }
                grouped[action.category].push(action);
            }
            setActionsByCategory(grouped);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadActions(filters);
    }, [filters, loadActions]);

    return {
        actions,
        actionsByCategory,
        statusCounts,
        categoryCounts,
        capabilityCounts,
        totalActions,
        filters,
        setFilters,
        isLoading,
        refetch: loadActions
    };
}
