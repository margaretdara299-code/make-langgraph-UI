import React from 'react';
import {
    Handle,
    Position,
    NodeResizer,
    useReactFlow,
    type NodeProps,
} from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import './SubFlowNode.css';

// Colour palette for group accent — cycles by node id to give each group a unique tint
const GROUP_ACCENTS = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
];

function pickAccent(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return GROUP_ACCENTS[hash % GROUP_ACCENTS.length];
}

export default function SubFlowNode({ id, data, selected }: NodeProps<CanvasNode>) {
    const { deleteElements } = useReactFlow();
    const accent = (data as any).color || pickAccent(id);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <>
            {/* ── Resize handles — shown on selection ── */}
            <NodeResizer
                isVisible={selected}
                minWidth={250}
                minHeight={180}
                handleClassName="subflow-node__resize-handle"
                lineClassName="subflow-node__resize-line"
            />

            {/* ── Connection handles ── */}
            <Handle
                type="target"
                position={Position.Top}
                className="subflow-node__handle subflow-node__handle-target-top"
                style={{ '--node-accent-glow': accent } as React.CSSProperties}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="src"
                className="subflow-node__handle subflow-node__handle-source-bottom"
                style={{ '--node-accent-glow': accent } as React.CSSProperties}
            />

            {/* ── Main container ── */}
            <div
                className={`subflow-node ${selected ? 'subflow-node--selected' : ''}`}
                style={{ '--node-accent-glow': accent } as React.CSSProperties}
            >
                <div className="subflow-node__border-wrapper">
                    <div className="subflow-node__content">

                        {/* Header */}
                        <div className="subflow-node__header">
                            <span className="subflow-node__icon">📦</span>
                            <span className="subflow-node__title">
                                {(data as any).label || 'Group'}
                            </span>

                            {/* Expand / collapse hint badge */}
                            <span
                                className="subflow-node__resize-hint"
                                title="Drag the corner handles to resize this group"
                            >
                                ⤡
                            </span>

                            {/* Delete */}
                            <button
                                className="subflow-node__delete"
                                onClick={handleDelete}
                                title="Delete group"
                            >
                                ×
                            </button>
                        </div>

                        {/* Body — child nodes render here via React Flow */}
                        <div className="subflow-node__body">
                            {(data as any).description && (
                                <p className="subflow-node__description">
                                    {(data as any).description}
                                </p>
                            )}
                            <span className="subflow-node__drop-hint">
                                Drop nodes here to group them
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
