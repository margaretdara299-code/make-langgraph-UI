import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Category } from '@/interfaces';

/**
 * Fetches the list of all categories from the backend.
 */
export async function fetchCategories(): Promise<Category[]> {
    try {
        const result = await apiClient.get<Category[] | { items: Category[] }>(API_ENDPOINTS.CATEGORIES.BASE);
        
        // Handle both raw array responses and wrapped `{ items: [] }` responses
        if (Array.isArray(result)) {
            return result;
        } else if (result && Array.isArray((result as any).items)) {
            return (result as any).items;
        }
        return [];
    } catch (error) {
        console.error('fetchCategories API error:', error);
        return [];
    }
}
