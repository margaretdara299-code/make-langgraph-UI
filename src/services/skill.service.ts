import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import { fetchCategories } from './category.service';
import type { Skill, PaginatedResponse, ApiResponse, UseSkillsFilters, CreateSkillFormData } from '@/interfaces';

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

        const result = await apiClient.get<{ items: any[]; total: number }>(url);
        const rawItems: any[] = result.data.items || [];
        const items: Skill[] = rawItems.map((item) => ({
            ...item,
            latestVersionId: item.latestVersionId ?? item.latest_version_id,
            skillKey: item.skillKey ?? item.skill_key,
            updatedAt: item.updatedAt ?? item.updated_at,
            createdAt: item.createdAt ?? item.created_at,
            categoryId: item.categoryId ?? item.category_id,
        }));
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

        const totalFromApi = result.data.total ?? filtered.length;

        return {
            data: filtered.slice(start, start + pageSize),
            total: totalFromApi,
            page,
            pageSize,
            totalPages: Math.ceil(totalFromApi / pageSize),
        };
    } catch (error) {
        console.error('fetchSkills API error:', error);
        return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    }
}

/**
 * Fetches skills grouped by category for the Skill Designer Node Library.
 * This mirrors the designer action palette shape so accordions can render both
 * from the same loop.
 */
