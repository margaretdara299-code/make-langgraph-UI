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
        // Recalculate more than once so handle bounds stay correct inside
        // animated containers like the Execution Debugger modal.
        const frameId = window.requestAnimationFrame(() => {
            updateNodeInternals(id);
        });
        const timeout = window.setTimeout(() => {
            updateNodeInternals(id);
        }, 50);
        const delayedTimeout = window.setTimeout(() => {
            updateNodeInternals(id);
        }, 400);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(timeout);
            window.clearTimeout(delayedTimeout);
        };
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
                        '--icon-stroke': theme.stroke, 
                        '--icon-bg': theme.iconBg
                    } as React.CSSProperties}
                >
                    <div className="decision-node__icon-inner">
                        <div className="decision-node__icon-dot" />
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
                        style={{ '--handle-left': leftPercent(idx + 1), '--p': leftPercent(idx + 1) } as React.CSSProperties}
                    />
                );
            })}

            {/* Default (fallback) handle — last slot */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="default"
                className="decision-node__source-handle decision-node__source-handle--default modern-node-handle"
                style={{ '--handle-left': leftPercent(rules.length + 1), '--p': leftPercent(rules.length + 1) } as React.CSSProperties}
            />
        </ModernNode>
    );
}
