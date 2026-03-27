/**
 * useDesignerActions — fetches published actions specifically formatted for the Skill Designer Canvas palette.
 * Uses the /api/actions/grouped endpoint which returns actions pre-grouped by category name.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchGroupedActions } from '@/services';

export default function useDesignerActions() {
    const {
        data: actionsByCategory = {},
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['designerActions'],
        queryFn: fetchGroupedActions,
        staleTime: 0, // Always consider stale so it refetches
        refetchOnMount: true, // Force refetch when canvas opens
    });

    return {
        actionsByCategory,
        isLoading,
        refetch,
    };
}

