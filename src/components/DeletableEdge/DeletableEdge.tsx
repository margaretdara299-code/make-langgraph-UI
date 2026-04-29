import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, useNodesData } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { removeConnectionFromStorage } from '@/services/skillGraphStorage.service';
import { useParams } from 'react-router-dom';
import { getNodeStrokeColor } from '@/utils';
import { Tooltip } from 'antd';

import './DeletableEdge.css';

export default function DeletableEdge(props: EdgeProps) {
    const {
        id,
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        style,
        markerEnd,
        data,
    } = props;
    const { setEdges } = useReactFlow();
    const sourceNodeData = useNodesData(props.source);
    const { versionId } = useParams<{ versionId: string }>();

    // Track whether the pointer is anywhere on the edge path (not just the center label).
    const [hovered, setHovered] = useState(false);

    const fromDecision = Boolean((data as any)?.fromDecision);
    const isErrorPath = Boolean((data as any)?.isErrorPath);
    const edgeColor = getNodeStrokeColor(sourceNodeData);

    // Compute dynamic label for Decision edges
    let computedLabel = props.label as string;
    if (fromDecision || props.sourceHandleId === 'default') {
        if (props.sourceHandleId === 'default') {
            computedLabel = 'FALLBACK';
        } else if (sourceNodeData && sourceNodeData.data) {
            const rules = (sourceNodeData.data as any)?.rules || [];
            const rule = rules.find((r: any, idx: number) => {
                const hid = r?.id && String(r.id).trim() ? String(r.id) : `rule_${idx}`;
                return hid === props.sourceHandleId;
            });
            if (rule) {
                // Parse conditions
                if (rule.conditions && rule.conditions.length > 0) {
                    const conditionsTxt = rule.conditions.map((c: any) => {
                        const path = c.source_type === 'output_key' 
                            ? `${c.root_key || ''}${c.path_suffix ? `.${c.path_suffix}` : ''}` 
                            : (c.field || '');
                        
                        const noVal = c.operator === 'exists' || c.operator === 'is_true' || c.operator === 'is_false';
                        return noVal 
                            ? `${path} ${c.operator}` 
                            : `${path} ${c.operator} ${c.value || ''}`;
                    }).join(` ${rule.match_type || 'AND'} `);
                    
                    computedLabel = conditionsTxt.trim() || rule.label;
                } else {
                    computedLabel = rule.label || 'Condition';
                }
            }
        }
    }

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        borderRadius: 12,
    });

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        setEdges((edges) => edges.filter((e) => e.id !== id));
        if (versionId) {
            removeConnectionFromStorage(versionId, id);
        }
    };

    return (
        <>
            {/* ── Visible edge line ── */}
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    // No dash pattern on animated edges — the moving balls convey data-flow
                    strokeDasharray: style?.strokeDasharray ?? 'none',
                    stroke: style?.stroke ?? edgeColor,
                    strokeWidth: style?.strokeWidth ?? 2,
                }}
            />

            {/* ── Animated Ball(s) Overlay ── */}
            {props.animated && !isErrorPath && (() => {
                // Number of balls on this edge (>1 on parallel branch edges)
                const ballCount: number = (data as any)?._execBalls ?? 1;
                const ballColor: string = (style?.stroke as string) || 'var(--color-primary)';
                const dur = 1.4; // seconds per ball trip

                return Array.from({ length: ballCount }).map((_, idx) => {
                    // Stagger: each ball starts at an even interval within the duration
                    const beginDelay = `${(idx * dur) / ballCount}s`;
                    // Leading ball is slightly larger
                    const r = idx === 0 ? 6.5 : 5;
                    return (
                        <circle
                            key={idx}
                            r={r}
                            fill="var(--exec-ball-fill, #fff)"
                            stroke={ballColor}
                            strokeWidth={idx === 0 ? 3 : 2.5}
                            style={{ filter: `drop-shadow(0 0 ${idx === 0 ? 7 : 5}px ${ballColor})` }}
                        >
                            <animateMotion
                                dur={`${dur}s`}
                                repeatCount="indefinite"
                                path={edgePath}
                                begin={beginDelay}
                            />
                        </circle>
                    );
                });
            })()}

            {/*
             * ── Invisible wide interaction path ──
             *
             * Renders the same SVG path but with:
             *   - stroke="transparent"  → invisible
             *   - strokeWidth="20"      → wide hover/click target along the full edge
             *   - pointerEvents="stroke" → only the stroke area captures events, not fill
             *
             * onMouseEnter/Leave here drive the `hovered` state that controls
             * the delete button visibility in EdgeLabelRenderer below.
             * This is the correct pattern because the SVG layer and the HTML label
             * layer are separate — CSS :hover selectors can't cross that boundary.
             */}
            <path
                d={edgePath}
                stroke="transparent"
                strokeWidth={20}
                fill="none"
                className="deletable-edge__interaction-path"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />

            {/* ── Label + delete button (HTML overlay layer) ── */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        '--edge-label-x': `${labelX}px`,
                        '--edge-label-y': `${labelY}px`,
                        '--edge-label-opacity': style?.opacity ?? 1,
                    } as React.CSSProperties}
                    className="nodrag nopan deletable-edge__label-positioner"
                    // Keep the hover active if the pointer moves into the label area
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="deletable-edge__wrapper">
                        {computedLabel && (
                            <Tooltip title={computedLabel} placement="top">
                                <div className="deletable-edge__label deletable-edge__icon-only">
                                    i
                                </div>
                            </Tooltip>
                        )}
                        {/* Button visibility is driven by React state, not CSS :hover */}
                        <button
                            className={`deletable-edge__btn ${hovered ? 'deletable-edge__btn--visible' : ''}`}
                            onClick={handleDelete}
                            title="Delete connection"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
