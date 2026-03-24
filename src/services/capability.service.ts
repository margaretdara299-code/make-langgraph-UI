import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Capability } from '@/interfaces';

export async function fetchCapabilities(): Promise<Capability[]> {
    try {
        const url = API_ENDPOINTS?.CAPABILITIES?.BASE || '/api/v1/capabilities';
        const result = await apiClient.get<Capability[] | { items: Capability[] }>(url);
        const data = result.data;

        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray((data as any).items)) {
            return (data as any).items;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch capabilities:', error);
        return [];
    }
}
