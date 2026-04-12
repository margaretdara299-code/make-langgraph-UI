/**
 * DecisionNode
 *
 * Uses the official @xyflow/react multiple-handle pattern:
 *   <Handle type="source" position={Position.Bottom} id="a" style={{ left: '25%' }} />
 *   <Handle type="source" position={Position.Bottom} id="b" style={{ left: '75%' }} />
 *
 * Rules:
 *  - Every handle MUST have a unique `id` string.
 *  - Spacing is done ONLY via `style.left` — React Flow owns everything else.
 *  - Do NOT override bottom / transform / position / pointerEvents on the handle.
 *    React Flow sets those internally and any CSS that touches them breaks connectivity.
 */

import { useLayoutEffect } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from '@/utils';
import '../ActionNode/ActionNode.css';
import './DecisionNode.css';

export default function DecisionNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data as any;
    const { setNodes } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();
    const updateNodeInternals = useUpdateNodeInternals();

    const theme = getNodeTheme('decision');
    const rules: any[] = Array.isArray(nodeData.rules) ? nodeData.rules : [];

    /**
     * Notify React Flow to recalculate handleBounds for this node whenever
     * the number of rule handles changes.
     *
     * React Flow caches a node's handleBounds snapshot on first render.
     * When new <Handle> components are mounted (because rules were added in
     * the Properties Drawer), those DOM elements exist but React Flow's
     * connection routing doesn't know about them — so drag-to-connect silently
     * fails. Calling updateNodeInternals() forces a fresh handleBounds scan.
     *
     * The `default` handle always worked because it was present on the very
     * first render and never needed re-registration.
     */
    useLayoutEffect(() => {
        updateNodeInternals(id);
    }, [rules.length, id, updateNodeInternals]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
        if (versionId) removeNodeFromStorage(versionId, id);
    };

    // Total slots = one per rule + 1 default.
    // Distribute evenly: slot i (1-based) gets left = i / (total + 1) * 100%
    // e.g. 3 rules + 1 default = 4 handles → 20%, 40%, 60%, 80%
    const totalHandles = rules.length + 1;
    const leftPercent = (slotIndex: number) =>
        `${(slotIndex * 100) / (totalHandles + 1)}%`;

    const ruleHandleId = (rule: any, idx: number): string =>
        rule?.id && String(rule.id).trim() ? String(rule.id) : `rule_${idx}`;

    return (
        <div
            className="modern-node-card"
            style={{ background: theme.bg, borderColor: theme.stroke, color: theme.stroke }}
        >
            <div className="modern-node-delete" onClick={handleDelete} title="Delete Node">×</div>

            {/* ── Target handle (top-centre, single) ── */}
            <Handle
                type="target"
                position={Position.Top}
                className="modern-node-handle"
            />

            {/* ── Node body ── */}
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
                    <span className="modern-node-badge" style={{ background: theme.badgeBg }}>ROUTE</span>
                    <span className="modern-node-dot" style={{ background: theme.stroke }}></span>
                </div>
            </div>

            {/*
             * ── Source handles (bottom) ──
             *
             * Official pattern from @xyflow/react docs:
             *   <Handle type="source" position={Position.Bottom} id="a" style={{ left: 10 }} />
             *   <Handle type="source" position={Position.Bottom} id="b" />
             *
             * The ONLY thing we override via `style` is `left` for horizontal spacing.
             * React Flow manages position:absolute, bottom, transform, and pointer-events.
             * Touching those properties in CSS or inline style breaks drag-to-connect.
             */}
            {rules.map((rule, idx) => {
                const hId = ruleHandleId(rule, idx);
                return (
                    <Handle
                        key={hId}
                        type="source"
                        position={Position.Bottom}
                        id={hId}
                        className="decision-node__source-handle"
                        style={{ left: leftPercent(idx + 1) }}
                    />
                );
            })}

            {/* Default (fallback) handle — last slot */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="default"
                className="decision-node__source-handle decision-node__source-handle--default"
                style={{ left: leftPercent(rules.length + 1) }}
            />
        </div>
    );
}
