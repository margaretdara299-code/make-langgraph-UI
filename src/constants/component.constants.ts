/**
 * Constants for reusable UI components.
 */

export const STATUS_CONFIG = {
    draft: { color: 'warning', label: 'Draft' },
    published: { color: 'success', label: 'Published' },
    archived: { color: 'default', label: 'Archived' },
} as const;

export const BADGE_VARIANT_COLOR_MAP = {
    default: 'default',
    info: 'processing',
    success: 'success',
    warning: 'warning',
    danger: 'error',
} as const;

export const BUTTON_VARIANT_MAP = {
    primary: { type: 'primary' as const, danger: false },
    secondary: { type: 'default' as const, danger: false },
    outline: { type: 'default' as const, danger: false },
    danger: { type: 'primary' as const, danger: true },
    ghost: { type: 'text' as const, danger: false },
} as const;

export const MODAL_SIZE_MAP = {
    sm: 420,
    md: 560,
    lg: 720,
} as const;

