/**
 * Mock Data Service — the abstraction layer that UI components consume.
 *
 * During the mock phase, this returns static data from seed files.
 * During integration (Phase 6), this will be swapped to real API calls.
 * The component layer NEVER changes — only this file changes.
 */

import type {
    Skill,
    ActionDefinition,
    ConnectorInstance,
    PaginatedResponse,
    ApiResponse,
    UseSkillsFilters,
    ActionFilters,
} from '@/interfaces';
import { MOCK_SKILLS, MOCK_ACTIONS, MOCK_CONNECTORS } from './mock-data';

// ── Mutable local copies (simulate a database) ──

let skills: Skill[] = [...MOCK_SKILLS];
const actions: ActionDefinition[] = [...MOCK_ACTIONS];
const connectors: ConnectorInstance[] = [...MOCK_CONNECTORS];

// ══════════════════════════════════════════════════
//  SKILLS
// ══════════════════════════════════════════════════

/** Fetch skills with optional filters and pagination. */
export async function fetchSkills(
    filters?: UseSkillsFilters
): Promise<PaginatedResponse<Skill>> {
    await delay(300);

    let filtered = [...skills];

    if (filters?.status) {
        filtered = filtered.filter((s) => s.status === filters.status);
    }
    if (filters?.category) {
        filtered = filtered.filter((s) => s.category === filters.category);
    }
    if (filters?.clientId) {
        filtered = filtered.filter((s) => s.clientId === filters.clientId);
    }
    if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.skillKey.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q)
        );
    }

    // Sort by updatedAt descending (most recent first)
    filtered.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 12;
    const start = (page - 1) * pageSize;

    return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
    };
}

/** Fetch a single skill by ID. */
export async function fetchSkillById(
    id: string
): Promise<ApiResponse<Skill>> {
    await delay(150);
    const skill = skills.find((s) => s.id === id);
    if (!skill) {
        return { success: false, error: 'Skill not found.' };
    }
    return { success: true, data: skill };
}

/** Create a new skill (mock — adds to in-memory array). */
export async function createSkill(
    input: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Skill>> {
    await delay(400);
    const now = new Date().toISOString();
    const newSkill: Skill = {
        ...input,
        id: `sk-${String(skills.length + 1).padStart(3, '0')}`,
        createdAt: now,
        updatedAt: now,
    };
    skills = [newSkill, ...skills];
    return { success: true, data: newSkill };
}

/** Delete a skill by ID (mock). */
export async function deleteSkill(
    id: string
): Promise<ApiResponse<null>> {
    await delay(200);
    const index = skills.findIndex((s) => s.id === id);
    if (index === -1) {
        return { success: false, error: 'Skill not found.' };
    }
    skills.splice(index, 1);
    return { success: true, data: null };
}

/** Get counts of skills grouped by status. */
export async function fetchSkillStatusCounts(): Promise<
    Record<string, number>
> {
    await delay(100);
    const counts: Record<string, number> = {
        all: skills.length,
        published: 0,
        draft: 0,
        archived: 0,
    };
    for (const s of skills) {
        counts[s.status] = (counts[s.status] ?? 0) + 1;
    }
    return counts;
}

// ══════════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════════

/** Fetch action definitions with optional filters. */
export async function fetchActions(
    filters?: ActionFilters
): Promise<ActionDefinition[]> {
    await delay(200);

    let filtered = [...actions];

    if (filters?.category) {
        filtered = filtered.filter((a) => a.category === filters.category);
    }
    if (filters?.capability) {
        filtered = filtered.filter((a) => a.capability === filters.capability);
    }
    if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.actionKey.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q)
        );
    }

    return filtered;
}

/** Fetch a single action definition by ID. */
export async function fetchActionById(
    id: string
): Promise<ApiResponse<ActionDefinition>> {
    await delay(150);
    const action = actions.find((a) => a.id === id);
    if (!action) {
        return { success: false, error: 'Action not found.' };
    }
    return { success: true, data: action };
}

/** Get action counts grouped by category. */
export async function fetchActionCategoryCounts(): Promise<
    Record<string, number>
> {
    await delay(100);
    const counts: Record<string, number> = {};
    for (const a of actions) {
        counts[a.category] = (counts[a.category] ?? 0) + 1;
    }
    return counts;
}

// ══════════════════════════════════════════════════
//  CONNECTORS
// ══════════════════════════════════════════════════

/** Fetch connector instances, optionally filtered by client or environment. */
export async function fetchConnectors(filters?: {
    clientId?: string;
    environment?: string;
}): Promise<ConnectorInstance[]> {
    await delay(150);

    let filtered = [...connectors];

    if (filters?.clientId) {
        filtered = filtered.filter((c) => c.clientId === filters.clientId);
    }
    if (filters?.environment) {
        filtered = filtered.filter((c) => c.environment === filters.environment);
    }

    return filtered;
}

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
