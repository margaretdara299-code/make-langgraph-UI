/**
 * NodePaletteItem — a single draggable action in the Node Palette.
 * Sets drag data so the canvas can read it on drop.
 */

import type { NodePaletteItemProps } from '@/interfaces';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { stringToColorParams } from '@/utils';
import { CAPABILITY_LABELS } from '@/constants';
import './NodePaletteItem.css';

export default function NodePaletteItem({ action }: NodePaletteItemProps) {
    const cap = (action.capability || 'default').toLowerCase();
    const isKnown = !!CAPABILITY_LABELS[cap];
    const dynamicTheme = isKnown ? null : stringToColorParams(cap);
    const itemColor = isKnown ? `var(--color-badge-text-${cap})` : dynamicTheme?.text;

    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            action_id: action.id,
            action_key: action.action_key,
            action_version_id: (action as any).action_version_id || (action as any).latestVersionId || '',
            label: action.default_node_title || action.name,
            category: action.category,
            capability: action.capability,
            icon: action.icon || '⚡',
            inputs_schema_json: action.inputs_schema_json || [],
            outputs_schema_json: action.outputs_schema_json || [],
            execution_json: action.execution_json || null,
            configurations_json: action.configurations_json || [],
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="node-palette-item"
            draggable
            onDragStart={handleDragStart}
        >
            <span className="node-palette-item__icon" style={{ color: itemColor }}>
                <IconRenderer iconName={action.icon} size={15} fallback="⚡" />
            </span>

            <span className="node-palette-item__name" style={{ color: itemColor }}>{action.name}</span>
        </div>
    );
}

