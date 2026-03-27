/**
 * SubFlowNode — custom React Flow node renderer for grouping.
 * Standardized for Top/Bottom connectivity.
 */

import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import './SubFlowNode.css';

export default function SubFlowNode({ id, data, selected }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    // Use a fixed accent color or derive from data if available
    const accentColor = nodeData.color || 'var(--color-primary)';
    const headerBg = accentColor;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

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
                        <span className="subflow-node__title" style={{ flex: 1 }}>
                            {nodeData.label || 'Sub-Flow'}
                        </span>
                        <span
                            className="subflow-node__delete"
                            onClick={handleDelete}
                            title="Delete Sub-Flow"
                        >
                            <DeleteOutlined />
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
