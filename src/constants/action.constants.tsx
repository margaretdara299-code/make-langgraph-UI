import {
    BulbOutlined,
    EditOutlined
} from '@ant-design/icons';
import type { ActionFieldType, ConnectorType, HttpMethod } from '@/interfaces';

export const FIELD_TYPE_OPTIONS: { label: string; value: ActionFieldType }[] = [
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Object', value: 'object' },
    { label: 'Array', value: 'array' },
];

export const CONNECTOR_OPTIONS: { label: string; value: ConnectorType }[] = [
    { label: 'REST API', value: 'rest' },
    { label: 'GraphQL', value: 'graphql' },
    { label: 'gRPC', value: 'grpc' },
    { label: 'Internal Function', value: 'internal' },
    { label: 'None (Manual)', value: 'none' },
];

export const HTTP_METHOD_OPTIONS: { label: string; value: HttpMethod }[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' },
];

export const ACTION_HTTP_METHODS = [
    { value: 'GET', label: <span className="action-method-label">GET</span> },
    { value: 'POST', label: <span className="action-method-label">POST</span> },
    { value: 'PUT', label: <span className="action-method-label">PUT</span> },
    { value: 'PATCH', label: <span className="action-method-label">PATCH</span> },
    { value: 'DELETE', label: <span className="action-method-label">DELETE</span> },
];

export const ENVIRONMENT_OPTIONS = [
    { label: 'Development', value: 'dev' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'prod' },
];

export const DEFAU̥LT_EXECUTION_CONFIG: import('@/interfaces').ActionExecutionConfig = {
    connectorType: 'rest',
    endpointUrl: '',
    httpMethod: 'POST',
    timeoutMs: 30000,
    retryCount: 0,
    retryDelayMs: 1000,
};

export const DEFAULT_̥UI̥_FORM_CONFIG: import('@/interfaces').ActionUiFormConfig = {
    displayMode: 'auto',
    groupLabel: '',
    helpText: '',
    showAdvanced: false,
};

export const DEFAULT_POLICY_CONFIG: import('@/interfaces').ActionPolicyConfig = {
    containsPhi: false,
    containsPii: false,
    requiresAuditLogging: false,
    dataRetentionDays: 90,
    allowedEnvironments: ['dev', 'staging', 'prod'],
    notes: '',
};

export const ACTION_STATUS_FILTER_OPTIONS = [
    { key: 'all', label: 'All Actions', icon: BulbOutlined },
    { key: 'draft', label: 'Draft', icon: EditOutlined },
] as const;

/** Icon map for Action statuses */
export const ACTION_STATUS_ICONS = {
    all: BulbOutlined,
    draft: EditOutlined,
};
