import { useCapabilities, useCategories } from '@/hooks';

/**
 * AppInitializer
 * Mounts at the root of the app to silently pre-fetch and cache 
 * global dictionaries (Capabilities and Categories) into React Query.
 * This guarantees instantaneous map lookups within nested hooks 
 * without race conditions.
 */
export default function AppInitializer({ children }: { children: React.ReactNode }) {
    // These hooks will trigger the background React Query fetch immediately on app load.
    // By the time the user reaches the canvas, the cache is already fully primed.
    useCapabilities();
    useCategories();

    return <>{children}</>;
}
