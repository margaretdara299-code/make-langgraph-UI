import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import { fetchCapabilities } from './capability.service';
import { fetchCategories } from './category.service';
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
        const anyInput = input as any;
        const payload = {
            name: input.name || 'Untitled Action',
            action_key: anyInput.action_key || input.action_key || 'new_action_key',
            description: input.description || '',
            category: input.category || 'Uncategorized',
            category_id: anyInput.category_id || input.category_id || 1,
            capability: (input.capability || 'api').toUpperCase(),
            capability_id: anyInput.capability_id || input.capability_id || 1,
            icon: input.icon || 'Package',
            default_node_title: anyInput.default_node_title || input.default_node_title || input.name || 'Untitled',
            scope: input.scope || 'global',

            // ── Version-level JSON blobs (wizard step 2: Configuration) ──
            configurations_json: anyInput.configurations_json || input.configurations_json || {},
        };

        const res = await apiClient.post<any>(API_ENDPOINTS.ACTIONS.BASE, payload);

        const newAction = {
            id: 'pending-refresh',
            action_key: input.action_key || 'new_action_key',
            name: input.name || 'Untitled Action',
            description: input.description || '',
            category: input.category || 'Uncategorized',
            capability: input.capability || 'api',
            scope: input.scope || 'global',
            icon: input.icon || 'Package',
            default_node_title: input.default_node_title || input.name || 'Untitled',
            status: 'draft' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        return { success: true, data: newAction as any, message: res.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create action' };
    }
}

/**
 * Fetches actions pre-grouped by category name from the backend.
 * Uses GET /api/actions/grouped which JOINs with the category table.
 * Ideal for the Node Library / Designer palette.
 */
