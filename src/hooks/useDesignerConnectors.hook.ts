/**
 * useDesignerConnectors — fetches connectors grouped by type for the Node Library palette.
 * Uses the /api/v1/connectors/grouped endpoint which returns connectors pre-grouped by type.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchGroupedConnectors } from '@/services';
import type { ConnectorResponse } from '@/interfaces';

export default function useDesignerConnectors() {
    const [connectorsByType, setConnectorsByType] = useState<Record<string, ConnectorResponse[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadConnectors = useCallback(async () => {
        setIsLoading(true);
        try {
            const grouped = await fetchGroupedConnectors();
            setConnectorsByType(grouped);
        } catch (error) {
            console.error('Failed to load designer connectors:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnectors();
    }, [loadConnectors]);

    return {
        connectorsByType,
        isLoading,
        refetch: loadConnectors,
    };
}
