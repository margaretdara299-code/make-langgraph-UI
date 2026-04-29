/**
 * MergePropertiesPanel — Configuration panel for Parallel Merge (Join) nodes.
 *
 * Sections:
 *  1. Basic Details
 *  2. Incoming Branches (read-only, derived from React Flow edges)
 *  3. Merge Rules
 *  4. Output Settings
 *  5. Connection Guidance
 */

import React, { useMemo } from 'react';
import { Form, Input, Select, Switch, Divider, Typography, Tag } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { Node, Edge } from '@xyflow/react';

const { Text } = Typography;

/* ─── Types ────────────────────────────────────────────────── */

interface MergePropertiesPanelProps {
    form: FormInstance;
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string;
}

/* ─── Section Header ─────────────────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
    children, style
}) => (
    <div className="properties-drawer__section-title" style={{ marginTop: 20, ...style }}>
        {children}
    </div>
);

/* ─── Main Panel ─────────────────────────────────────────────── */
export default function MergePropertiesPanel({
    form,
    nodes,
    edges,
    selectedNodeId,
}: MergePropertiesPanelProps) {

    // Discover incoming edges (sources) and outgoing edge (sink)
    const incomingEdges = useMemo(
        () => edges.filter(e => e.target === selectedNodeId),
        [edges, selectedNodeId]
    );
    const outgoingEdges = useMemo(
        () => edges.filter(e => e.source === selectedNodeId),
        [edges, selectedNodeId]
    );

    // Enrich incoming edges with source node labels and branch info
    const incomingBranches = useMemo(() =>
        incomingEdges.map(e => {
            const sourceNode = nodes.find(n => n.id === e.source);
            const sourceLabel = (sourceNode?.data as any)?.label || e.source;
            const branchId = e.sourceHandle || null;
            return { edge: e, sourceNode, sourceLabel, branchId };
        }),
        [incomingEdges, nodes]
    );

    const hasIncoming = incomingBranches.length > 0;
    const hasOutgoing = outgoingEdges.length > 0;

    // Derive validation warnings
    const warnings = useMemo(() => {
        const msgs: string[] = [];
        if (!hasIncoming) {
            msgs.push('No branches connected. Connect Action nodes from a Split flow into this Merge node.');
        } else if (incomingBranches.length < 2) {
            msgs.push('Merge typically receives 2 or more branches. Currently only 1 is connected.');
        }
        if (!hasOutgoing) {
            msgs.push('No outgoing connection. Connect Merge to the next node so the flow can continue.');
        }
        return msgs;
    }, [hasIncoming, hasOutgoing, incomingBranches.length]);

    return (
        <>
            {/* ── 2. Incoming Branches (read-only) ──────────────────── */}
            <SectionTitle style={{ marginTop: 0 }}>Incoming Branches</SectionTitle>
            <Text type="secondary" className="pd-state-description" style={{ marginBottom: 12 }}>
                These are the branches currently connected into this Merge node.
                Branches are defined on the upstream Split node.
            </Text>

            {!hasIncoming ? (
                <div style={{
                    padding: '14px',
                    border: '1px dashed var(--border-light)',
                    borderRadius: 6,
                    marginBottom: 12,
                    textAlign: 'center',
                }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        No branches connected yet.<br />
                        Connect Action nodes from a Split flow into this Merge node.
                    </Text>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {incomingBranches.map(({ edge, sourceLabel, branchId }) => (
                        <div
                            key={edge.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 10px',
                                background: 'var(--surface-0, #fff)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 6,
                            }}
                        >
                            <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{sourceLabel}</div>
                                {branchId && (
                                    <div style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                                        handle: {branchId}
                                    </div>
                                )}
                            </div>
                            <Tag style={{ fontSize: 10 }}>Connected</Tag>
                        </div>
                    ))}
                </div>
            )}

            <Divider style={{ margin: '14px 0' }} />

            {/* ── 3. Merge Rules ────────────────────────────────────── */}
            <SectionTitle style={{ marginTop: 4 }}>Merge Rules</SectionTitle>

            <Form.Item
                label="When should merge continue?"
                name="merge_strategy"
                extra="Defines which branches must complete before the workflow moves forward."
            >
                <Select
                    options={[
                        { label: 'Wait for connected branches (default)', value: 'wait_selected' },
                        { label: 'Wait for all incoming branches', value: 'wait_all' },
                        {
                            label: <span style={{ color: 'var(--text-subtle)' }}>Wait for required branches only — <em>Coming soon</em></span>,
                            value: 'wait_required',
                            disabled: true,
                        },
                        {
                            label: <span style={{ color: 'var(--text-subtle)' }}>Continue after first success — <em>Coming soon</em></span>,
                            value: 'first_success',
                            disabled: true,
                        },
                        {
                            label: <span style={{ color: 'var(--text-subtle)' }}>Collect all results and errors — <em>Coming soon</em></span>,
                            value: 'collect_all',
                            disabled: true,
                        },
                    ]}
                />
            </Form.Item>

            <Form.Item
                label="What if a branch has an error?"
                name="on_branch_error"
            >
                <Select
                    options={[
                        { label: 'Fail the entire merge', value: 'fail_merge' },
                        { label: 'Continue with partial results', value: 'continue_partial' },
                    ]}
                />
            </Form.Item>

            <Divider style={{ margin: '14px 0' }} />

            {/* ── 4. Output Settings ───────────────────────────────── */}
            <SectionTitle style={{ marginTop: 4 }}>Output Settings</SectionTitle>

            <Form.Item
                label="Merged Result Key"
                name="output_key"
                extra="The state key under which merged results will be stored"
            >
                <Input placeholder="merged_parallel_results" style={{ fontFamily: 'monospace' }} />
            </Form.Item>


            <Divider style={{ margin: '14px 0' }} />

            {/* ── 5. Connection Guidance ────────────────────────────── */}
            <SectionTitle style={{ marginTop: 4 }}>Connection Guidance</SectionTitle>

            {!hasIncoming && !hasOutgoing ? (
                <Text type="secondary" className="pd-state-description">
                    Connect parallel branch actions into this Merge node, then connect Merge to the next node.
                </Text>
            ) : hasIncoming && !hasOutgoing ? (
                <Text type="secondary" className="pd-state-description">
                    ✓ Branches are connected. Now connect Merge to the next node so the flow can continue.
                </Text>
            ) : hasIncoming && hasOutgoing ? (
                <Text className="pd-state-description" style={{ color: 'var(--color-success)' }}>
                    ✓ Merge is ready. It will wait for {incomingBranches.length} branch{incomingBranches.length !== 1 ? 'es' : ''} and continue to the next node.
                </Text>
            ) : (
                <Text type="secondary" className="pd-state-description">
                    Connect parallel branch actions into this Merge node.
                </Text>
            )}

            {/* ── Validation warnings ──────────────────────────────── */}
            {warnings.length > 0 && (
                <div style={{
                    marginTop: 14,
                    padding: '10px 12px',
                    background: 'var(--color-warning-bg, #fffbeb)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}>
                    {warnings.map((w, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <WarningOutlined style={{ color: 'var(--color-warning)', marginTop: 2 }} />
                            <Text style={{ fontSize: 12 }}>{w}</Text>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
