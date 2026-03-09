/**
 * ActionNode — custom React Flow node renderer for action nodes on the canvas.
 * Shows an icon, label, and capability-colored indicator.
 */

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
 import { CAPABILITY_LABELS } from '@/constants';
import './ActionNode.css';

export default function ActionNode({ data }: NodeProps) {
    const nodeData = data as unknown as CanvasNodeData;

    return (
        <div className="action-node">
            <Handle type="target" position={Position.Top} className="action-node__handle" />

            <div className="action-node__header" style={{ borderTopColor: `var(--color-badge-text-${nodeData.capability})` }}>
                <span className="action-node__icon">{nodeData.icon}</span>
                <span className="action-node__label">{nodeData.label}</span>
            </div>

            <div className="action-node__footer">
                <span
                    className={`action-node__capability-badge badge-${nodeData.capability}`}
                >
                    {CAPABILITY_LABELS[nodeData.capability] || nodeData.capability}
                </span>
                <span className="action-node__category">{nodeData.category}</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="action-node__handle" />
        </div>
    );
}
