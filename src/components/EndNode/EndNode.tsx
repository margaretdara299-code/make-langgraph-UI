/**
 * EndNode — custom React Flow node renderer for termination points.
 * Standardized for Top/Bottom connectivity.
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import './EndNode.css';

export default function EndNode({ data }: NodeProps<CanvasNode>) {
    const nodeData = data;

    // Determine the color intent based on the category (Success vs Error)
    const isError = nodeData.category.toLowerCase().includes('error');
    const colorClass = isError ? 'end-node--error' : 'end-node--success';

    return (
        <div className={`end-node ${colorClass}`}>
            <Handle 
                type="target" 
                position={Position.Top} 
                className="end-node__handle end-node__handle-target-top" 
            />

            <div className="end-node__border-wrapper">
                <div className="end-node__content">
                    <div className="end-node__header">
                        <span className="end-node__icon">
                            <IconRenderer iconName={nodeData.icon} size={18} fallback="🛑" />
                        </span>
                        <span className="end-node__title">{nodeData.label}</span>
                    </div>

                    <div className="end-node__footer">
                        <span className="end-node__badge">{isError ? 'ERROR' : 'END'}</span>
                        <span className="end-node__category">{nodeData.category}</span>
                    </div>
                </div>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="end-node__handle end-node__handle-source-bottom" 
            />
        </div>
    );
}
