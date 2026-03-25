/**
 * Canvas-related interfaces for the Skill Designer.
 */

import type { Node } from '@xyflow/react';
import type { ActionCapability, ActionConfigField, ActionInputField, ActionOutputField, ActionExecutionConfig } from './action.interface';

/** Data payload attached to each canvas node */
export interface CanvasNodeData {
    label: string;
    actionId: string;
    actionKey: string;
    actionVersionId?: string;
    category: string;
    capability: ActionCapability;
    icon: string;
    inputsSchemaJson?: ActionInputField[];
    outputsSchemaJson?: ActionOutputField[];
    executionJson?: ActionExecutionConfig;
    configurationsJson?: Record<string, any> | ActionConfigField[];
    color?: string;
    description?: string;
    // Index signature to satisfy React Flow's Record<string, unknown> constraint
    [key: string]: any;
}

/** Specific React Flow node type using our data interface */
export type CanvasNode = Node<CanvasNodeData>;

/** Data payload attached to each canvas edge */
export interface CanvasEdgeData {
    routeType: 'unconditional' | 'conditional' | 'fallback';
    conditionLabel?: string;
}

/** Data payload for sub-flow grouping nodes */
export interface SubFlowNodeData {
    label: string;
    description?: string;
    color?: string;
}

/** Props for a single draggable item in the Node Palette */
export interface NodePaletteItemProps {
    action: import('./action.interface').ActionDefinition;
}

/** Props for the Node Palette panel */
export interface NodePaletteProps {
    className?: string;
}
