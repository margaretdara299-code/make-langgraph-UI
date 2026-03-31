/**
 * Action Catalog interfaces.
 * Defines ActionDefinition, ActionVersion, and related schema types.
 */

export type ActionCapability = 'api' | 'ai' | 'rpa' | 'human' | 'rules' | string;
export type ActionScope = 'global' | 'client';
export type ActionVersionStatus = 'draft' | 'published';

export interface ActionDefinition {
    id: string;
    action_key: string;
    name: string;
    description: string;
    category: string;
    category_id?: number;
    capability: ActionCapability;
    capability_id?: number;
    scope: ActionScope;
    icon?: string;
    default_node_title: string;
    status: ActionVersionStatus;
    created_at: string;
    updated_at: string;

    // ── Version-level Configuration Blob ──
    configurations_json?: Record<string, any>;
    inputs_schema_json?: any;
    execution_json?: any;
    outputs_schema_json?: any;
    ui_form_json?: any;
    policy_json?: any;
}

export interface ActionVersion {
    id: string;
    actionDefinitionId: string;
    version: string;
    status: ActionVersionStatus;
    configurationsJson: Record<string, any>;
    inputsSchemaJson?: any;
    executionJson?: any;
    outputsSchemaJson?: any;
    uiFormJson?: any;
    policyJson?: any;
    createdAt: string;
    updatedAt: string;
}

export interface ActionFilters {
    category?: string;
    capability?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

// ── Schema Type Interfaces ──

export interface ActionInputField {
    name: string;
    type: string;
    description?: string;
    required: boolean;
    defaultValue?: any;
}

export interface ActionOutputField {
    name: string;
    type: string;
    description?: string;
}

export interface ActionExecutionConfig {
    connectorType: 'rest' | 'graphql' | 'grpc' | 'internal' | 'none' | string;
    endpointUrl: string;
    httpMethod: string;
    timeoutMs: number;
    retryCount: number;
    retryDelayMs: number;
}

export interface ActionConfigField {
    inputKey: string;
    label: string;
    inputType: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | string;
    defaultValue?: any;
    options?: string[];
    description?: string;
}

