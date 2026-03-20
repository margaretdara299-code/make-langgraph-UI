/**
 * Connector service — API calls for connector CRUD operations.
 */

import type { CreateConnectorPayload, ConnectorResponse } from '@/interfaces';
import { API_ENDPOINTS } from './api.endpoints';
import { apiClient } from './http.service';

/**
 * Fetch all connectors from the backend.
 * apiClient.get already unwraps the envelope { status, message, data } → data.
 */
export async function fetchConnectors(): Promise<ConnectorResponse[]> {
    const result = await apiClient.get<ConnectorResponse[]>(API_ENDPOINTS.CONNECTORS.BASE);
    return (result as ConnectorResponse[]) ?? [];
}

/**
 * Create a new connector (API or Database).
 */
export async function createConnector(payload: CreateConnectorPayload): Promise<any> {
    return apiClient.post(API_ENDPOINTS.CONNECTORS.BASE, payload);
}

/**
 * Update an existing connector.
 */
export async function updateConnector(
    connectorId: number,
    payload: Partial<CreateConnectorPayload>
): Promise<any> {
    return apiClient.patch(API_ENDPOINTS.CONNECTORS.BY_ID(connectorId), payload);
}

/**
 * Delete a connector by ID.
 */
export async function deleteConnector(connectorId: number): Promise<any> {
    return apiClient.delete(API_ENDPOINTS.CONNECTORS.BY_ID(connectorId));
}
