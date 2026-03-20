/**
 * Connector-related constants.
 */

import type { ConnectorTabConfig } from '@/interfaces';
import { CONNECTOR_TYPES } from '@/interfaces';

export const CONNECTOR_TAB_CONFIG: ConnectorTabConfig[] = [
    { key: 'api', label: 'API Connector', createLabel: 'Create API Connector', connectorType: CONNECTOR_TYPES.API },
    { key: 'db', label: 'DB Connector', createLabel: 'Create DB Connector', connectorType: CONNECTOR_TYPES.DATABASE },
];

/** Engine options for database connector form */
export const DB_ENGINE_OPTIONS = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'mssql', label: 'Microsoft SQL Server' },
    { value: 'oracle', label: 'Oracle' },
];

/** HTTP method options for API connector form */
export const API_METHOD_OPTIONS = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' },
];

/** Body mode options for API connector form */
export const API_BODY_MODE_OPTIONS = [
    { value: 'raw', label: 'Raw' },
    { value: 'none', label: 'None' },
];