export async function fetchGroupedSkillsForDesigner(): Promise<Record<string, Skill[]>> {
    try {
        const params = new URLSearchParams();
        params.set('page_size', '200');

        const [result, categoryList] = await Promise.all([
            apiClient.get<any>(`${API_ENDPOINTS.SKILLS.BASE}?${params.toString()}`),
            fetchCategories().catch(() => []),
        ]);

        const payload = result.data;
        const rawItems: any[] = Array.isArray(payload)
            ? payload
            : payload?.items || payload?.data || [];
        const items: Skill[] = rawItems.map((item: any) => ({
            ...item,
            latestVersionId: item.latestVersionId ?? item.latest_version_id ?? item.versionId ?? item.version_id,
        }));

        localSkills = items;

        const categoryMap: Record<number, string> = Object.fromEntries(
            categoryList.map((category: any) => [
                category.categoryId ?? category.id ?? category.category_id,
                category.name || '',
            ])
        );

        const grouped = items.reduce<Record<string, Skill[]>>((groups, skill) => {
            const categoryId = (skill as any).categoryId ?? (skill as any).category_id;
            const categoryName = skill.category || categoryMap[categoryId] || 'General';
            const normalizedSkill = {
                ...skill,
                categoryId,
                category: categoryName,
            };

            groups[categoryName] ??= [];
            groups[categoryName].push(normalizedSkill);
            return groups;
        }, {});

        for (const skills of Object.values(grouped)) {
            skills.sort((left, right) => left.name.localeCompare(right.name));
        }

        return grouped;
    } catch (error) {
        console.error('fetchGroupedSkillsForDesigner API error:', error);
        return {};
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
            category_id: input.categoryId || null,
            tags: input.tags || [],
            ownerUserId: input.owner || 'system',
        };

        const result = await apiClient.post<{ skill: Skill; skillVersion: unknown; designerUrl: string }>(
            API_ENDPOINTS.SKILLS.BASE,
            payload
        );

        const newSkill: Skill = {
            id: result.data.skill?.id || '',
            name: input.name,
            version: result.data.skill?.version || '1.0.0',
            skillKey: result.data.skill?.skillKey || input.skillKey || '',
            description: input.description || '',
            categoryId: input.categoryId || 1,
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

        return { success: true, data: newSkill, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to create skill';
        if (error.response?.status === 409) msg = 'Skill already exists';
        else if (error.response?.status === 400) msg = 'Validation error: ' + msg;
        else if (error.response?.status === 404) msg = 'Not found';
        return { success: false, error: msg };
    }
}

/**
 * Retrieves aggregate counts of skills broken down by their status (draft, published, etc.).
 * @returns A promise resolving to a record mapping status strings to their numerical counts.
 */
export async function fetchSkillStatusCounts(): Promise<Record<string, number>> {
    try {
        const result = await apiClient.get<{ items: Skill[]; total: number }>(API_ENDPOINTS.SKILLS.BASE);
        const items = result.data.items || [];
        const counts: Record<string, number> = { all: items.length, published: 0, draft: 0 };
        for (const s of items) {
            const st = s.status || 'draft';
            counts[st] = (counts[st] ?? 0) + 1;
        }
        return counts;
    } catch {
        return { all: 0, published: 0, draft: 0 };
    }
}

// ── Mock Fallbacks ──

/**
 * MOCK: Retrieves a single skill by its ID from the local cache.
 * @param id The unique identifier of the skill to retrieve.
 */
export async function fetchSkillById(id: string): Promise<ApiResponse<Skill>> {
    const cached = localSkills ?? [];
    const skill = cached.find((skill) => skill.id === id);
    if (skill) return { success: true, data: skill };

    try {
        const result = await apiClient.get<Skill>(API_ENDPOINTS.SKILLS.BY_ID(id));
        return { success: true, data: result.data, message: result.message };
    } catch (error: any) {
        console.error('fetchSkillById API error:', error);
        let msg = error.message || 'Skill not found.';
        if (error.response?.status === 404) msg = 'Skill not found';
        return { success: false, error: msg };
    }
}

/**
 * Deletes a skill permanently from the backend by its ID.
 * @param id The unique identifier of the skill to delete.
 */
export async function deleteSkill(id: string): Promise<ApiResponse<null>> {
    try {
        const result = await apiClient.delete(API_ENDPOINTS.SKILLS.BY_ID(id));

        // Optimistically remove from local cache if it exists
        if (localSkills) {
            const index = localSkills.findIndex((skill) => skill.id === id);
            if (index !== -1) localSkills.splice(index, 1);
        }

        return { success: true, data: null, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to delete skill.';
        if (error.response?.status === 409) msg = 'Conflict: ' + msg;
        else if (error.response?.status === 404) msg = 'Skill not found';
        return { success: false, error: msg };
    }
}

/**
 * Updates an existing skill's basic metadata via PATCH.
 */
export async function updateSkill(
    skillId: string,
    input: Partial<CreateSkillFormData>
): Promise<ApiResponse<Skill>> {
    try {
        const payload = {
            name: input.name,
            skill_key: input.skillKey,
            description: input.description,
            category_id: input.categoryId,
            tags: input.tags,
        };

        const result = await apiClient.patch<{ id: string }>(
            API_ENDPOINTS.SKILLS.UPDATE(skillId),
            payload
        );

        let updatedSkill: Skill | undefined;

        if (localSkills) {
            const index = localSkills.findIndex((skill) => skill.id === skillId);
            if (index !== -1) {
                const current = localSkills[index];
                const updates = {
                    name: payload.name ?? current.name,
                    skillKey: payload.skill_key ?? current.skillKey,
                    description: payload.description ?? current.description,
                    categoryId: payload.category_id ?? current.categoryId,
                    tags: payload.tags ?? current.tags,
                };
                localSkills[index] = { ...current, ...updates };
                updatedSkill = localSkills[index];
            }
        }

        return { success: true, data: updatedSkill as Skill, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to update skill.';
        if (error.response?.status === 409) msg = 'Conflict: ' + msg;
        else if (error.response?.status === 400) msg = 'Validation error: ' + msg;
        else if (error.response?.status === 404) msg = 'Skill not found';
        return { success: false, error: msg };
    }
}

/**
 * MOCK: Updates the lifecycle status of a specific skill (e.g., draft -> published).
 * @param id The unique identifier of the skill to update.
 * @param status The target lifecycle status.
 */
export async function updateSkillStatus(id: string, status: 'draft' | 'published'): Promise<ApiResponse<Skill>> {
    if (localSkills) {
        const skill = localSkills.find((skill) => skill.id === id);
        if (!skill) return { success: false, error: 'Skill not found.' };
        skill.status = status;
        skill.updatedAt = new Date().toISOString();
        return { success: true, data: skill };
    }
    return { success: false, error: 'Skill not found.' };
}

/** Possible statuses for a skill version (matches backend enum) */
export const SkillVersionStatusValue = {
    PUBLISHED: 'published',
    UNPUBLISHED: 'unpublished',
    DRAFT: 'draft',
} as const;

export type SkillVersionStatusValue = (typeof SkillVersionStatusValue)[keyof typeof SkillVersionStatusValue];

/**
 * Updates a skill version's status via PUT /api/skills/versions/{versionId}/status
 * @param versionId The specific version ID to update.
 * @param status The target status: 'published' | 'unpublished' | 'draft'
 */
export async function updateSkillVersionStatus(
    versionId: string,
    status: SkillVersionStatusValue
): Promise<ApiResponse<null>> {
    try {
        const result = await apiClient.put(
            API_ENDPOINTS.SKILLS.VERSION_STATUS(versionId),
            { status }
        );

        // Optimistically update the local cache
        if (localSkills) {
            const mappedStatus = status === 'published' ? 'published' : 'draft';
            const skill = localSkills.find((skill) => skill.latestVersionId === versionId);
            if (skill) {
                skill.status = mappedStatus;
                skill.updatedAt = new Date().toISOString();
            }
        }

        return { success: true, data: null, message: result.message };
    } catch (error: any) {
        let msg = error instanceof Error ? error.message : 'Failed to update version status.';
        if (error.response?.status === 404) msg = 'Version not found';
        else if (error.response?.status === 400) msg = 'Validation error: ' + msg;
        return { success: false, error: msg };
    }
}
