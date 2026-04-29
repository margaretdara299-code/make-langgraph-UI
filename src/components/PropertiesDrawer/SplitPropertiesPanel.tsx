/**
 * SplitPropertiesPanel — Full configuration panel for Parallel Split nodes.
 *
 * Sections:
 *  1. Basic Details
 *  2. Split Mode
 *  3. Source Data (for condition evaluation)
 *  4. Parallel Branches (dynamic branch list)
 *  5. Execution Rules
 *  6. Output & Error Handling
 *  7. Connection Guidance (read-only)
 */

import React, { useCallback, useMemo } from 'react';
import {
    Form, Input, Select, Switch, Button, Divider, Typography, Tag, Tooltip
} from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Trash2, Plus } from 'lucide-react';
import type { FormInstance } from 'antd';
import type { Node, Edge } from '@xyflow/react';

const { Text } = Typography;

/* ─── Types ────────────────────────────────────────────────── */

interface SplitBranchCondition {
    field: string;
    operator: string;
    value?: string;
}

interface SplitBranch {
    id: string;
    label: string;
    required: boolean;
    description?: string;
    conditions?: SplitBranchCondition[];
    condition_match_type?: 'all' | 'any';
}

interface SplitPropertiesPanelProps {
    form: FormInstance;
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string;
    availableStateKeys: { value: string }[];
}

/* ─── Constants ─────────────────────────────────────────────── */

