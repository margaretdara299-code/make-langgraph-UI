/**
 * ThreeBackground
 * Renders a full-page Three.js particle sphere as the login page background.
 * Completely decorative — hidden from the accessibility tree.
 */

import { useRef, useEffect } from 'react';
import { useThreeScene } from '@/hooks/useThreeScene';

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { init } = useThreeScene();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cleanup = init(container);
        return cleanup;
    }, [init]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="three-bg-fixed"
        />
    );
}
