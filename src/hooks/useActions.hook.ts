/**
 * useActions — fetches action definitions and groups them by category.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ActionDefinition, ActionFilters } from '@/interfaces';
import { fetchActions, fetchActionStatusCounts, fetchActionCategoryCounts, fetchActionCapabilityCounts } from '@/services';

export default function useActions(initialFilters?: ActionFilters) {
    const defaultFilters: ActionFilters = initialFilters || { page: 1, pageSize: 12 };
    const [filters, setFilters] = useState<ActionFilters>(defaultFilters);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['actions', filters],
        queryFn: async () => {
            const [result, sCounts, cCounts, capCounts] = await Promise.all([
                fetchActions(filters),
                fetchActionStatusCounts(),
                fetchActionCategoryCounts(),
                fetchActionCapabilityCounts()
            ]);

            // Group by category (primarily for NodePalette)
            const grouped: Record<string, ActionDefinition[]> = {};
            for (const action of (result.data || [])) {
                if (!grouped[action.category]) {
                    grouped[action.category] = [];
                }
                grouped[action.category].push(action);
            }

            return {
                actions: result.data || [],
                actionsByCategory: grouped,
                totalActions: result.total || 0,
                statusCounts: sCounts,
                categoryCounts: cCounts,
                capabilityCounts: capCounts
            };
        }
    });

    return {
        actions: data?.actions || [],
        actionsByCategory: data?.actionsByCategory || {},
        statusCounts: data?.statusCounts || {},
        categoryCounts: data?.categoryCounts || {},
        capabilityCounts: data?.capabilityCounts || {},
        totalActions: data?.totalActions || 0,
        filters,
        setFilters,
        isLoading,
        refetch
    };
}

