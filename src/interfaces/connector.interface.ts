import type { FormInstance } from 'antd';

/** Connector type constants — used as discriminator for API vs Database connectors */
export const CONNECTOR_TYPES = {
    API: 'api',
    DATABASE: 'database',
} as const;

export type ConnectorTypeValue = typeof CONNECTOR_TYPES[keyof typeof CONNECTOR_TYPES];

export type ConnectorTab = 'api' | 'db';

export interface ConnectorTabConfig {
    key: ConnectorTab;
    label: string;
    createLabel: string;
    connectorType: ConnectorTypeValue;
}

/** ── Database Connector Config ── */

export interface DatabaseConfigJson {
    engine: string;
    host: string;
    port: number;
    user: string;
    database: string;
}

/** ── API Connector Config ── */

export interface KeyValuePair {
    key: string;
    value: string;
}

export interface ApiBodyConfig {
    mode: string;
    raw: string;
}

export interface ApiConfigJson {
    method: string;
    url: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    pathVariables: KeyValuePair[];
    body: ApiBodyConfig;
}

/** ── Create Connector Payload ── */

export interface CreateConnectorPayload {
    name: string;
    connectorType: ConnectorTypeValue;
    description: string;
    configJson: DatabaseConfigJson | ApiConfigJson;
}

/** ── Connector Response (from backend) ── */

export interface ConnectorResponse {
    connectorId: number;
    name: string;
    connectorType: string;
    description?: string;
    configJson: Record<string, any>;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/** ── Connector Card Props ── */

export interface ConnectorCardProps {
    connector: ConnectorResponse;
    onAction?: (actionKey: string, connectorId: number) => void;
}

export interface ApiConnectorFormProps {
    form: FormInstance;
}

export interface DatabaseConnectorFormProps {
    form: FormInstance;
}

/** ── Create Connector Modal Props ── */

export interface CreateConnectorModalProps {
    isOpen: boolean;
    connectorType: ConnectorTypeValue;
    connectorToEdit?: ConnectorResponse | null;
    onClose: () => void;
    onCreated: () => void;
}

