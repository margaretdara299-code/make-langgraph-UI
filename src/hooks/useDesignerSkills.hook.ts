/**
 * useDesignerSkills — fetches skills grouped by category for the Skill Designer Node Library.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchGroupedSkillsForDesigner } from '@/services';

export default function useDesignerSkills() {
    const {
        data: skillsByCategory = {},
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['designerSkills'],
        queryFn: fetchGroupedSkillsForDesigner,
        staleTime: 0,
        refetchOnMount: true,
    });

    return {
        skillsByCategory,
        isLoading,
        refetch,
    };
}
