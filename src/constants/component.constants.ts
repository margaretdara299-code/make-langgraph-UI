/**
 * Constants for reusable UI components.
 */

export const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    draft: { color: 'warning', label: 'Draft' },
    published: { color: 'success', label: 'Published' },
    archived: { color: 'default', label: 'Archived' },
    active: { color: 'success', label: 'Active' },
    deprecated: { color: 'error', label: 'Deprecated' },
    default: { color: 'default', label: 'Unknown' },
};

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

/** Action Catalog Capability Filter Options */
export const CAPABILITY_OPTIONS = [
    { value: 'all', label: 'All Capabilities' },
    { value: 'api', label: 'API Connectors' },
    { value: 'ai', label: 'AI Models' },
    { value: 'rpa', label: 'RPA Bots' },
    { value: 'human', label: 'Human Tasks' },
    { value: 'rules', label: 'Rules Engines' },
];

/** Human-readable labels for individual action capabilities */
export const CAPABILITY_LABELS: Record<string, string> = {
    api: 'API Connector',
    ai: 'AI Model',
    rpa: 'RPA Bot',
    human: 'Human Task',
    rules: 'Rules Engine',
};

/** Create Action Wizard Steps (Steps 2-8 for Preview Panel) */
export const CREATE_ACTION_STEPS = [
    'Define Inputs',
    'Configure Execution',
    'Define Outputs',
    'Configure Settings',
    'Configure UI Form',
    'Set Policy & Security',
    'Review & Publish',
];

/** Options for dynamic runtime action configuration fields */
export const ACTION_CONFIG_INPUT_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean (Toggle)' },
    { value: 'select', label: 'Select (Dropdown)' },
    { value: 'textarea', label: 'Text Area' },
] as const;
