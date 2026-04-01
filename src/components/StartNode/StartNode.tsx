import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import './StartNode.css';

export default function StartNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const glowColor = 'var(--color-node-start)'; // Clean green from design tokens

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    return (
        <div
            className="start-node start-node--glow"
            style={{ '--node-accent-glow': glowColor } as any}
        >
            <div className="start-node__border-wrapper">
                <div className="start-node__content">
                    <div
                        className="start-node__header"
                        style={{
                            background: `linear-gradient(90deg, var(--color-node-start-bg), transparent)`
                        }}
                    >
                        <span className="start-node__icon" style={{ color: glowColor }}>
                            ▶️
                        </span>
                        <span className="start-node__title" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {nodeData.label || 'Start'}
                        </span>
                        <span
                            className="start-node__delete"
                            onClick={handleDelete}
                            title="Delete Node"
                        >
                            <DeleteOutlined />
                        </span>
                    </div>

                    <div className="start-node__footer">
                        <span className="start-node__capability-badge">ENTRY POINT</span>
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="start-node__handle start-node__handle-source-bottom"
            />
        </div>
    );
}
