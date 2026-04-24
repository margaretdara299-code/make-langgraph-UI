import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating `value` until `delay` ms have passed
 * since the last change. Useful for search inputs to avoid filtering
 * on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
