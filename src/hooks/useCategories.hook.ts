import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services';

export function useCategories() {
    const {
        data: categories = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const result = await fetchCategories();
            return Array.isArray(result) ? result : [];
        },
    });

    return { categories, isLoading, refetch };
}

