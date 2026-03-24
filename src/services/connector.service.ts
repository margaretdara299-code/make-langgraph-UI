/**
 * Connector service — API calls for connector CRUD operations.
 */

import type { CreateConnectorPayload, ConnectorResponse, ApiResponse } from '@/interfaces';
import { API_ENDPOINTS } from './api.endpoints';
import { apiClient } from './http.service';

/**
 * Fetch all connectors from the backend.
 * apiClient.get already unwraps the envelope { status, message, data } → data.
 */
export async function fetchConnectors(): Promise<ConnectorResponse[]> {
    const result = await apiClient.get<ConnectorResponse[]>(API_ENDPOINTS.CONNECTORS.BASE);
    return (result.data as ConnectorResponse[]) ?? [];
}

/**
 * Create a new connector (API or Database).
 */
export async function createConnector(payload: CreateConnectorPayload): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.post(API_ENDPOINTS.CONNECTORS.BASE, payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create connector' };
    }
}

/**
 * Update an existing connector.
 */
export async function updateConnector(
    connectorId: number,
    payload: Partial<CreateConnectorPayload>
): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.patch(API_ENDPOINTS.CONNECTORS.BY_ID(connectorId), payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update connector' };
    }
}

/**
 * Delete a connector by ID.
 */
export async function deleteConnector(connectorId: number): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.CONNECTORS.BY_ID(connectorId));
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete connector' };
    }
}

/**
 * Fetch connectors grouped by type (e.g., { "API": [...], "DATABASE": [...] }).
 * Used by the Node Library to populate the Connectors accordion.
 */
export async function fetchGroupedConnectors(): Promise<Record<string, ConnectorResponse[]>> {
    try {
        const result = await apiClient.get<any>(API_ENDPOINTS.CONNECTORS.GROUPED);
        return (result.data as Record<string, ConnectorResponse[]>) ?? {};
    } catch (error) {
        console.error('fetchGroupedConnectors API error:', error);
        return {};
    }
}
