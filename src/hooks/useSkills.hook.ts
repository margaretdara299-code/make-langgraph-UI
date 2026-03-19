/**
 * Custom hook for fetching and managing skills list.
 * Encapsulates all data fetching logic, filtering, pagination, and status counts.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Skill, PaginatedResponse, UseSkillsFilters, UseSkillsReturn } from '@/interfaces';
import { fetchSkills, fetchSkillStatusCounts } from '@/services';

export function useSkills(initialFilters?: UseSkillsFilters): UseSkillsReturn & { statusCounts: Record<string, number> } {
    const [filters, setFilters] = useState<UseSkillsFilters>(initialFilters ?? {});
    const [data, setData] = useState<PaginatedResponse<Skill>>({
        data: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 0,
    });
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
        all: 0,
        draft: 0,
        published: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSkills = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [result, counts] = await Promise.all([
                fetchSkills(filters),
                fetchSkillStatusCounts(),
            ]);
            setData(result);
            setStatusCounts(counts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load skills.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadSkills();
    }, [loadSkills]);

    return {
        skills: data.data,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading,
        error,
        refetch: loadSkills,
        setFilters,
        statusCounts,
    };
}
