/**
 * ParallelJoinNode (Merge) — A fan-in node that waits for parallel branches
 * and combines their results before the workflow continues.
 *
 * Visual states:
 *  1. No incoming branches: Shows "Connect parallel branches" empty state.
 *  2. Has incoming branches (from React Flow edges): Shows a list of connected sources.
 *
 * The node accepts MULTIPLE target handles on top (using a single "target" id that
 * React Flow maps multi-connections onto) and emits ONE source handle at bottom.
 */

import { useLayoutEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, useEdges, useNodes } from '@xyflow/react';
import { GitMerge } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { getNodeTheme } from '@/utils';
import ModernNode from '../ModernNode/ModernNode';
import '../ModernNode/ModernNode.css';
import './ParallelJoinNode.css';

export default function ParallelJoinNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data as any;
    const updateNodeInternals = useUpdateNodeInternals();
    const theme = getNodeTheme('parallel_join');

    // Discover incoming edges targeting this node so we can show a branch preview
    const allEdges = useEdges();
    const incomingEdges = allEdges.filter(e => e.target === id);
    const hasIncoming = incomingEdges.length > 0;
    const allNodes = useNodes();

    useLayoutEffect(() => {
        const frameId = window.requestAnimationFrame(() => updateNodeInternals(id));
        const t1 = window.setTimeout(() => updateNodeInternals(id), 50);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(t1);
        };
    }, [id, updateNodeInternals, incomingEdges.length]);

    const subtitle = hasIncoming
        ? `${incomingEdges.length} branch${incomingEdges.length !== 1 ? 'es' : ''} incoming`
        : 'Connect parallel branches';

    const isWaiting = nodeData.executionStatus === 'waiting';

    return (
        <ModernNode
            id={id}
            data={nodeData}
            theme={theme}
            title={nodeData.label || 'Merge'}
            subtitle={subtitle}
            badge="JOIN"
            icon={<GitMerge size={14} />}
            showTargetHandle={true}   // Standard top handle (multi-connection works by default)
            showSourceHandle={true}   // Standard bottom handle — output to next node
        >
            {/* Incoming branch preview */}
            {hasIncoming ? (
                <div className="merge-node__incoming">
                    {incomingEdges.map(edge => {
                        const sourceNode = allNodes.find(n => n.id === edge.source);
                        const sourceNodeData = sourceNode?.data as any;
                        const labelToDisplay = sourceNodeData?.label || sourceNodeData?.name || edge.sourceHandle || edge.source;
                        return (
                            <div key={edge.id} className="merge-node__branch-row">
                                <span className="merge-node__branch-dot" />
                                <span className="merge-node__branch-label">
                                    {labelToDisplay}                                
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="merge-node__empty-state">
                    <span className="merge-node__empty-label">
                        Connect branch outputs here
                    </span>
                </div>
            )}

            {/* ── Waiting Overlay ── */}
            {isWaiting && (
                <div className="merge-node__wait-overlay">
                    <div className="merge-node__wait-badge">
                        {/* Hourglass SVG — flips every 2s */}
                        <svg
                            className="merge-node__hourglass"
                            viewBox="0 0 24 24"
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 22h14" />
                            <path d="M5 2h14" />
                            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                        </svg>
                        <span className="merge-node__wait-label">Waiting for branches…</span>
                    </div>
                </div>
            )}
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

export function MergeNodeItem() {
    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'parallel_join',
            label: 'Merge',
            category: 'structure',
            icon: 'GitMerge',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleDragStart}>
            <motion.div className="node-library-item" variants={variants}>
                <div className="nli-icon nli-icon--common">
                    <GitMerge size={12} color="var(--color-node-join, #6366f1)" strokeWidth={2.4} />
                </div>
                <div className="nli-content">
                    <span className="nli-label">Merge Node</span>
                </div>                
            </motion.div>
        </div>
    );
}
