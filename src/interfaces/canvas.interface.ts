/**
 * Canvas-related interfaces for the Skill Designer.
 */

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
    configurationsJson?: ActionConfigField[];
}

/** Data payload attached to each canvas edge */
export interface CanvasEdgeData {
    routeType: 'unconditional' | 'conditional' | 'fallback';
    conditionLabel?: string;
}

/** Props for a single draggable item in the Node Palette */
export interface NodePaletteItemProps {
    action: import('./action.interface').ActionDefinition;
}

/** Props for the Node Palette panel */
export interface NodePaletteProps {
    className?: string;
}
