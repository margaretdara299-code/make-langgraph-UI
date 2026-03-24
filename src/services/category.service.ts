import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Category } from '@/interfaces';

/**
 * Fetches the list of all categories from the backend.
 */
export async function fetchCategories(): Promise<Category[]> {
    try {
        const result = await apiClient.get<Category[] | { items: Category[] }>(API_ENDPOINTS.CATEGORIES.BASE);
        const data = result.data;
        
        // Handle both raw array responses and wrapped `{ items: [] }` responses
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray((data as any).items)) {
            return (data as any).items;
        }
        return [];
    } catch (error) {
        console.error('fetchCategories API error:', error);
        return [];
    }
}
