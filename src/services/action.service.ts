import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { ActionDefinition, PaginatedResponse, ApiResponse, ActionFilters } from '@/interfaces';

// Cache for mock fallback functions
let cachedActions: ActionDefinition[] | null = null;

/**
 * Creates a new Action definition in the system.
 * @param input The partial action details needed for creation.
 * @returns A promise resolving to the standard ApiResponse containing the newly created Action.
 */
export async function createAction(
    input: Partial<ActionDefinition>
): Promise<ApiResponse<ActionDefinition>> {
    try {
        const payload = {
            name: input.name || 'Untitled Action',
            actionKey: input.actionKey || 'new.action.key',
            description: input.description || '',
            category: input.category || 'Uncategorized',
            capability: (input.capability || 'api').toUpperCase(),
            icon: input.icon || '🧩',
            defaultNodeTitle: input.defaultNodeTitle || input.name || 'Untitled',
            scope: input.scope || 'global',
        };

        await apiClient.post(API_ENDPOINTS.ACTIONS.BASE, payload);

        const newAction: ActionDefinition = {
            id: 'pending-refresh',
            actionKey: input.actionKey || 'new.action.key',
            name: input.name || 'Untitled Action',
            description: input.description || '',
            category: input.category || 'Uncategorized',
            capability: input.capability || 'api',
            scope: input.scope || 'global',
            icon: input.icon || '🧩',
            defaultNodeTitle: input.defaultNodeTitle || input.name || 'Untitled',
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return { success: true, data: newAction };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create action' };
    }
}

/**
 * Fetches a paginated list of catalog Actions from the backend.
 * Validates and maps custom capability enums safely.
 * @param filters Optional filtering criteria (status, capability, category, search phrase).
 * @returns A paginated response of Action definitions.
 */
export async function fetchActions(
    filters?: ActionFilters
): Promise<PaginatedResponse<ActionDefinition>> {
    try {
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters?.capability) params.set('capability', filters.capability.toUpperCase());
        if (filters?.category) params.set('category', filters.category);
        if (filters?.search) params.set('q', filters.search);

        const queryString = params.toString();
        const url = `${API_ENDPOINTS.ACTIONS.BASE}${queryString ? `?${queryString}` : ''}`;

        const result = await apiClient.get<{ items: ActionDefinition[]; total: number }>(url);

        const items: ActionDefinition[] = (result.items || []).map((a) => {
            const anyA = a as any;
            return {
                ...a,
                id: anyA.actionDefinitionId || anyA.id,
                capability: (a.capability || 'api').toLowerCase() as ActionDefinition['capability'],
            };
        });

        cachedActions = items;

        const page = filters?.page ?? 1;
        const pageSize = filters?.pageSize ?? 12;
        const start = (page - 1) * pageSize;

        return {
            data: items.slice(start, start + pageSize),
            total: items.length,
            page,
            pageSize,
            totalPages: Math.ceil(items.length / pageSize),
        };
    } catch (error) {
        console.error('fetchActions API error:', error);
        return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    }
}

/**
 * Retrieves aggregate counts of actions broken down by their Category (AI, API, RPA, etc.).
 * Useful for the Category filters sidebar in the Action Catalog.
 * @returns A promise resolving to a record mapping category strings to counts.
 */
export async function fetchActionCategoryCounts(): Promise<Record<string, number>> {
    try {
        const result = await apiClient.get<{ items: ActionDefinition[]; total: number }>(API_ENDPOINTS.ACTIONS.BASE);
        const items = result.items || [];
        const counts: Record<string, number> = {};
        for (const a of items) {
            const cat = a.category || 'Uncategorized';
            counts[cat] = (counts[cat] ?? 0) + 1;
        }
        return counts;
    } catch {
        return {};
    }
}

/**
 * Retrieves aggregate counts of actions broken down by their publication Status (draft, published, etc.).
 * Useful for the Status filters sidebar in the Action Catalog.
 * @returns A promise resolving to a record mapping status strings to counts.
 */
export async function fetchActionStatusCounts(): Promise<Record<string, number>> {
    try {
        const result = await apiClient.get<{ items: ActionDefinition[]; total: number }>(API_ENDPOINTS.ACTIONS.BASE);
        const items = result.items || [];
        const counts: Record<string, number> = { all: items.length, published: 0, draft: 0, archived: 0 };
        for (const a of items) {
            const st = (a as unknown as Record<string, unknown>).versionStatus as string || a.status || 'draft';
            counts[st] = (counts[st] ?? 0) + 1;
        }
        return counts;
    } catch {
        return { all: 0, published: 0, draft: 0, archived: 0 };
    }
}

/**
 * Fetches explicitly the actions available to be placed on a designer canvas for a specific client.
 * Returns slightly different payload structures that include inputsSchemaJson and outputsSchemaJson.
 * @param clientId The tenant/client ID context.
 * @param environment The target environment (dev, staging, prod).
 * @param filters Optional filtering applied from the Node Palette search.
 */
export async function fetchDesignerActions(
    clientId = 'c_demo',
    environment = 'dev',
    filters?: { capability?: string; category?: string; search?: string }
) {
    const params = new URLSearchParams();
    params.set('client_id', clientId);
    params.set('environment', environment);
    if (filters?.capability) params.set('capability', filters.capability.toUpperCase());
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('q', filters.search);

    const queryString = params.toString();
    return apiClient.get<{ items: unknown[]; total: number }>(`${API_ENDPOINTS.ACTIONS.DESIGNER}?${queryString}`);
}

// ── Mock Fallbacks ──

/**
 * MOCK: Retrieves a single action by its ID from the local cache.
 * @param id The unique identifier of the action definition.
 */
export async function fetchActionById(id: string): Promise<ApiResponse<ActionDefinition>> {
    const cached = cachedActions ?? [];
    const action = cached.find((a) => a.id === id);
    if (!action) return { success: false, error: 'Action not found.' };
    return { success: true, data: action };
}
