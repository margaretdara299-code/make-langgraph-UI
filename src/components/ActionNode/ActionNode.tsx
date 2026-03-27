/**
 * ActionNode — custom React Flow node renderer for action nodes on the canvas.
 * Reduced to Top/Bottom connectivity as per user request.
 */

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { stringToColorParams } from '@/utils';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { CAPABILITY_LABELS } from '@/constants';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import './ActionNode.css';

export default function ActionNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const cap = (nodeData.capability || 'default').toLowerCase();
    const isKnown = !!CAPABILITY_LABELS[cap];
    const dynamicTheme = isKnown ? null : stringToColorParams(cap);

    const glowColor = isKnown ? `var(--color-badge-text-${cap})` : dynamicTheme?.text;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        // Immediately sync deletion to localStorage
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    return (
        <div
            className="action-node action-node--glow"
            style={{ '--node-accent-glow': glowColor } as any}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="action-node__handle action-node__handle-target-top"
            />

            <div className="action-node__border-wrapper">
                <div className="action-node__content">
                    <div
                        className="action-node__header"
                        style={{
                            background: isKnown ? `linear-gradient(90deg, var(--color-badge-bg-${cap}), transparent)` : 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        <span className="action-node__icon" style={{ color: glowColor }}>
                            <IconRenderer iconName={nodeData.icon} size={18} fallback="⚙️" />
                        </span>
                        <span className="action-node__title" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {nodeData.label}
                        </span>
                        <span
                            className="action-node__delete"
                            onClick={handleDelete}
                            title="Delete Node"
                        >
                            <DeleteOutlined />
                        </span>
                    </div>

                    <div className="action-node__footer">
                        <span className="action-node__capability-badge">
                            {(nodeData as any).connectorId
                                ? ((nodeData as any).connectorType || cap) === 'database'
                                    ? 'DB Connector'
                                    : 'Api Connector'
                                : CAPABILITY_LABELS[cap] || cap}
                        </span>
                        <span className="action-node__category">{nodeData.category}</span>
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="action-node__handle action-node__handle-source-bottom"
            />
        </div>
    );
}
