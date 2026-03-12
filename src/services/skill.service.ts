import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { Skill, PaginatedResponse, ApiResponse, UseSkillsFilters } from '@/interfaces';

// Cache for mock fallback functions
let localSkills: Skill[] | null = null;

/**
 * Fetches a paginated list of skills from the backend, applying optional filters.
 * @param filters Optional filtering criteria (clientId, status, search, category, etc.)
 * @returns A promise resolving to a paginated response containing the filtered Skills.
 */
export async function fetchSkills(
    filters?: UseSkillsFilters
): Promise<PaginatedResponse<Skill>> {
    try {
        const params = new URLSearchParams();
        if (filters?.clientId) params.set('client_id', filters.clientId);
        if (filters?.status) params.set('status', filters.status);
        if (filters?.search) params.set('search', filters.search);

        const queryString = params.toString();
        const url = `${API_ENDPOINTS.SKILLS.BASE}${queryString ? `?${queryString}` : ''}`;

        const result = await apiClient.get<{ items: Skill[]; total: number }>(url);
        const items = result.items || [];
        localSkills = items;

        const page = filters?.page ?? 1;
        const pageSize = filters?.pageSize ?? 12;
        const start = (page - 1) * pageSize;

        let filtered = items;
        if (filters?.category) {
            filtered = filtered.filter((s) => s.category === filters.category);
        }

        filtered.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return {
            data: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
            totalPages: Math.ceil(filtered.length / pageSize),
        };
    } catch (error) {
        console.error('fetchSkills API error:', error);
        return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    }
}

/**
 * Creates a brand new skill in the system (defaults to 'draft' status).
 * @param input The partial skill details needed for creation (name, description, etc.)
 * @returns A promise resolving to the standard ApiResponse containing the newly minted Skill.
 */
export async function createSkill(
    input: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Skill>> {
    try {
        const payload = {
            clientId: input.clientId || 'c_demo',
            payerId: input.payerId || null,
            environment: input.environment || 'dev',
            name: input.name,
            skillKey: input.skillKey || null,
            description: input.description || '',
            category: input.category || 'General',
            tags: input.tags || [],
            ownerUserId: input.owner || 'system',
        };

        const result = await apiClient.post<{ skill: Skill; skillVersion: unknown; designerUrl: string }>(
            API_ENDPOINTS.SKILLS.BASE,
            payload
        );

        const newSkill: Skill = {
            id: result.skill?.id || '',
            name: input.name,
            skillKey: result.skill?.skillKey || input.skillKey || '',
            description: input.description || '',
            category: input.category || 'General',
            clientId: input.clientId || 'c_demo',
            owner: input.owner || 'system',
            tags: input.tags || [],
            status: 'draft',
            environment: input.environment || 'dev',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: 'system',
        };

        return { success: true, data: newSkill };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create skill' };
    }
}

/**
 * Retrieves aggregate counts of skills broken down by their status (draft, published, etc.).
 * @returns A promise resolving to a record mapping status strings to their numerical counts.
 */
export async function fetchSkillStatusCounts(): Promise<Record<string, number>> {
    try {
        const result = await apiClient.get<{ items: Skill[]; total: number }>(API_ENDPOINTS.SKILLS.BASE);
        const items = result.items || [];
        const counts: Record<string, number> = { all: items.length, published: 0, draft: 0, archived: 0 };
        for (const s of items) {
            const st = s.status || 'draft';
            counts[st] = (counts[st] ?? 0) + 1;
        }
        return counts;
    } catch {
        return { all: 0, published: 0, draft: 0, archived: 0 };
    }
}

// ── Mock Fallbacks ──

/**
 * MOCK: Retrieves a single skill by its ID from the local cache.
 * @param id The unique identifier of the skill to retrieve.
 */
export async function fetchSkillById(id: string): Promise<ApiResponse<Skill>> {
    const cached = localSkills ?? [];
    const skill = cached.find((s) => s.id === id);
    if (!skill) return { success: false, error: 'Skill not found.' };
    return { success: true, data: skill };
}

/**
 * MOCK: Deletes a skill from the local memory cache by its ID.
 * @param id The unique identifier of the skill to delete.
 */
export async function deleteSkill(id: string): Promise<ApiResponse<null>> {
    if (localSkills) {
        const index = localSkills.findIndex((s) => s.id === id);
        if (index === -1) return { success: false, error: 'Skill not found.' };
        localSkills.splice(index, 1);
    }
    return { success: true, data: null };
}

/**
 * MOCK: Updates the lifecycle status of a specific skill (e.g., draft -> published).
 * @param id The unique identifier of the skill to update.
 * @param status The target lifecycle status.
 */
export async function updateSkillStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<Skill>> {
    if (localSkills) {
        const skill = localSkills.find((s) => s.id === id);
        if (!skill) return { success: false, error: 'Skill not found.' };
        skill.status = status;
        skill.updatedAt = new Date().toISOString();
        return { success: true, data: skill };
    }
    return { success: false, error: 'Skill not found.' };
}
