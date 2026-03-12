/**
 * ActionNode — custom React Flow node renderer for action nodes on the canvas.
 * Shows an icon, label, and capability-colored indicator.
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { stringToColorParams } from '@/utils';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import { CAPABILITY_LABELS } from '@/constants';
import './ActionNode.css';

export default function ActionNode({ data }: NodeProps) {
    const nodeData = data as unknown as CanvasNodeData;

    const cap = (nodeData.capability || 'default').toLowerCase();
    const isKnown = !!CAPABILITY_LABELS[cap];
    const dynamicTheme = isKnown ? null : stringToColorParams(cap);

    const iconAndTextColor = isKnown ? `var(--color-badge-text-${cap})` : dynamicTheme?.text;
    const badgeBg = isKnown ? undefined : dynamicTheme?.bg;
    const badgeBorder = isKnown ? undefined : dynamicTheme?.text;

    return (
        <div className="action-node">
            <Handle type="target" position={Position.Top} className="action-node__handle" />

            <div className="action-node__header" style={{ borderTopColor: iconAndTextColor }}>
                <span className="action-node__icon" style={{ color: iconAndTextColor }}>
                    <IconRenderer iconName={nodeData.icon} size={16} fallback="⚙️" />
                </span>
                <span className="action-node__title" style={{ color: iconAndTextColor }}>{nodeData.label}</span>
            </div>

            <div className="action-node__footer">
                <span
                    className={`action-node__capability-badge ${isKnown ? `badge-${cap}` : ''}`}
                    style={!isKnown ? { backgroundColor: badgeBg, color: iconAndTextColor, border: `1px solid ${badgeBorder}` } : undefined}
                >
                    {CAPABILITY_LABELS[cap] || nodeData.capability}
                </span>
                <span className="action-node__category">{nodeData.category}</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="action-node__handle" />
        </div>
    );
}
