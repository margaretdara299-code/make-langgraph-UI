import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from '@/utils';
import '../ActionNode/ActionNode.css';

export default function StartNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const theme = getNodeTheme('start');

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    return (
        <div className="modern-node-card modern-node-card-small" style={{ background: theme.bg, borderColor: theme.stroke }}>
            <div className="modern-node-delete" onClick={handleDelete} title="Delete Node">×</div>

            <div className="modern-node-content">
                <div className="modern-node-left">
                    <div className="modern-node-text-col">
                        <div className="modern-node-title">{nodeData.label || 'Start'}</div>                        
                    </div>
                </div>
                <div className="modern-node-right">
                    <span className="modern-node-badge" style={{ background: theme.badgeBg }}>
                        START
                    </span>
                    <span className="modern-node-dot" style={{ background: theme.stroke }}></span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="modern-node-handle" />
        </div>
    );
}
