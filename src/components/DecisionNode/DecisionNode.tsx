import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from '@/utils';
import '../ActionNode/ActionNode.css';

export default function DecisionNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data as any;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const theme = getNodeTheme('decision');
    const rules: any[] = Array.isArray(nodeData.rules) ? nodeData.rules : [];

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    // Calculate dynamic vertical placement of multiple handles if branch rules exist
    const totalHandles = rules.length + 1; // plus default
    
    return (
        <div className="modern-node-card" style={{ background: theme.bg, borderColor: theme.stroke, color: theme.stroke } as any}>
            <div className="modern-node-delete" onClick={handleDelete} title="Delete Node">×</div>

            <Handle type="target" position={Position.Top} className="modern-node-handle" />

            <div className="modern-node-content">
                <div className="modern-node-left">
                    <div className="modern-node-icon" style={{ background: theme.iconBg, color: theme.stroke }}>
                        ⚡
                    </div>
                    <div className="modern-node-text-col">
                        <div className="modern-node-title">{nodeData.label || 'Decision'}</div>
                        <div className="modern-node-sub">Router</div>
                    </div>
                </div>
                <div className="modern-node-right">
                    <span className="modern-node-badge" style={{ background: theme.badgeBg }}>
                        ROUTE
                    </span>
                    <span className="modern-node-dot" style={{ background: theme.stroke }}></span>
                </div>
            </div>

            {/* Invisible structured handles for React Flow routing */}
            {rules.map((rule, idx) => (
                <Handle
                    key={rule.id || `rule_${idx}`}
                    type="source"
                    position={Position.Right}
                    id={rule.id || `rule_${idx}`}
                    className="modern-node-handle"
                    style={{ top: `${(idx + 1) * (100 / (totalHandles + 1))}%` }}
                />
            ))}
            <Handle
                type="source"
                position={Position.Right}
                id="default"
                className="modern-node-handle"
                style={{ top: `${(rules.length + 1) * (100 / (totalHandles + 1))}%` }}
            />
            
            {/* Standard bottom handle fallback */}
            <Handle type="source" position={Position.Bottom} className="modern-node-handle" id="bottom" />
        </div>
    );
}
