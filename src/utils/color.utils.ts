/**
 * color.utils.ts
 *
 * nodeColorFromId  → picks one of 12 curated pastel themes based on node ID
 * stringToColorParams → legacy HSL-based generator (kept for backwards compat)
 */

/** A curated set of 12 light pastel themes.
 *  Each has:
 *    bg         → card background (very light tint)
 *    border     → border / accent color (mid-saturation, NOT dark)
 *    accent     → header gradient + glow + icon color (same as border but slightly richer)
 *    text       → title text color (dark enough to be readable on the light bg)
 */
export const NODE_COLOR_PALETTE = [
    // 1 — soft blue
    { bg: '#eef4ff', border: '#6da4f0', accent: '#3b82f6', text: '#1e3a5f' },
    // 2 — mint green
    { bg: '#effdf4', border: '#5ecb8a', accent: '#22c55e', text: '#14532d' },
    // 3 — warm coral
    { bg: '#fff4f2', border: '#f28b7d', accent: '#ef4444', text: '#7f1d1d' },
    // 4 — soft violet
    { bg: '#f5f0ff', border: '#a78bfa', accent: '#7c3aed', text: '#3b0764' },
    // 5 — amber / golden
    { bg: '#fffbeb', border: '#fbbf24', accent: '#d97706', text: '#78350f' },
    // 6 — sky teal
    { bg: '#ecfdfd', border: '#22d3ee', accent: '#0891b2', text: '#164e63' },
    // 7 — rose pink
    { bg: '#fff0f6', border: '#f472b6', accent: '#db2777', text: '#831843' },
    // 8 — lime
    { bg: '#f7ffe5', border: '#a3e635', accent: '#65a30d', text: '#3f6212' },
    // 9 — indigo
    { bg: '#eef2ff', border: '#818cf8', accent: '#4f46e5', text: '#312e81' },
    // 10 — orange
    { bg: '#fff7ed', border: '#fb923c', accent: '#ea580c', text: '#7c2d12' },
    // 11 — slate blue
    { bg: '#f1f5f9', border: '#94a3b8', accent: '#475569', text: '#0f172a' },
    // 12 — emerald
    { bg: '#ecfdf5', border: '#34d399', accent: '#059669', text: '#064e3b' },
];

/**
 * Pick a stable color theme for a node based on its ID.
 * Same ID always returns the same theme.
 */
export function nodeColorFromId(nodeId: string): typeof NODE_COLOR_PALETTE[0] {
    if (!nodeId) return NODE_COLOR_PALETTE[0];
    // Simple hash of the id string
    let hash = 0;
    for (let i = 0; i < nodeId.length; i++) {
        hash = nodeId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % NODE_COLOR_PALETTE.length;
    return NODE_COLOR_PALETTE[idx];
}

/**
 * Legacy: generates a consistent HSL color pair from any string.
 * Kept for backwards compatibility.
 */
export function stringToColorParams(str: string): { bg: string; text: string } {
    if (!str) return { bg: '#f1f5f9', text: '#475569' };

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    const bg   = `hsl(${hue}, 70%, 94%)`;
    const text = `hsl(${hue}, 85%, 25%)`;

    return { bg, text };
}
