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

            {/* ── Animated Comet(s) Overlay ── */}
            {props.animated && !isErrorPath && (() => {
                /**
                 * Comet animation design:
                 *
                 * Each "ball" is actually 3 circles:
                 *   [tail ghost] → [mid ghost] → [HEAD] (z-order: back to front)
                 *
                 * The ghosts trail 0.09s and 0.18s behind the head.
                 * Because a less-negative `begin` means the animation started more
                 * recently → the ghost is at an earlier position on the path →
                 * it appears BEHIND the head. This makes direction obvious at a glance.
                 *
                 * For parallel-split edges, N comets are evenly pre-positioned across
                 * the full path length so all N are visible simultaneously.
                 *
                 * calcMode="paced" = constant visual speed on curves/corners.
                 */
                const ballCount = Math.min((data as any)?._execBalls ?? 1, 5);
                const ballColor = (style?.stroke as string) || 'var(--color-primary)';

                // Timing: 1.6s single (relaxed, readable), 1.1s parallel (urgent/fast)
                const dur = ballCount > 1 ? 1.1 : 1.6;

                // Comet tail gap in seconds — how far behind each ghost is
                const GAP = 0.09;

                // Head radius: larger for single path (clear focus), smaller for parallel
                const headR = ballCount > 1 ? 5.5 : 7;

                const fmtBegin = (sec: number): string => `${sec.toFixed(3)}s`;

                return Array.from({ length: ballCount }).flatMap((_, ballIdx) => {
                    // Pre-position each ball: negative begin = "already N seconds into the loop"
                    // Ball 0: -0.000s (at 0%), Ball 1: -0.55s (at 50%), Ball 2: -1.10s (at 100% = 0%)
                    const headSec = -((ballIdx * dur) / ballCount);

                    // Trail ghosts: LESS negative = started more recently = earlier on path = BEHIND head
                    const midSec  = headSec + GAP;       // 0.09s behind head
                    const tailSec = headSec + GAP * 2;   // 0.18s behind head

                    return [
                        // ── Tail ghost (farthest behind, barely visible) ──
                        <circle
                            key={`tail-${ballIdx}`}
                            r={headR * 0.38}
                            fill={ballColor}
                            stroke="none"
                            opacity={0.2}
                        >
                            <animateMotion
                                dur={`${dur}s`}
                                repeatCount="indefinite"
                                path={edgePath}
                                begin={fmtBegin(tailSec)}
                                calcMode="paced"
                            />
                        </circle>,

                        // ── Mid ghost (semi-transparent, blends into head) ──
                        <circle
                            key={`mid-${ballIdx}`}
                            r={headR * 0.6}
                            fill="#222222"
                            stroke={ballColor}
                            strokeWidth={1}
                            opacity={0.45}
                        >
                            <animateMotion
                                dur={`${dur}s`}
                                repeatCount="indefinite"
                                path={edgePath}
                                begin={fmtBegin(midSec)}
                                calcMode="paced"
                            />
                        </circle>,

                        // ── Head (frontmost — full glow) ──
                        <circle
                            key={`head-${ballIdx}`}
                            r={headR}
                            fill="#222222"
                            stroke={ballColor}
                            strokeWidth={ballCount > 1 ? 2.2 : 2.8}
                            style={{
                                filter: `drop-shadow(0 0 ${ballCount > 1 ? 5 : 8}px ${ballColor})`,
                            }}
                        >
                            <animateMotion
                                dur={`${dur}s`}
                                repeatCount="indefinite"
                                path={edgePath}
                                begin={fmtBegin(headSec)}
                                calcMode="paced"
                            />
                        </circle>,
                    ];
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