export async function fetchGroupedActions(): Promise<Record<string, ActionDefinition[]>> {
    try {
        // Fetch capabilities and categories map in parallel so we can resolve IDs → names/icons
        const [result, capList, catList] = await Promise.all([
            apiClient.get<any>(API_ENDPOINTS.ACTIONS.GROUPED),
            fetchCapabilities().catch(() => []),
            fetchCategories().catch(() => []),
        ]);

        const capMap: Record<number, { name: string; icon: string }> = Object.fromEntries(
            capList.map((c: any) => [c.capabilityId ?? c.capability_id, { name: c.name || '', icon: c.icon || '' }])
        );

        const catMap: Record<number, { name: string; icon: string }> = Object.fromEntries(
            catList.map((c: any) => [c.id || c.categoryId || c.category_id, { name: c.name || '', icon: c.icon || '' }])
        );

        // The backend wraps the response in { data: { "CategoryName": [...], ... } }
        const grouped: Record<string, any[]> = result.data || {};
        const mapped: Record<string, ActionDefinition[]> = {};

        for (const [categoryName, actions] of Object.entries(grouped)) {
            mapped[categoryName] = (actions as any[]).map((a: any) => {
                const capId = a.capabilityId || a.capability_id;
                const catId = a.categoryId || a.category_id;
                
                return {
                    id: a.actionDefinitionId || a.action_definition_id || a.id,
                    action_key: a.actionKey || a.action_key || '',
                    name: a.name || '',
                    description: a.description || '',
                    category: categoryName,
                    category_id: catId,
                    category_icon: a.categoryIcon || a.category_icon || catMap[catId]?.icon || '',
                    capability: (capMap[capId]?.name || a.capability || 'api').toLowerCase(),
                    capability_id: capId,
                    capability_icon: a.capabilityIcon || a.capability_icon || capMap[capId]?.icon || '',
                    scope: a.scope || 'global',
                    icon: a.icon || a.icon_name || 'Package',
                    default_node_title: a.defaultNodeTitle || a.default_node_title || a.name || '',
                    status: a.status || 'published',
                    created_at: a.createdAt || a.created_at || '',
                    updated_at: a.updatedAt || a.updated_at || '',
                    configurations_json: a.configurationsJson || a.configurations_json || {},
                    actionVersionId: a.actionVersionId || a.action_version_id || '',
                } as ActionDefinition;
            });
        }

        return mapped;
    } catch (error) {
        console.error('fetchGroupedActions API error:', error);
        return {};
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

        // Fetch capabilities and categories map in parallel
        const [result, capList, catList] = await Promise.all([
            apiClient.get<{ items: ActionDefinition[]; total: number }>(url),
            fetchCapabilities().catch(() => []),
            fetchCategories().catch(() => []),
        ]);

        const capMap: Record<number, { name: string; icon: string }> = Object.fromEntries(
            capList.map((c: any) => [c.capabilityId ?? c.capability_id, { name: c.name || '', icon: c.icon || '' }])
        );

        const catMap: Record<number, { name: string; icon: string }> = Object.fromEntries(
            catList.map((c: any) => [c.id || c.categoryId || c.category_id, { name: c.name || '', icon: c.icon || '' }])
        );

        const items: ActionDefinition[] = (result.data.items || []).map((a: any) => {
            const capId = a.capabilityId || a.capability_id;
            const catId = a.categoryId || a.category_id;
            
            return {
                ...a,
                id: a.actionDefinitionId || a.action_definition_id || a.id,
                action_key: a.actionKey || a.action_key || '',
                category_id: catId,
                category: a.category || catMap[catId]?.name || 'Uncategorized',
                category_icon: a.categoryIcon || a.category_icon || catMap[catId]?.icon || '',
                capability_id: capId,
                capability: (capMap[capId]?.name || a.capability || 'api').toLowerCase() as ActionDefinition['capability'],
                capability_icon: a.capabilityIcon || a.capability_icon || capMap[capId]?.icon || '',
                icon: a.icon || a.icon_name || 'Package',
                updated_at: a.updatedAt || a.updated_at || '',
                created_at: a.createdAt || a.created_at || '',
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
        const items = result.data.items || [];
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
        const items = result.data.items || [];
        const counts: Record<string, number> = { all: items.length, published: 0, draft: 0 };
        for (const a of items) {
            const st = (a as unknown as Record<string, unknown>).versionStatus as string || a.status || 'draft';
            counts[st] = (counts[st] ?? 0) + 1;
        }
        return counts;
    } catch {
        return { all: 0, published: 0, draft: 0 };
    }
}

/**
 * Retrieves aggregate counts of actions broken down by their Capability (api, ai, rpa, etc.).
 * Useful for the Capability dropdown in the Action Catalog.
 * @returns A promise resolving to a record mapping capability strings to counts.
 */
export async function fetchActionCapabilityCounts(): Promise<Record<string, number>> {
    try {
        const result = await apiClient.get<{ items: ActionDefinition[]; total: number }>(API_ENDPOINTS.ACTIONS.BASE);
        const items = result.data.items || [];
        const counts: Record<string, number> = {};
        for (const a of items) {
            const cap = (a.capability || 'api').toLowerCase();
            counts[cap] = (counts[cap] ?? 0) + 1;
        }
        return counts;
    } catch {
        return {};
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
    _clientId = 'c_demo',
    environment = 'dev',
    filters?: { capability?: string; category?: string; search?: string }
) {
    const params = new URLSearchParams();
    // params.set('client_id', clientId);
    params.set('client_id', 'null');
    params.set('environment', environment);
    if (filters?.capability) params.set('capability', filters.capability.toUpperCase());
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('q', filters.search);

    const queryString = params.toString();
    return apiClient.get<{ items: unknown[]; total: number }>(`${API_ENDPOINTS.ACTIONS.DESIGNER}?${queryString}`).then(res => res.data);
}

/**
 * Fetches a single action definition with all its versions from the backend.
 * The active version's JSON blobs are merged onto the top-level ActionDefinition.
 * @param id The action_definition_id.
 */
export async function fetchActionById(id: string): Promise<ApiResponse<ActionDefinition>> {
    try {
        const result = await apiClient.get<any>(API_ENDPOINTS.ACTIONS.BY_ID(id));
        const data = result.data;

        const action: ActionDefinition = {
            id: data.actionDefinitionId || data.action_definition_id || data.id || id,
            action_key: data.actionKey || data.action_key || '',
            name: data.name || '',
            description: data.description || '',
            category: data.category || 'Uncategorized',
            category_id: data.categoryId || data.category_id,
            capability: data.capability || 'api',
            capability_id: data.capabilityId || data.capability_id,
            scope: data.scope || 'global',
            icon: data.icon || 'Package',
            default_node_title: data.defaultNodeTitle || data.default_node_title || data.name || '',
            status: data.status || 'draft',
            created_at: data.createdAt || data.created_at || '',
            updated_at: data.updatedAt || data.updated_at || '',
            configurations_json: data.configurationsJson || data.configurations_json || {},
            execution_json: data.executionJson || data.execution_json,
            inputs_schema_json: data.inputsSchemaJson || data.inputs_schema_json,
            outputs_schema_json: data.outputsSchemaJson || data.outputs_schema_json,
        };

        // Attach backend version IDs
        (action as any).action_version_id = data.action_version_id || data.actionVersionId || '';

        return { success: true, data: action };
    } catch (error) {
        console.error('fetchActionById API error:', error);
        // Fallback to cache
        const cached = cachedActions ?? [];
        const action = cached.find((a) => a.id === id);
        if (action) return { success: true, data: action };
        return { success: false, error: error instanceof Error ? error.message : 'Action not found.' };
    }
}

/**
 * Updates an existing action definition via PUT /api/actions/{id}
 * Used by CreateActionModal when editing existing actions.
 */
export async function updateActionDefinition(
    actionDefinitionId: string,
    payload: Partial<ActionDefinition>
): Promise<ApiResponse<ActionDefinition>> {
    try {
        // Sanitize payload: remove unused and replace null with {}
        const sanitized: any = { ...payload };
        delete sanitized.execution_json;
        delete sanitized.executionJson;
        delete sanitized.ui_form_json;
        delete sanitized.uiFormJson;
        delete sanitized.policy_json;
        delete sanitized.policyJson;
        delete sanitized.inputs_schema_json;
        delete sanitized.inputsSchemaJson;
        delete sanitized.outputs_schema_json;
        delete sanitized.outputsSchemaJson;

        if (sanitized.configurations_json === null || sanitized.configurations_json === undefined) {
             sanitized.configurations_json = sanitized.configurationsJson || {};
        }

        const result = await apiClient.patch<ActionDefinition>(API_ENDPOINTS.ACTIONS.UPDATE(actionDefinitionId), sanitized);
        return { success: true, data: result.data, message: result.message };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update action definition' };
    }
}

/**
 * Permanently deletes an action definition from the system.
 * @param id The actionDefinitionId to delete.
 */
export async function deleteAction(id: string): Promise<ApiResponse<void>> {
    try {
        await apiClient.delete(API_ENDPOINTS.ACTIONS.DELETE(id));
        return { success: true, message: 'Action deleted successfully' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete action' };
    }
}
