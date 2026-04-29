/**
 * ParallelSplitNode — A fan-out node that creates multiple parallel execution branches.
 *
 * Visual states:
 *  1. Unconfigured (branches = []):
 *     Shows empty state helper text, NO bottom source handles.
 *  2. Configured (branches.length > 0):
 *     Shows one source handle per branch, distributed horizontally.
 *     Badge changes based on split_mode (PARALLEL vs COND. PARALLEL).
 */

import { useLayoutEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { GitFork } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { getNodeTheme } from '@/utils';
import ModernNode from '../ModernNode/ModernNode';
import '../ModernNode/ModernNode.css';
import './ParallelSplitNode.css';

/** A single configured branch in the split's data model. */
interface SplitBranch {
    id: string;
    label: string;
    required?: boolean;
    description?: string;
}

export default function ParallelSplitNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data as any;
    const updateNodeInternals = useUpdateNodeInternals();
    const theme = getNodeTheme('parallel_split');

    // Support both old (number) and new (array) branch data models
    const branches: SplitBranch[] = Array.isArray(nodeData.branches) ? nodeData.branches : [];
    const isConfigured = branches.length > 0;
    const isConditional = nodeData.split_mode === 'parallel_conditional';

    /**
     * Notify React Flow to recalculate handle bounds whenever the branch count changes.
     * Using the same triple-fire pattern as DecisionNode to handle animated containers.
     */
    useLayoutEffect(() => {
        const frameId = window.requestAnimationFrame(() => updateNodeInternals(id));
        const t1 = window.setTimeout(() => updateNodeInternals(id), 50);
        const t2 = window.setTimeout(() => updateNodeInternals(id), 400);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [branches.length, id, updateNodeInternals]);

    /**
     * Distribute handles evenly across the node width.
     * Mirrors the DecisionNode distribution formula.
     */
    // Mirror the DecisionNode formula exactly:
    // total = branches.length, we space handles at slots 1..N out of (N+1) equal divisions
    const totalHandles = branches.length;
    const leftPercent = (slotIndex: number) =>
        `${(slotIndex * 100) / (totalHandles + 1)}%`;

    const badge = isConditional ? 'COND. PARALLEL' : 'PARALLEL';

    const subtitle = !isConfigured
        ? 'No branches configured'
        : isConditional
            ? `${branches.length} conditional parallel branches`
            : `${branches.length} parallel branches`;

    return (
        <ModernNode
            id={id}
            data={nodeData}
            theme={theme}
            title={nodeData.label || 'Split'}
            subtitle={subtitle}
            badge={badge}
            icon={<GitFork size={14} />}
            showTargetHandle={true}    // Top handle — always visible
            showSourceHandle={false}   // We provide custom bottom handles below
        >
            {/* ── Empty state message ── */}
            {!isConfigured && (
                <div className="split-node__empty-state">
                    <span className="split-node__empty-label">
                        Configure branches to create parallel paths
                    </span>
                </div>
            )}

            {/* ── Branch list shown on node body ── */}
            {isConfigured && (
                <div className="split-node__branches">
                    {branches.map((branch, idx) => (
                        <div key={branch.id || idx} className="split-node__branch-row">
                            <span className="split-node__branch-badge">{idx + 1}</span>
                            <span className="split-node__branch-label">{branch.label || branch.id}</span>
                            {branch.required === false && (
                                <span className="split-node__branch-required">opt</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Dynamic bottom source handles — one per branch ──
             *
             * INVARIANT: handle `id` must exactly match `branch.id` saved by the form.
             * The form's "Add Branch" button pre-generates id = `branch_<Date.now()>`.
             * Never overwrite branch.id from the label field — that breaks existing edges.
             * The fallback here is defensive-only; a correctly configured node always has id.
             */}
            {isConfigured && branches.map((branch, idx) => {
                // Use branch.id if it's a non-empty string, otherwise use index fallback
                const handleId = branch.id && String(branch.id).trim() ? String(branch.id) : `branch_${idx}`;
                return (
                    <Handle
                        key={handleId}
                        type="source"
                        position={Position.Bottom}
                        id={handleId}
                        isConnectable
                        className="split-node__source-handle modern-node-handle"
                        style={{
                            '--handle-left': leftPercent(idx + 1),
                        } as React.CSSProperties}
                    />
                );
            })}
        </ModernNode>
    );
}

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: 'linear' }
  }
};

export function SplitNodeItem() {
    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'parallel_split',
            label: 'Split',
            category: 'structure',
            icon: 'GitFork',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleDragStart}>
            <motion.div className="node-library-item" variants={variants}>
                <div className="nli-icon nli-icon--common">
                    <GitFork size={12} color="var(--color-node-split, #ec4899)" strokeWidth={2.4} />
                </div>
                <div className="nli-content">
                    <span className="nli-label">Split Node</span>
                </div>                
            </motion.div>
        </div>
    );
}
