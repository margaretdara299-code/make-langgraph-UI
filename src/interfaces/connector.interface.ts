/**
 * Connector-related interfaces.
 */

export type ConnectorTab = 'api' | 'db';

export interface ConnectorTabConfig {
    key: ConnectorTab;
    label: string;
    createLabel: string;
}
