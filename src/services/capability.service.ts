import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Capability } from '@/interfaces';

export async function fetchCapabilities(): Promise<Capability[]> {
    try {
        const url = API_ENDPOINTS?.CAPABILITIES?.BASE || '/api/v1/capabilities';
        const response = await apiClient.get<Capability[] | { items: Capability[] }>(url);
        if (Array.isArray(response)) {
            return response;
        }
        if (response && Array.isArray(response.items)) {
            return response.items;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch capabilities:', error);
        return [];
    }
}
