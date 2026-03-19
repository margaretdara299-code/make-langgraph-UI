/**
 * Connector-related constants.
 */

import type { ConnectorTabConfig } from '@/interfaces';

export const CONNECTOR_TAB_CONFIG: ConnectorTabConfig[] = [
    { key: 'api', label: 'API Connector', createLabel: 'Create API Connector' },
    { key: 'db', label: 'DB Connector', createLabel: 'Create DB Connector' },
];
