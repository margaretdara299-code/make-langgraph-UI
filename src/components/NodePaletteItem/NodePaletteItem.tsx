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
    
    // Check if it's a known CSS capability (we have labels for known ones)
    const isKnown = !!CAPABILITY_LABELS[cap];
    
    // If unknown, generate a deterministic color palette
    const dynamicTheme = isKnown ? null : stringToColorParams(cap);

    const iconAndTextColor = isKnown ? `var(--color-badge-text-${cap})` : dynamicTheme?.text;
    const badgeBg = isKnown ? undefined : dynamicTheme?.bg;
    const badgeBorder = isKnown ? undefined : dynamicTheme?.text;

    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            actionId: action.id,
            actionKey: action.actionKey,
            label: action.defaultNodeTitle,
            category: action.category,
            capability: action.capability,
            icon: action.icon || '⚡',
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
            <span className="node-palette-item__icon" style={{ color: iconAndTextColor }}>
                <IconRenderer iconName={action.icon} size={18} fallback="⚡" />
            </span>
            <div className="node-palette-item__info">
                <span className="node-palette-item__name" style={{ color: iconAndTextColor }}>{action.name}</span>
                <span
                    className={`node-palette-item__badge ${isKnown ? `badge-${cap}` : ''}`}
                    style={!isKnown ? { backgroundColor: badgeBg, color: iconAndTextColor, border: `1px solid ${badgeBorder}` } : undefined}
                >
                    {CAPABILITY_LABELS[cap] || action.capability}
                </span>
            </div>
        </div>
    );
}