const OPERATORS = [
    { value: '==', label: '== Equals' },
    { value: '!=', label: '!= Not Equals' },
    { value: '>', label: '>  Greater Than' },
    { value: '<', label: '<  Less Than' },
    { value: '>=', label: '>= Greater or Equal' },
    { value: '<=', label: '<= Less or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'in', label: 'In List' },
    { value: 'not_in', label: 'Not In List' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
    { value: 'exists', label: 'Exists (not null)' },
    { value: 'is_true', label: 'Is True' },
    { value: 'is_false', label: 'Is False' },
];

const NO_VALUE_OPS = new Set(['exists', 'is_true', 'is_false', 'is_empty', 'is_not_empty']);

/* ─── Slug helper ────────────────────────────────────────────── */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^[^a-z]/, match => `b_${match}`)
        .slice(0, 40) || 'branch';
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
export default function SplitPropertiesPanel({
    form,
    nodes,
    edges,
    selectedNodeId,
    availableStateKeys,
}: SplitPropertiesPanelProps) {

    // Watch reactive form values for conditional rendering
    const splitMode: string = Form.useWatch('split_mode', form) || 'parallel_all';
    const sourceScope: string = Form.useWatch('source_scope', form) || 'state';
    const branches: SplitBranch[] = Form.useWatch('branches', form) || [];

    /* ── Upstream nodes (before this split in the graph) ──────── */
    const upstreamNodes = useMemo(() => {
        const connected = new Set<string>();
        edges
            .filter(e => e.target === selectedNodeId)
            .forEach(e => connected.add(e.source));
        return nodes.filter(n => connected.has(n.id));
    }, [nodes, edges, selectedNodeId]);

    /* ── Connection status per branch ────────────────────────── */
    const connectedBranchIds = useMemo(() => {
        const map: Record<string, { targetNodeId: string; targetLabel: string }> = {};
        edges
            .filter(e => e.source === selectedNodeId)
            .forEach(e => {
                if (e.sourceHandle) {
                    const targetNode = nodes.find(n => n.id === e.target);
                    map[e.sourceHandle] = {
                        targetNodeId: e.target,
                        targetLabel: (targetNode?.data as any)?.label || e.target,
                    };
                }
            });
        return map;
    }, [edges, nodes, selectedNodeId]);

    /* ── Auto-generate branch id from label ─────────────────── */
    const handleBranchLabelChange = useCallback((fieldName: number, newLabel: string) => {
        const currentBranches = form.getFieldValue('branches') || [];
        const currentId = currentBranches[fieldName]?.id;
        // Only auto-generate if id is still unset or matches a previous auto-gen
        const expectedId = slugify((currentBranches[fieldName]?.label || ''));
        if (!currentId || currentId === expectedId) {
            const newId = slugify(newLabel);
            const newBranches = [...currentBranches];
            newBranches[fieldName] = { ...newBranches[fieldName], label: newLabel, id: newId };
            form.setFieldValue('branches', newBranches);
        }
    }, [form]);

    /* ── Validation warnings ─────────────────────────────────── */
    const warnings = useMemo(() => {
        const msgs: string[] = [];
        if (branches.length === 0) {
            msgs.push('Add at least two branches to create parallel output connectors.');
        } else if (branches.length === 1) {
            msgs.push('Add at least one more branch — parallel split requires 2+ branches.');
        }
        const ids = branches.map(b => b.id).filter(Boolean);
        const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
        if (duplicates.length > 0) {
            msgs.push(`Duplicate branch keys detected: ${[...new Set(duplicates)].join(', ')}`);
        }
        if (splitMode === 'parallel_conditional') {
            branches.forEach(b => {
                if (!b.conditions || b.conditions.length === 0) {
                    msgs.push(`Branch "${b.label || b.id}" has no conditions defined.`);
                }
            });
        }
        return msgs;
    }, [branches, splitMode]);

    return (
        <>
            {/* ── 1. Basic Details ──────────────────────────────────── */}
            <SectionTitle style={{ marginTop: 0 }}>Basic Details</SectionTitle>
            <Text type="secondary" className="pd-state-description" style={{ marginBottom: 12 }}>
                A Split node starts multiple branches at the same time. Use it when the next actions can run independently.
            </Text>



            {/* ── 2. Split Mode ──────────────────────────────────────── */}
            <SectionTitle style={{ marginTop: 4 }}>Split Mode</SectionTitle>
            <Form.Item label="How should this split run?" name="split_mode">
                <Select
                    options={[
                        {
                            label: (
                                <span>
                                    <strong>Run all branches</strong>
                                    <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>
                                        — Every configured branch runs in parallel
                                    </span>
                                </span>
                            ),
                            value: 'parallel_all',
                        },
                        {
                            label: (
                                <span>
                                    <strong>Run matching branches</strong>
                                    <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>
                                        — Evaluate conditions; all matched branches run
                                    </span>
                                </span>
                            ),
                            value: 'parallel_conditional',
                        },
                        {
                            label: (
                                <span style={{ color: 'var(--text-subtle)' }}>
                                    Run for each item in a list — <em>Coming soon</em>
                                </span>
                            ),
                            value: 'parallel_map',
                            disabled: true,
                        },
                    ]}
                />
            </Form.Item>

            {splitMode === 'parallel_conditional' && (
                <>
                    <Divider style={{ margin: '14px 0' }} />

                    {/* ── 3. Source Data ─────────────────────────────────── */}
                    <SectionTitle style={{ marginTop: 4 }}>Source Data for Conditions</SectionTitle>
                    <Text type="secondary" className="pd-state-description" style={{ marginBottom: 12 }}>
                        Branch conditions are evaluated against this source data.
                        For example, use <code>claim.amount &gt; 5000</code> to run a high-dollar review branch.
                    </Text>

                    <Form.Item label="Evaluate conditions using" name="source_scope">
                        <Select
                            options={[
                                { label: 'Workflow State', value: 'state' },
                                { label: 'Previous Node Output', value: 'previous_node' },
                                { label: 'Specific Node Output', value: 'specific_node' },
                            ]}
                        />
                    </Form.Item>

                    {(sourceScope === 'previous_node' || sourceScope === 'specific_node') && (
                        <Form.Item
                            label={sourceScope === 'specific_node' ? 'Specific Node' : 'Previous Node'}
                            name="source_node_id"
                        >
                            <Select
                                showSearch
                                placeholder="Select a node"
                                optionFilterProp="label"
                                options={upstreamNodes.map(n => ({
                                    label: `${(n.data as any)?.label || n.id} (${n.id})`,
                                    value: n.id,
                                }))}
                            />
                        </Form.Item>
                    )}

                    <Form.Item label="Output Key" name="source_output_key">
                        <Input placeholder="e.g. response, data, result" style={{ fontFamily: 'monospace' }} />
                    </Form.Item>

                    <Form.Item
                        label="Source Path"
                        name="source_path"
                        extra="Use dot notation: claim.amount, patient.hasInsurance, response.data.status"
                    >
                        <Input placeholder="e.g. claim.amount" style={{ fontFamily: 'monospace' }} />
                    </Form.Item>
                </>
            )}

            <Divider style={{ margin: '14px 0' }} />

            {/* ── 4. Parallel Branches ──────────────────────────────── */}
            <SectionTitle style={{ marginTop: 4 }}>Parallel Branches</SectionTitle>
            <Text type="secondary" className="pd-state-description" style={{ marginBottom: 12 }}>
                Each branch creates one output connector on the Split node.
                Connect each handle to an Action node that should run in parallel.
            </Text>

            <Form.List name="branches">
                {(fields, { add, remove }) => (
                    <>
                        {fields.length === 0 && (
                            <div style={{
                                padding: '14px',
                                border: '1px dashed var(--border-light)',
                                borderRadius: 6,
                                marginBottom: 12,
                                textAlign: 'center',
                            }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    No branches added yet.<br />
                                    Add branches to create output connectors on this Split node.
                                    Each branch can run in parallel.
                                </Text>
                            </div>
                        )}

                        {fields.map(({ key, name: fieldName, ...restField }) => {
                            const branchData = branches[fieldName] as SplitBranch | undefined;
                            const branchId = branchData?.id || '';
                            const connection = connectedBranchIds[branchId];

                            return (
                                <div
                                    key={key}
                                    style={{
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 8,
                                        padding: '12px 12px 8px',
                                        marginBottom: 10,
                                        background: 'var(--surface-0, #fff)',
                                    }}
                                >
                                    {/* Branch header row */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Tag
                                            style={{
                                                background: 'rgba(236,72,153,0.1)',
                                                color: 'var(--color-node-split, #ec4899)',
                                                border: 'none',
                                                fontWeight: 700,
                                                fontSize: 10,
                                            }}
                                        >
                                            Branch {fieldName + 1}
                                        </Tag>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {connection ? (
                                                <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 10 }}>
                                                    → {connection.targetLabel}
                                                </Tag>
                                            ) : (
                                                <Tag icon={<WarningOutlined />} color="default" style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
                                                    Not connected
                                                </Tag>
                                            )}
                                            <DeleteOutlined
                                                style={{ color: 'var(--color-error)', cursor: 'pointer' }}
                                                onClick={() => remove(fieldName)}
                                            />
                                        </div>
                                    </div>

                                    {/* Branch Name */}
                                    <Form.Item
                                        {...restField}
                                        name={[fieldName, 'label']}
                                        rules={[{ required: true, message: 'Branch name required' }]}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Input
                                            placeholder="e.g. Eligibility Check"
                                            onChange={e => handleBranchLabelChange(fieldName, e.target.value)}
                                        />
                                    </Form.Item>

                                    {/* Branch Key */}
                                    <Form.Item
                                        {...restField}
                                        name={[fieldName, 'id']}
                                        label="Branch Key"
                                        extra="Unique key used as the handle ID. Auto-generated from name."
                                        rules={[
                                            { required: true, message: 'Branch key required' },
                                            {
                                                pattern: /^[a-z][a-z0-9_]*$/,
                                                message: 'Must start with a letter, lowercase + underscores only',
                                            },
                                        ]}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Input
                                            placeholder="e.g. eligibility_check"
                                            style={{ fontFamily: 'monospace', fontSize: 12 }}
                                        />
                                    </Form.Item>



                                    {/* ── Condition fields (only for conditional mode) ── */}
                                    {splitMode === 'parallel_conditional' && (
                                        <>
                                            <Divider style={{ margin: '8px 0 10px' }} />
                                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
                                                CONDITIONS
                                            </div>

                                            <Form.List name={[fieldName, 'conditions']}>
                                                {(condFields, { add: addCond, remove: removeCond }) => (
                                                    <>
                                                        {condFields.map(({ key: ck, name: cn, ...cr }, cIndex) => {
                                                            const conds = branches[fieldName]?.conditions || [];
                                                            const op = conds[cn]?.operator || '==';
                                                            const noVal = NO_VALUE_OPS.has(op);
                                                            const isListOp = op === 'in' || op === 'not_in';

                                                            return (
                                                                <div key={ck} className="senior-condition-row-container">
                                                                    {cIndex > 0 && (
                                                                        <div className="senior-operator-pill-wrap">
                                                                            <Form.Item
                                                                                {...restField}
                                                                                name={[fieldName, 'condition_match_type']}
                                                                                initialValue="all"
                                                                                noStyle
                                                                            >
                                                                                <Select
                                                                                    size="small"
                                                                                    className="senior-operator-toggle-select"
                                                                                    popupMatchSelectWidth={false}
                                                                                    options={[
                                                                                        { label: 'AND', value: 'all' },
                                                                                        { label: 'OR', value: 'any' },
                                                                                    ]}
                                                                                />
                                                                            </Form.Item>
                                                                        </div>
                                                                    )}
                                                                    <div className="senior-condition-row">
                                                                        <div className="senior-expression-group">

                                                                            {/* Row 1 — Field Path */}
                                                                            <div className="senior-match-condition-group">
                                                                                <div className="senior-cond-field-group">
                                                                                    <div className="senior-cond-label-row">
                                                                                        <span className="senior-cond-label">
                                                                                            Field Path
                                                                                            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
                                                                                                (nested: data.items.code)
                                                                                            </span>
                                                                                        </span>
                                                                                        <Tooltip title="Delete Condition">
                                                                                            <Button
                                                                                                type="text"
                                                                                                size="small"
                                                                                                icon={<Trash2 size={13} />}
                                                                                                onClick={() => removeCond(cn)}
                                                                                                className="senior-cond-delete"
                                                                                            />
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                    <div className="senior-sub-block path-wrap">
                                                                                        <Form.Item {...cr} name={[cn, 'field']} noStyle rules={[{ required: true, message: '' }]}>
                                                                                            <Input
                                                                                                placeholder="e.g. status or data.result"
                                                                                                size="small"
                                                                                                variant="borderless"
                                                                                                className="senior-inner-input"
                                                                                                style={{ fontFamily: 'monospace', fontSize: 12 }}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Row 2 — Operator + Compare With */}
                                                                            <div className="senior-operator-value-row">
                                                                                <div className="senior-cond-field-group">
                                                                                    <span className="senior-cond-label">Operator</span>
                                                                                    <div className="senior-operator-block">
                                                                                        <Form.Item {...cr} name={[cn, 'operator']} noStyle initialValue="==">
                                                                                            <Select
                                                                                                options={OPERATORS}
                                                                                                size="small"
                                                                                                variant="borderless"
                                                                                                className="senior-inner-select op-select"
                                                                                                placeholder="Operator"
                                                                                                popupMatchSelectWidth={200}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="senior-cond-field-group">
                                                                                    <span className="senior-cond-label">
                                                                                        Compare With
                                                                                        {isListOp && (
                                                                                            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
                                                                                                (comma separated)
                                                                                            </span>
                                                                                        )}
                                                                                    </span>
                                                                                    {noVal ? (
                                                                                        <div className="senior-empty-value">No value needed</div>
                                                                                    ) : (
                                                                                        <div className="senior-value-block">
                                                                                            <Form.Item {...cr} name={[cn, 'value']} noStyle>
                                                                                                <Input
                                                                                                    placeholder={isListOp ? 'val1, val2, val3' : 'e.g. approved, 1, true'}
                                                                                                    size="small"
                                                                                                    variant="borderless"
                                                                                                    className="senior-inner-input value-input"
                                                                                                />
                                                                                            </Form.Item>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="senior-add-cond-wrap" style={{ marginTop: 8 }}>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                onClick={() => addCond({ field: '', operator: '==', value: '' })}
                                                                icon={<Plus size={14} />}
                                                                className="senior-add-cond-btn"
                                                            >
                                                                Add condition
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </Form.List>
                                        </>
                                    )}
                                </div>
                            );
                        })}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add({
                                id: `branch_${Date.now()}`,
                                label: '',
                                required: true,
                                description: '',
                                conditions: [],
                                condition_match_type: 'all',
                            })}
                            block
                            style={{ marginBottom: 4 }}
                        >
                            Add Branch
                        </Button>
                    </>
                )}
            </Form.List>

            <Divider style={{ margin: '14px 0' }} />

            {/* ── 5. Execution Rules ────────────────────────────────── */}
            <SectionTitle style={{ marginTop: 4 }}>Execution Rules</SectionTitle>

            <Form.Item
                label="What if an optional branch fails?"
                name="on_optional_error"
            >
                <Select
                    options={[
                        { label: 'Continue with error', value: 'continue' },
                        { label: 'Stop full flow', value: 'stop_full_flow' },
                        { label: 'Stop the error flow', value: 'stop_error_flow' },
                    ]}
                />
            </Form.Item>

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
