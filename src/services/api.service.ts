/**
 * Mock Data Service — the abstraction layer that UI components consume.
 *
 * During the mock phase, this returns static JSON data.
 * During integration (Phase 6), this will be swapped to real API calls.
 * The component layer NEVER changes — only this file changes.
 */

import type { Skill, ActionDefinition, PaginatedResponse, UseSkillsFilters, ActionFilters } from '@/interfaces';

// ── Mock Data (will be replaced with fetch calls in Phase 6) ──

const MOCK_SKILLS: Skill[] = [];
const MOCK_ACTIONS: ActionDefinition[] = [];

// ── Public Service API ──

/** Fetch all skills with optional filters. */
export async function fetchSkills(filters?: UseSkillsFilters): Promise<PaginatedResponse<Skill>> {
    // Simulate network delay
    await delay(300);

    let filtered = [...MOCK_SKILLS];

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
            (s) => s.name.toLowerCase().includes(q) || s.skillKey.toLowerCase().includes(q)
        );
    }

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

/** Fetch all action definitions with optional filters. */
export async function fetchActions(filters?: ActionFilters): Promise<ActionDefinition[]> {
    await delay(200);

    let filtered = [...MOCK_ACTIONS];

    if (filters?.category) {
        filtered = filtered.filter((a) => a.category === filters.category);
    }
    if (filters?.capability) {
        filtered = filtered.filter((a) => a.capability === filters.capability);
    }
    if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
            (a) => a.name.toLowerCase().includes(q) || a.actionKey.toLowerCase().includes(q)
        );
    }

    return filtered;
}

// ── Helpers ──

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
