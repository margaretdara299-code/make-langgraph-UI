/**
 * ConnectorNode — custom React Flow node renderer for external system integrations.
 * Connectors have both target (top) and source (bottom) handles.
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import './ConnectorNode.css';

export default function ConnectorNode({ data }: NodeProps) {
    const nodeData = data as unknown as CanvasNodeData;

    return (
        <div className="connector-node">
            <Handle type="target" position={Position.Top} className="connector-node__handle" />

            <div className="connector-node__header">
                <span className="connector-node__icon">
                    <IconRenderer iconName={nodeData.icon} size={16} fallback="🔌" />
                </span>
                <span className="connector-node__title">{nodeData.label}</span>
            </div>

            <div className="connector-node__footer">
                <span className="connector-node__badge">CONNECTOR</span>
                <span className="connector-node__category">{nodeData.category}</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="connector-node__handle" />
        </div>
    );
}
