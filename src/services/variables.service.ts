import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { ApiResponse } from '@/interfaces';

export interface Variable {
    id: number;
    key_name: string;
    group_name: string;
    value: string;
}

export async function fetchVariables(): Promise<Variable[]> {
    try {
        const result = await apiClient.get<Variable[] | { items: Variable[] }>(API_ENDPOINTS.VARIABLES.BASE);
        const data = result.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray((data as any).items)) return (data as any).items;
        return [];
    } catch (error) {
        console.error('fetchVariables error:', error);
        return [];
    }
}

export async function createVariable(payload: { key_name: string; group_name?: string; value: string }): Promise<ApiResponse<Variable>> {
    try {
        const result = await apiClient.post(API_ENDPOINTS.VARIABLES.BASE, payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create variable' };
    }
}

export async function updateVariable(variableId: number, payload: { key_name?: string; group_name?: string; value?: string }): Promise<ApiResponse<Variable>> {
    try {
        const result = await apiClient.patch(API_ENDPOINTS.VARIABLES.BY_ID(variableId), payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update variable' };
    }
}

export async function deleteVariable(variableId: number): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.VARIABLES.BY_ID(variableId));
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete variable' };
    }
}
