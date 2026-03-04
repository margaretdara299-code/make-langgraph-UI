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
    createdAt: string;
    updatedAt: string;
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

export interface ActionFilters {
    category?: string;
    capability?: string;
    search?: string;
}
