import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Handle,
    Position,
    NodeResizer,
    useReactFlow,
    type NodeProps,
} from '@xyflow/react';
import { ChevronDown } from 'lucide-react';
import type { CanvasNode } from '@/interfaces';
import { upsertNodeInStorage } from '@/services/skillGraphStorage.service';
import './SubFlowNode.css';

const COLLAPSED_HEIGHT = 44;
const MIN_W = 250;
const MIN_H = 180;

const GROUP_ACCENTS = [
    '#6366f1',
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
];

function pickAccent(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return GROUP_ACCENTS[hash % GROUP_ACCENTS.length];
}

export default function SubFlowNode({ id, data, selected, height }: NodeProps<CanvasNode>) {
    const { versionId } = useParams<{ versionId: string }>();
    const { deleteElements, setNodes } = useReactFlow();
    const accent = (data as any).color || pickAccent(id);

    // Restore collapsed state from node.data so it survives save/reload
    const [isCollapsed, setIsCollapsed] = useState<boolean>(
        Boolean((data as any)._collapsed)
    );
    const storedHeightRef = useRef<number>(
        (data as any)._expandedHeight ?? (typeof height === 'number' ? height : 300)
    );

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const toggleCollapse = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextCollapsed = !isCollapsed;

        setNodes((nds: any[]) => nds.map((n: any) => {
            if (n.id === id) {
                if (nextCollapsed) {
                    // Capture current expanded height before collapsing
                    storedHeightRef.current =
                        (n.style?.height as number) ??
                        (typeof height === 'number' ? height : 300);
                }
                const newHeight = nextCollapsed ? COLLAPSED_HEIGHT : storedHeightRef.current;
                const updated = {
                    ...n,
                    style: { ...n.style, height: newHeight },
                    // Persist collapsed state + expanded height inside node.data
                    // so the canvas restores correctly after save/reload
                    data: {
                        ...n.data,
                        _collapsed: nextCollapsed,
                        _expandedHeight: nextCollapsed ? storedHeightRef.current : undefined,
                    },
                };
                // Sync to localStorage immediately so a subsequent save picks it up
                if (versionId) upsertNodeInStorage(versionId, id, updated);
                return updated;
            }
            if (n.parentId === id) {
                const updated = { ...n, hidden: nextCollapsed };
                if (versionId) upsertNodeInStorage(versionId, n.id, updated);
                return updated;
            }
            return n;
        }));

        setIsCollapsed(nextCollapsed);
    };

    return (
        <>
            {/* Resize drag handles — only when expanded + selected */}
            <NodeResizer
                isVisible={selected && !isCollapsed}
                minWidth={MIN_W}
                minHeight={MIN_H}
                handleClassName="subflow-node__resize-handle"
                lineClassName="subflow-node__resize-line"
            />

            {/* Connection handles */}
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

            {/* Main container */}
            <div
                className={`subflow-node ${selected ? 'subflow-node--selected' : ''} ${isCollapsed ? 'subflow-node--collapsed' : ''}`}
                style={{ '--node-accent-glow': accent } as React.CSSProperties}
            >
                {/* Delete button */}
                <div className="subflow-node__delete" onClick={handleDelete} title="Delete group">
                    ×
                </div>

                <div className="subflow-node__border-wrapper">
                    <div className="subflow-node__content">

                        {/* Header */}
                        <div className="subflow-node__header">
                            <span className="subflow-node__icon">📦</span>
                            <span className="subflow-node__title">
                                {(data as any).label || 'Group'}
                            </span>

                            {/* Collapse / Expand */}
                            <button
                                className="subflow-node__toggle"
                                onClick={toggleCollapse}
                                title={isCollapsed ? 'Expand group' : 'Collapse group'}
                            >
                                <ChevronDown
                                    size={13}
                                    className={`subflow-node__toggle-icon ${isCollapsed ? 'subflow-node__toggle-icon--up' : ''}`}
                                />
                            </button>

                            {!isCollapsed && (
                                <span className="subflow-node__resize-hint" title="Drag corner handles to resize">⤡</span>
                            )}
                        </div>

                        {/* Body */}
                        {!isCollapsed && (
                            <div className="subflow-node__body">
                                {(data as any).description && (
                                    <p className="subflow-node__description">{(data as any).description}</p>
                                )}
                                <span className="subflow-node__drop-hint">Drop nodes here to group them</span>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
