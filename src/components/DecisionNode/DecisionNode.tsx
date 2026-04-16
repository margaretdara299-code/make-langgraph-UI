import { useLayoutEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { getNodeTheme } from '@/utils';
import ModernNode from '../ModernNode/ModernNode';
import './DecisionNode.css';

export default function DecisionNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const updateNodeInternals = useUpdateNodeInternals();

    const theme = getNodeTheme('decision');
    const rules: any[] = Array.isArray(nodeData.rules) ? nodeData.rules : [];

    /**
     * Notify React Flow to recalculate handleBounds for this node whenever
     * the number of rule handles changes.
     */
    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            updateNodeInternals(id);
        }, 50);
        return () => clearTimeout(timeout);
    }, [rules.length, id, updateNodeInternals]);

    // Total slots = one per rule + 1 default.
    const totalHandles = rules.length + 1;
    const leftPercent = (slotIndex: number) =>
        `${(slotIndex * 100) / (totalHandles + 1)}%`;

    const ruleHandleId = (rule: any, idx: number): string =>
        rule?.id && String(rule.id).trim() ? String(rule.id) : `rule_${idx}`;

    return (
        <ModernNode
            id={id}
            data={nodeData}
            theme={{ ...theme, iconBg: 'transparent' }} // Let our diamond be the icon shape
            title={nodeData.label || 'Decision'}
            subtitle="Router"
            badge="ROUTE"
            showSourceHandle={false} // We provide custom multiple handles below
            icon={
                <div 
                    className="decision-node__icon-diamond" 
                    style={{ 
                        borderColor: theme.stroke, 
                        background: theme.iconBg, // Apply the theme background to the diamond itself
                        color: theme.stroke 
                    }}
                >
                    <div className="decision-node__icon-inner">
                        <div className="decision-node__icon-dot" style={{ background: theme.stroke }} />
                    </div>
                </div>
            }
        >
            {/* ── Multiple Source handles (bottom) ── */}
            {rules.map((rule, idx) => {
                const hId = ruleHandleId(rule, idx);
                return (
                    <Handle
                        key={hId}
                        type="source"
                        position={Position.Bottom}
                        id={hId}
                        className="decision-node__source-handle modern-node-handle"
                        style={{ left: leftPercent(idx + 1) }}
                    />
                );
            })}

            {/* Default (fallback) handle — last slot */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="default"
                className="decision-node__source-handle decision-node__source-handle--default modern-node-handle"
                style={{ left: leftPercent(rules.length + 1) }}
            />
        </ModernNode>
    );
}
