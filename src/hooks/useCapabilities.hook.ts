import { useQuery } from '@tanstack/react-query';
import { fetchCapabilities } from '@/services';

export function useCapabilities() {
    const {
        data: capabilities = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['capabilities'],
        queryFn: fetchCapabilities,
    });

    return {
        capabilities,
        isLoading,
        refetch,
    };
}

