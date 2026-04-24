import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { ApiResponse } from '@/interfaces';

/**
 * Variable interface matching the backend schema 
 * but transformed to camelCase by http.service.
 */
export interface Variable {
    groupId?: number;
    groupKey: string;
    groupName?: string;
    variableKey: string;
    variableName: string;
    variableValue: string;
    dataType: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export async function fetchVariables(): Promise<Variable[]> {
    try {
        const result = await apiClient.get<Variable[]>(API_ENDPOINTS.VARIABLES.BASE);
        return result.data || [];
    } catch (error) {
        console.error('fetchVariables error:', error);
        return [];
    }
}

export async function createVariable(payload: Partial<Variable>): Promise<ApiResponse<Variable>> {
    try {
        const result = await apiClient.post<Variable>(API_ENDPOINTS.VARIABLES.BASE, payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create variable' };
    }
}

export async function updateVariable(groupKey: string, variableKey: string, payload: Partial<Variable>): Promise<ApiResponse<Variable>> {
    try {
        const result = await apiClient.patch<Variable>(API_ENDPOINTS.VARIABLES.BY_KEY(groupKey, variableKey), payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update variable' };
    }
}

export async function deleteVariable(groupKey: string, variableKey: string): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.VARIABLES.BY_KEY(groupKey, variableKey));
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete variable' };
    }
}
