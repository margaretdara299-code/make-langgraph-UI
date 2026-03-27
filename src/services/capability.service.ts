/**
 * Capability service — API calls for capability CRUD operations.
 */

import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Capability, ApiResponse } from '@/interfaces';

/**
 * Fetches all capabilities from the backend.
 */
export async function fetchCapabilities(): Promise<Capability[]> {
    try {
        const url = API_ENDPOINTS?.CAPABILITIES?.BASE || '/api/v1/capabilities';
        const result = await apiClient.get<Capability[] | { items: Capability[] }>(url);
        const data = result.data;

        if (Array.isArray(data)) return data;
        if (data && Array.isArray((data as any).items)) return (data as any).items;
        return [];
    } catch (error) {
        console.error('Failed to fetch capabilities:', error);
        return [];
    }
}

/**
 * Create a new capability.
 */
export async function createCapability(payload: { name: string; description?: string }): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.post(API_ENDPOINTS.CAPABILITIES.BASE, payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create capability' };
    }
}

/**
 * Update an existing capability.
 */
export async function updateCapability(
    capabilityId: number,
    payload: { name?: string; description?: string }
): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.patch(API_ENDPOINTS.CAPABILITIES.BY_ID(capabilityId), payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update capability' };
    }
}

/**
 * Delete a capability by ID.
 */
export async function deleteCapability(capabilityId: number): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.CAPABILITIES.BY_ID(capabilityId));
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete capability' };
    }
}
