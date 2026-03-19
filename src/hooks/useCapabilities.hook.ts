import { useState, useEffect, useCallback } from 'react';
import { fetchCapabilities } from '@/services';
import type { Capability } from '@/interfaces';

export function useCapabilities() {
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadCapabilities = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchCapabilities();
            setCapabilities(data);
        } catch (error) {
            console.error('Error loading capabilities:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCapabilities();
    }, [loadCapabilities]);

    return {
        capabilities,
        isLoading,
        refetch: loadCapabilities,
    };
}
