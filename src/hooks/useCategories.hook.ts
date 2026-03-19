import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/interfaces';
import { fetchCategories } from '@/services';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchCategories();
            const items = Array.isArray(result) ? result : [];
            setCategories(items);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    return { categories, isLoading, refetch: loadCategories };
}
