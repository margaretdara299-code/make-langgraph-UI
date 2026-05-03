/**
 * Category service — API calls for category CRUD operations.
 */

import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Category, ApiResponse } from '@/interfaces';

/**
 * Fetches all categories from the backend.
 */
export async function fetchCategories(): Promise<Category[]> {
    try {
        const result = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE);
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error('fetchCategories API error:', error);
        return [];
    }
}

/**
 * Create a new category.
 */
export async function createCategory(payload: { name: string; description?: string; icon?: string }): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to create category';
        if (error.response?.status === 409) msg = 'Category already exists';
        else if (error.response?.status === 400) msg = 'Validation error: ' + msg;
        return { success: false, error: msg };
    }
}

/**
 * Update an existing category.
 */
export async function updateCategory(
    categoryId: number,
    payload: { name?: string; description?: string; icon?: string }
): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.patch(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId), payload);
        return { success: true, data: result.data, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to update category';
        if (error.response?.status === 404) msg = 'Category not found';
        else if (error.response?.status === 409) msg = 'Conflict: ' + msg;
        return { success: false, error: msg };
    }
}

/**
 * Delete a category by ID.
 */
export async function deleteCategory(categoryId: number): Promise<ApiResponse<any>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));
        return { success: true, data: result.data, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to delete category';
        if (error.response?.status === 404) msg = 'Category not found';
        return { success: false, error: msg };
    }
}
