import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { ApiResponse } from '@/interfaces';

import type { Variable } from './variables.service';

/**
 * Group interface matching the backend schema
 * transformed to camelCase by http.service.
 */
export interface Group {
    groupId: number;
    groupKey: string;
    groupName: string;
    description: string | null;
    type?: string | null;
    variables?: Variable[];
    createdAt?: string;
    updatedAt?: string;
}

export async function fetchGroups(): Promise<Group[]> {
    const result = await apiClient.get<Group[]>(API_ENDPOINTS.GROUPS.BASE);
    return result.data || [];
}

export async function createGroup(payload: Partial<Group>): Promise<ApiResponse<Group>> {
    try {
        const result = await apiClient.post<Group>(API_ENDPOINTS.GROUPS.BASE, payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        console.error('createGroup request error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create group' };
    }
}

export async function updateGroup(groupId: number, payload: Partial<Group>): Promise<ApiResponse<Group>> {
    try {
        const result = await apiClient.patch<Group>(API_ENDPOINTS.GROUPS.BY_ID(groupId), payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update group' };
    }
}

export async function deleteGroup(groupId: number): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.GROUPS.BY_ID(groupId));
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete group' };
    }
}
