/**
 * Canvas-related interfaces for the Skill Designer.
 */

import type { ActionCapability } from './action.interface';

/** Data payload attached to each canvas node */
export interface CanvasNodeData {
    label: string;
    actionId: string;
    actionKey: string;
    category: string;
    capability: ActionCapability;
    icon: string;
}

/** Props for a single draggable item in the Node Palette */
export interface NodePaletteItemProps {
    action: import('./action.interface').ActionDefinition;
}

/** Props for the Node Palette panel */
export interface NodePaletteProps {
    className?: string;
}
