/**
 * SubFlowNode — custom React Flow node renderer for grouping.
 * Standardized for Top/Bottom connectivity.
 */

import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import './SubFlowNode.css';

export default function SubFlowNode({ data, selected }: NodeProps<CanvasNode>) {
    const nodeData = data;

    // Use a fixed accent color or derive from data if available
    const accentColor = nodeData.color || 'var(--color-primary)';
    const headerBg = accentColor;

    return (
        <div 
            className="subflow-node subflow-node--glow"
            style={{ '--node-accent-glow': accentColor } as any}
        >
            <NodeResizer 
                color={accentColor} 
                isVisible={selected} 
                minWidth={250} 
                minHeight={150}
                handleClassName="subflow-node__resize-handle"
                lineClassName="subflow-node__resize-line"
            />

            <Handle 
                type="target" 
                position={Position.Top} 
                className="subflow-node__handle subflow-node__handle-target-top" 
            />

            <div className="subflow-node__border-wrapper">
                <div className="subflow-node__content">
                    <div 
                        className="subflow-node__header" 
                        style={{ 
                            background: `linear-gradient(90deg, ${headerBg}, transparent)`
                        }}
                    >
                        <span className="subflow-node__icon">📦</span>
                        <span className="subflow-node__title">
                            {nodeData.label || 'Sub-Flow'}
                        </span>
                    </div>

                    <div className="subflow-node__body">
                        {nodeData.description && (
                            <span className="subflow-node__description">{nodeData.description}</span>
                        )}
                    </div>
                </div>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="subflow-node__handle subflow-node__handle-source-bottom" 
            />
        </div>
    );
}
