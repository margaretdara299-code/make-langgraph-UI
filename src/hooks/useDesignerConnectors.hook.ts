/**
 * useDesignerConnectors — fetches connectors grouped by type for the Node Library palette.
 * Uses the /api/v1/connectors/grouped endpoint which returns connectors pre-grouped by type.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchGroupedConnectors } from '@/services';

export default function useDesignerConnectors() {
    const {
        data: connectorsByType = {},
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['designerConnectors'],
        queryFn: fetchGroupedConnectors,
    });

    return {
        connectorsByType,
        isLoading,
        refetch,
    };
}

