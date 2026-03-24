import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1, // Only retry once before failing
            refetchOnWindowFocus: false, // Don't refetch automatically on focus during dev
        },
    },
});
