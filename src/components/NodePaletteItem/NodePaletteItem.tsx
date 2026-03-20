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
            actionId: action.id,
            actionKey: action.actionKey,
            actionVersionId: (action as any).actionVersionId || (action as any).latestVersionId || '',
            label: action.defaultNodeTitle,
            category: action.category,
            capability: action.capability,
            icon: action.icon || '⚡',
            inputsSchemaJson: action.inputsSchemaJson || [],
            outputsSchemaJson: action.outputsSchemaJson || [],
            executionJson: action.executionJson || null,
            configurationsJson: action.configurationsJson || [],
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
                <IconRenderer iconName={action.icon} size={18} fallback="⚡" />
            </span>
            <span className="node-palette-item__name" style={{ color: itemColor }}>{action.name}</span>
        </div>
    );
}

