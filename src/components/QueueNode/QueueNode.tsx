import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Layers } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from '@/utils';
import '../ModernNode/ModernNode.css';
import './QueueNode.css';

export default function QueueNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data as any;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const theme = getNodeTheme('queue');

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    const queueType = nodeData.queue_type || 'human';
    const queueTypeLabel =
        queueType === 'human'    ? 'Human'     :
        queueType === 'agent'    ? 'AI Agent'  :
        queueType === 'temporal' ? 'Temporal'  : 'Queue';

    return (
        <div
            className={`modern-node-card queue-node-card ${nodeData.executionStatus ? `node-exec-${nodeData.executionStatus}` : ''}`}
            style={{
                background: theme.bg,
                borderColor: theme.stroke,
                color: theme.stroke,
            } as any}
        >
            {/* Delete button */}
            <div className="modern-node-delete" onClick={handleDelete} title="Delete Node">
                ×
            </div>

            {/* Target handle — receives edge from last action/decision */}
            <Handle
                type="target"
                position={Position.Top}
                className="modern-node-handle queue-node-handle"
            />

            {/* Node body */}
            <div className="modern-node-content">
                <div className="modern-node-left">
                    <div
                        className="modern-node-icon queue-node-icon"
                        style={{ background: theme.iconBg, color: theme.stroke }}
                    >
                        <Layers size={13} />
                    </div>
                    <div className="modern-node-text-col">
                        <div className="modern-node-title">
                            {nodeData.label || 'Queue'}
                        </div>
                        <div className="modern-node-sub queue-node-sub">
                            {nodeData.queue_name
                                ? nodeData.queue_name
                                : queueTypeLabel}
                        </div>
                    </div>
                </div>
                <div className="modern-node-right">
                    <span
                        className="modern-node-badge"
                        style={{ background: theme.badgeBg }}
                    >
                        QUEUE
                    </span>
                    <span
                        className="modern-node-dot"
                        style={{ background: theme.stroke }}
                    />
                </div>
            </div>

            {/* Queue name pill shown beneath content when configured */}
            {nodeData.queue_name && (
                <div className="queue-node-name-pill">
                    <span className="queue-node-name-text">{nodeData.queue_name}</span>
                </div>
            )}
        </div>
    );
}
