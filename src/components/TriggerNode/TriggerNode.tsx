import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from '@/utils';
import '../ActionNode/ActionNode.css';

export default function TriggerNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const theme = getNodeTheme('trigger');

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    return (
        <div className="modern-node-card" style={{ background: theme.bg, borderColor: theme.stroke, color: theme.stroke } as any}>
            <div className="modern-node-delete" onClick={handleDelete} title="Delete Node">×</div>

            <div className="modern-node-content">
                <div className="modern-node-left">
                    <div className="modern-node-icon" style={{ background: theme.iconBg, color: theme.stroke }}>
                        <IconRenderer iconName={nodeData.icon} size={14} fallback={<Zap size={14} />} />
                    </div>
                    <div className="modern-node-text-col">
                        <div className="modern-node-title">{nodeData.label}</div>
                        <div className="modern-node-sub">Trigger Event</div>
                    </div>
                </div>
                <div className="modern-node-right">
                    <span className="modern-node-badge" style={{ background: theme.badgeBg }}>
                        EVENT
                    </span>
                    <span className="modern-node-dot" style={{ background: theme.stroke }}></span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="modern-node-handle" />
        </div>
    );
}
