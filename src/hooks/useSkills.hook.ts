/**
 * Custom hook for fetching and managing skills list.
 * Encapsulates all data fetching logic, filtering, pagination, and status counts.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Skill, PaginatedResponse, UseSkillsFilters, UseSkillsReturn } from '@/interfaces';
import { fetchSkills, fetchSkillStatusCounts } from '@/services';

export function useSkills(initialFilters?: UseSkillsFilters): UseSkillsReturn & { statusCounts: Record<string, number> } {
    const [filters, setFilters] = useState<UseSkillsFilters>(initialFilters ?? {});

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['skills', filters],
        queryFn: async () => {
            const [result, counts] = await Promise.all([
                fetchSkills(filters),
                fetchSkillStatusCounts(),
            ]);
            return { result, counts };
        }
    });

    const fallbackData: PaginatedResponse<Skill> = { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
    const skillsData = data?.result || fallbackData;
    const statusCounts = data?.counts || { all: 0, draft: 0, published: 0 };

    return {
        skills: skillsData.data,
        total: skillsData.total,
        page: skillsData.page,
        totalPages: skillsData.totalPages,
        isLoading,
        error: error instanceof Error ? error.message : error ? String(error) : null,
        refetch,
        setFilters,
        statusCounts,
    };
}
