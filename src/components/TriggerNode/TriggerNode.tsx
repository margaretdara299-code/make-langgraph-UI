/**
 * TriggerNode — custom React Flow node renderer for entry points.
 * Triggers have a distinct top cap and NO target handle (only source).
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import './TriggerNode.css';

export default function TriggerNode({ data }: NodeProps) {
    const nodeData = data as unknown as CanvasNodeData;

    return (
        <div className="trigger-node">
            <div className="trigger-node__header">
                <span className="trigger-node__icon">
                    <IconRenderer iconName={nodeData.icon} size={16} fallback="⚡" />
                </span>
                <span className="trigger-node__title">{nodeData.label}</span>
            </div>

            <div className="trigger-node__footer">
                <span className="trigger-node__badge">TRIGGER</span>
                <span className="trigger-node__category">{nodeData.category}</span>
            </div>

            {/* Triggers ONLY have a source handle (bottom output) */}
            <Handle type="source" position={Position.Bottom} className="trigger-node__handle" />
        </div>
    );
}
