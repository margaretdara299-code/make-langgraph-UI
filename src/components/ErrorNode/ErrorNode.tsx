/**
 * ErrorNode — React Flow custom node for runtime/technical error handling.
 *
 * Design contract:
 *  - Target handle only (top-center). It receives error edges from Action nodes.
 *  - Source handle (bottom-center) allows connecting to an End Node.
 *  - Red theme (#EF4444) with a subtle pulsing glow defined in ErrorNode.css.
 *  - Distinct from Decision node's else/default path, which is for business logic.
 *
 * Error payload received at runtime (populated by the backend):
 *   failed_node_id, failed_node_name, error_message, error_type,
 *   stack_trace, request_payload, response_payload, workflow_state, timestamp
 */

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { ShieldAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from '@/utils';
import '../ModernNode/ModernNode.css';
import './ErrorNode.css';

export default function ErrorNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data as any;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const theme = getNodeTheme('error');

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    return (
        <div
            className={`modern-node-card error-node-card ${nodeData.executionStatus ? `node-exec-${nodeData.executionStatus}` : ''}`}
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

            {/* Target handle — receives error edges from Action nodes */}
            <Handle
                type="target"
                position={Position.Top}
                className="modern-node-handle error-node-handle"
            />

            {/* Node body */}
            <div className="modern-node-content">
                <div className="modern-node-left">
                    <div
                        className="modern-node-icon"
                        style={{ background: theme.iconBg, color: theme.stroke }}
                    >
                        <ShieldAlert size={13} />
                    </div>
                    <div className="modern-node-text-col">
                        <div className="modern-node-title">{nodeData.label || 'Error Handler'}</div>
                        <div className="modern-node-sub">Error Handler</div>
                    </div>
                </div>
                <div className="modern-node-right">
                    <span
                        className="modern-node-badge"
                        style={{ background: theme.badgeBg }}
                    >
                        ERR
                    </span>
                    <span
                        className="modern-node-dot"
                        style={{ background: theme.stroke }}
                    />
                </div>
            </div>

            {/* Source handle — allows routing error flow to an End Node */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="modern-node-handle error-node-handle"
            />
        </div>
    );
}
