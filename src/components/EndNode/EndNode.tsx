/**
 * EndNode — custom React Flow node renderer for termination points.
 * End nodes have a distinct shape and NO source handle (only target).
 */

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import './EndNode.css';

export default function EndNode({ data }: NodeProps) {
    const nodeData = data as unknown as CanvasNodeData;

    // Determine the color intent based on the category (Success vs Error)
    const isError = nodeData.category.toLowerCase().includes('error');
    const colorClass = isError ? 'end-node--error' : 'end-node--success';

    return (
        <div className={`end-node ${colorClass}`}>
            <Handle type="target" position={Position.Top} className="end-node__handle" />

            <div className="end-node__content">
                <span className="end-node__icon">{nodeData.icon || '🛑'}</span>
                <span className="end-node__label">{nodeData.label}</span>
            </div>
        </div>
    );
}
