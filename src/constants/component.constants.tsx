/**
 * Constants for reusable UI components.
 */

export const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    draft: { color: 'warning', label: 'Draft' },
    published: { color: 'success', label: 'Published' },
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

import {
    ApiOutlined,
    DeploymentUnitOutlined,
    RobotOutlined,
    UserOutlined,
    NodeIndexOutlined,
    BulbOutlined,
    FunctionOutlined,
    SyncOutlined,
    ToolOutlined,
    MessageOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';

/** Action Catalog Capability Filter Options */
export const CAPABILITY_OPTIONS = [
    { value: 'all', label: 'All Capabilities', icon: BulbOutlined },
    { value: 1, label: 'Condition', icon: NodeIndexOutlined },
    { value: 2, label: 'Human Input', icon: UserOutlined },
    { value: 3, label: 'Agent', icon: RobotOutlined },
    { value: 4, label: 'HTTP Request', icon: ApiOutlined },
    { value: 5, label: 'Custom Function', icon: FunctionOutlined },
    { value: 6, label: 'Loop', icon: SyncOutlined },
    { value: 7, label: 'Tool', icon: ToolOutlined },
    { value: 8, label: 'Direct Reply', icon: MessageOutlined },
    { value: 9, label: 'Database Operation', icon: DatabaseOutlined },
];

/** Human-readable labels for individual action capabilities */
export const CAPABILITY_LABELS: Record<string | number, string> = {
    1: 'Condition',
    2: 'Human Input',
    3: 'Agent',
    4: 'HTTP Request',
    5: 'Custom Function',
    6: 'Loop',
    7: 'Tool',
    8: 'Direct Reply',
    9: 'Database Operation',
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
