/**
 * NodePaletteItem — a single draggable action in the Node Palette.
 * Sets drag data so the canvas can read it on drop.
 */

import type { NodePaletteItemProps } from '@/interfaces';
import { CAPABILITY_COLORS, CAPABILITY_LABELS, DEFAULT_CAPABILITY_COLOR } from '@/constants';
import './NodePaletteItem.css';

export default function NodePaletteItem({ action }: NodePaletteItemProps) {
    const capColor = CAPABILITY_COLORS[action.capability] || DEFAULT_CAPABILITY_COLOR;

    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            actionId: action.id,
            actionKey: action.actionKey,
            label: action.defaultNodeTitle,
            category: action.category,
            capability: action.capability,
            icon: action.icon || '⚡',
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
            <span className="node-palette-item__icon">{action.icon || '⚡'}</span>
            <div className="node-palette-item__info">
                <span className="node-palette-item__name">{action.name}</span>
                <span
                    className="node-palette-item__badge"
                    style={{ backgroundColor: capColor }}
                >
                    {CAPABILITY_LABELS[action.capability] || action.capability}
                </span>
            </div>
        </div>
    );
}
