import type { ConnectorInstance } from '@/interfaces';
import { MOCK_CONNECTORS } from './mock-data';

const connectors: ConnectorInstance[] = [...MOCK_CONNECTORS];

/**
 * Fetches a list of fully authenticated Connector Environments (e.g., Salesforce Prod, Salesforce Dev)
 * that the user has permission to attach to Action nodes.
 * @param filters Filters by clientId and environment.
 */
export async function fetchConnectors(filters?: {
    clientId?: string;
    environment?: string;
}): Promise<ConnectorInstance[]> {
    let filtered = [...connectors];

    if (filters?.clientId) {
        filtered = filtered.filter((c) => c.clientId === filters.clientId);
    }
    if (filters?.environment) {
        filtered = filtered.filter((c) => c.environment === filters.environment);
    }

    return filtered;
}
