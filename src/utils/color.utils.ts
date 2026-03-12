/**
 * Generates a consistent, visually pleasing HSL color pair (background and bold text color) 
 * for any arbitrary string based on a simple hash algorithm.
 */

export function stringToColorParams(str: string): { bg: string; text: string } {
    if (!str) return { bg: '#f1f5f9', text: '#475569' }; // default slate

    // Simple string hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Map the hash to a hue (0 to 360)
    const hue = Math.abs(hash) % 360;

    // We want a light pastel for the background (high lightness, medium saturation)
    // and a deeply contrasting dark version of the same hue for the text.
    const bg = `hsl(${hue}, 70%, 94%)`;
    const text = `hsl(${hue}, 85%, 25%)`;

    return { bg, text };
}
