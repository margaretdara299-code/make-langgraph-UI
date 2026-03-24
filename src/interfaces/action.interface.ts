/**
 * Action Catalog interfaces.
 * Defines ActionDefinition, ActionVersion, and related schema types.
 */

export type ActionCapability = 'api' | 'ai' | 'rpa' | 'human' | 'rules' | string;
export type ActionScope = 'global' | 'client';
export type ActionVersionStatus = 'draft' | 'published';

export interface ActionDefinition {
    id: string;
    actionKey: string;
    name: string;
    description: string;
    category: string;
    categoryId?: number;
    capability: ActionCapability;
    capabilityId?: number;
    scope: ActionScope;
    icon?: string;
    defaultNodeTitle: string;
    status: ActionVersionStatus;
    createdAt: string;
    updatedAt: string;

    // ── Version-level Configuration Blob ──
    configurationsJson?: Record<string, any>;
    inputsSchemaJson?: any;
    executionJson?: any;
    outputsSchemaJson?: any;
    uiFormJson?: any;
    policyJson?: any;
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
