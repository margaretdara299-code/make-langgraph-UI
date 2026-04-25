/**
 * Helper to generate consistent, visually appealing colors based on a string.
 * Used to ensure categories, capabilities, or tags have consistent randomized colors.
 */

// Cool & Tech tones for Capabilities
const CAPABILITY_PALETTE = [
    '#3b82f6', // Info Blue
    '#8b5cf6', // Indigo
    '#14b8a6', // Teal
    '#A8DADC', // Light Cyan
    '#B39CD0', // Lavender
    '#6366f1', // Indigo
];

// Warm & Organizational tones for Categories
const CATEGORY_PALETTE = [
    '#f59e0b', // Warning Orange
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#10b981', // Success Green
    '#84cc16', // Lime
    '#FFC1CC', // Soft Pink
];

const generateHashBasedColor = (str: string | undefined, palette: string[]): string => {
    if (!str) return 'currentColor';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % palette.length;
    return palette[index];
};

export const getCapabilityColor = (str?: string): string => generateHashBasedColor(str, CAPABILITY_PALETTE);
export const getCategoryColor = (str?: string): string => generateHashBasedColor(str, CATEGORY_PALETTE);
