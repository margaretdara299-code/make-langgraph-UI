/**
 * ConnectorNode — custom React Flow node renderer for external system integrations.
 * Standardized for Top/Bottom connectivity.
 */

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import './ConnectorNode.css';

export default function ConnectorNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    return (
        <div className="connector-node">
            <Handle 
                type="target" 
                position={Position.Top} 
                className="connector-node__handle connector-node__handle-target-top" 
            />

            <div className="connector-node__border-wrapper">
                <div className="connector-node__content">
                    <div className="connector-node__header">
                        <span className="connector-node__icon">
                            <IconRenderer iconName={nodeData.icon} size={18} fallback="🔌" />
                        </span>
                        <span className="connector-node__title" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {nodeData.label}
                        </span>
                        <span
                            className="connector-node__delete"
                            onClick={handleDelete}
                            title="Delete Node"
                            style={{ cursor: 'pointer', paddingLeft: '8px', opacity: 0.6, fontSize: '13px' }}
                        >
                            <DeleteOutlined />
                        </span>
                    </div>

                    <div className="connector-node__footer">
                        <span className="connector-node__badge">CONNECTOR</span>
                        <span className="connector-node__category">{nodeData.category}</span>
                    </div>
                </div>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="connector-node__handle connector-node__handle-source-bottom" 
            />
        </div>
    );
}
