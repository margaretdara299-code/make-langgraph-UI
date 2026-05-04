/**
 * MergePropertiesPanel - Configuration panel for Parallel Merge (Join) nodes.
 *
 * Sections:
 *  1. Basic Details
 *  2. Incoming Branches (read-only, derived from React Flow edges)
 *  3. Merge Rules
 *  4. Output Settings
 *  5. Connection Guidance
 */

import React, { useMemo } from 'react';
import { Form, Input, Select, Divider, Typography, Tag } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { Node, Edge } from '@xyflow/react';

const { Text } = Typography;

interface MergePropertiesPanelProps {
    form: FormInstance;
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string;
}

const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children, className
}) => (
    <div className={['properties-drawer__section-title', className].filter(Boolean).join(' ')}>
        {children}
    </div>
);

export default function MergePropertiesPanel(props: MergePropertiesPanelProps) {
    const { nodes, edges, selectedNodeId } = props;

    const incomingEdges = useMemo(
        () => edges.filter((edge) => edge.target === selectedNodeId),
        [edges, selectedNodeId]
    );

    const outgoingEdges = useMemo(
        () => edges.filter((edge) => edge.source === selectedNodeId),
        [edges, selectedNodeId]
    );

    const incomingBranches = useMemo(
        () =>
            incomingEdges.map((edge) => {
                const sourceNode = nodes.find((node) => node.id === edge.source);
                const sourceNodeData = sourceNode?.data as any;
                const sourceLabel = sourceNodeData?.label || sourceNodeData?.name || edge.source;
                const branchId = edge.sourceHandle || null;
                return { edge, sourceLabel, branchId };
            }),
        [incomingEdges, nodes]
    );

    const hasIncoming = incomingBranches.length > 0;
    const hasOutgoing = outgoingEdges.length > 0;

    const warnings = useMemo(() => {
        const messages: string[] = [];

        if (!hasIncoming) {
            messages.push('No branches connected. Connect Action nodes from a Split flow into this Merge node.');
        } else if (incomingBranches.length < 2) {
            messages.push('Merge typically receives 2 or more branches. Currently only 1 is connected.');
        }

        if (!hasOutgoing) {
            messages.push('No outgoing connection. Connect Merge to the next node so the flow can continue.');
        }

        return messages;
    }, [hasIncoming, hasOutgoing, incomingBranches.length]);

    return (
        <>
            <SectionTitle className="pd-section-title-first">Incoming Branches</SectionTitle>
            <Text type="secondary" className="pd-state-description pd-state-description--compact">
                These are the branches currently connected into this Merge node.
                Branches are defined on the upstream Split node.
            </Text>

            {!hasIncoming ? (
                <div className="pd-empty-panel">
                    <Text type="secondary" className="pd-empty-panel__text">
                        No branches connected yet.<br />
                        Connect Action nodes from a Split flow into this Merge node.
                    </Text>
                </div>
            ) : (
                <div className="pd-card-list">
                    {incomingBranches.map(({ edge, sourceLabel, branchId }) => (
                        <div key={edge.id} className="pd-card-row">
                            <CheckCircleOutlined className="pd-text-success" />
                            <div className="pd-card-row__content">
                                <div className="pd-card-row__title">{sourceLabel}</div>
                                {branchId && <div className="pd-card-row__meta">handle: {branchId}</div>}
                            </div>
                            <Tag className="pd-tag-xs">Connected</Tag>
                        </div>
                    ))}
                </div>
            )}

            <Divider className="pd-divider-compact" />

            <SectionTitle className="pd-section-title-compact">Merge Rules</SectionTitle>

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
                            label: <span className="pd-option-muted">Wait for required branches only - <em>Coming soon</em></span>,
                            value: 'wait_required',
                            disabled: true,
                        },
                        {
                            label: <span className="pd-option-muted">Continue after first success - <em>Coming soon</em></span>,
                            value: 'first_success',
                            disabled: true,
                        },
                        {
                            label: <span className="pd-option-muted">Collect all results and errors - <em>Coming soon</em></span>,
                            value: 'collect_all',
                            disabled: true,
                        },
                    ]}
                />
            </Form.Item>

            <Form.Item label="What if a branch has an error?" name="on_branch_error">
                <Select
                    options={[
                        { label: 'Fail the entire merge', value: 'fail_merge' },
                        { label: 'Continue with partial results', value: 'continue_partial' },
                    ]}
                />
            </Form.Item>

            <Form.Item
                label="Wait Timeout (seconds)"
                name="timeout_seconds"
                extra="Max seconds to wait for all branches before timing out. Leave empty for no timeout."
            >
                <Input type="number" min={0} placeholder="e.g. 60" className="pd-input-mono" />
            </Form.Item>

            <Divider className="pd-divider-compact" />

            <SectionTitle className="pd-section-title-compact">Output Settings</SectionTitle>

            <Form.Item
                label="Merged Result Key"
                name="output_key"
                extra="The state key under which merged results will be stored"
            >
                <Input placeholder="merged_parallel_results" className="pd-input-mono" />
            </Form.Item>

            <Divider className="pd-divider-compact" />

            <SectionTitle className="pd-section-title-compact">Connection Guidance</SectionTitle>

            {!hasIncoming && !hasOutgoing ? (
                <Text type="secondary" className="pd-state-description">
                    Connect parallel branch actions into this Merge node, then connect Merge to the next node.
                </Text>
            ) : hasIncoming && !hasOutgoing ? (
                <Text type="secondary" className="pd-state-description">
                    Branches are connected. Now connect Merge to the next node so the flow can continue.
                </Text>
            ) : hasIncoming && hasOutgoing ? (
                <Text className="pd-state-description pd-text-success">
                    Merge is ready. It will wait for {incomingBranches.length} branch{incomingBranches.length !== 1 ? 'es' : ''} and continue to the next node.
                </Text>
            ) : (
                <Text type="secondary" className="pd-state-description">
                    Connect parallel branch actions into this Merge node.
                </Text>
            )}

            {warnings.length > 0 && (
                <div className="pd-warning-panel">
                    {warnings.map((warning, index) => (
                        <div key={index} className="pd-warning-item">
                            <WarningOutlined className="pd-warning-icon" />
                            <Text className="pd-warning-text">{warning}</Text>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
