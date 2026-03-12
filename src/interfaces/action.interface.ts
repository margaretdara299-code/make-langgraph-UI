/**
 * Action Catalog interfaces.
 * Defines ActionDefinition, ActionVersion, and related schema types.
 */

export type ActionCapability = 'api' | 'ai' | 'rpa' | 'human' | 'rules';
export type ActionScope = 'global' | 'client';
export type ActionVersionStatus = 'draft' | 'published' | 'archived';

export interface ActionDefinition {
    id: string;
    actionKey: string;
    name: string;
    description: string;
    category: string;
    capability: ActionCapability;
    scope: ActionScope;
    icon?: string;
    defaultNodeTitle: string;
    status: ActionVersionStatus;
    createdAt: string;
    updatedAt: string;

    // ── Version-level JSON blobs (populated by wizard steps 2–6) ──
    inputsSchemaJson?: ActionInputField[];
    executionJson?: ActionExecutionConfig;
    outputsSchemaJson?: ActionOutputField[];
    uiFormJson?: ActionUiFormConfig;
    policyJson?: ActionPolicyConfig;
}

export interface ActionVersion {
    id: string;
    actionDefinitionId: string;
    version: string;
    status: ActionVersionStatus;
    inputsSchemaJson: Record<string, unknown>;
    executionJson: Record<string, unknown>;
    outputsSchemaJson: Record<string, unknown>;
    uiFormJson: Record<string, unknown>;
    policyJson: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// ── Wizard step sub-types ──────────────────────────────────────────

export type ActionFieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface ActionInputField {
    name: string;
    type: ActionFieldType;
    required: boolean;
    description: string;
}

export interface ActionOutputField {
    name: string;
    type: ActionFieldType;
    required: boolean;
    description: string;
}

export type ConnectorType = 'rest' | 'graphql' | 'grpc' | 'internal' | 'none';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ActionExecutionConfig {
    connectorType: ConnectorType;
    endpointUrl: string;
    httpMethod: HttpMethod;
    timeoutMs: number;
    retryCount: number;
    retryDelayMs: number;
}

export interface ActionUiFormConfig {
    displayMode: 'auto' | 'custom';
    groupLabel: string;
    helpText: string;
    showAdvanced: boolean;
}

export interface ActionPolicyConfig {
    containsPhi: boolean;
    containsPii: boolean;
    requiresAuditLogging: boolean;
    dataRetentionDays: number;
    allowedEnvironments: string[];
    notes: string;
}

export interface ActionFilters {
    category?: string;
    capability?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
