import { Form, Input, Select, Button, Typography, Tag, Divider, Tooltip, AutoComplete } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { GitBranch, Trash2, Plus, Info } from 'lucide-react';

const { Text } = Typography;

// ── Branch accent colors — matched to handle slot order ──────────────────
const BRANCH_COLORS = [
    { stroke: '#EA580C', bg: '#FFF7ED', light: 'rgba(234,88,12,0.08)'  }, // orange
    { stroke: '#2563EB', bg: '#EFF6FF', light: 'rgba(37,99,235,0.08)'  }, // blue
    { stroke: '#059669', bg: '#ECFDF5', light: 'rgba(5,150,105,0.08)'  }, // green
    { stroke: '#7C3AED', bg: '#F5F3FF', light: 'rgba(124,58,237,0.08)' }, // purple
    { stroke: '#DB2777', bg: '#FDF2F8', light: 'rgba(219,39,119,0.08)' }, // pink
    { stroke: '#0369A1', bg: '#F0F9FF', light: 'rgba(3,105,161,0.08)'  }, // sky
];
const branchColor = (index: number) => BRANCH_COLORS[index % BRANCH_COLORS.length];

// ── Operators ─────────────────────────────────────────────────────────────
const OPERATORS = [
    { value: '==',          label: '== Equals'              },
    { value: '!=',          label: '!= Not Equals'          },
    { value: '>',           label: '>  Greater Than'        },
    { value: '<',           label: '<  Less Than'           },
    { value: '>=',          label: '>= Greater or Equal'    },
    { value: '<=',          label: '<= Less or Equal'       },
    { value: 'contains',    label: 'Contains'               },
    { value: 'not_contains', label: 'Not Contains'          },
    { value: 'starts_with', label: 'Starts With'            },
    { value: 'ends_with',   label: 'Ends With'              },
    { value: 'in',          label: 'In List'                },
    { value: 'not_in',      label: 'Not In List'            },
    { value: 'is_empty',    label: 'Is Empty'               },
    { value: 'is_not_empty', label: 'Is Not Empty'          },
    { value: 'exists',      label: 'Exists (not null)'      },
    { value: 'is_true',     label: 'Is True'                },
    { value: 'is_false',    label: 'Is False'               },
];

// No-value operators — "Compare With" field hidden for these
const NO_VALUE_OPS = new Set(['exists', 'is_true', 'is_false', 'is_empty', 'is_not_empty']);

// ── CEL expression preview builder ────────────────────────────────────────
function buildConditionPreview(conditions: any[], matchType: string = 'AND'): string {
    if (!Array.isArray(conditions) || conditions.length === 0) return '';

    const parts = conditions
        .filter(c => c?.field)
        .map(c => {
            const field = c.root_key ? `${c.root_key}.${c.field}` : c.field;
            const op    = c.operator || '==';
            const val   = c.value !== undefined && c.value !== '' ? c.value : '?';

            if (NO_VALUE_OPS.has(op)) {
                if (op === 'exists')        return `${field} != null`;
                if (op === 'is_true')       return `${field} == true`;
                if (op === 'is_false')      return `${field} == false`;
                if (op === 'is_empty')      return `${field} == ""`;
                if (op === 'is_not_empty')  return `${field} != ""`;
            }
            if (op === 'contains')     return `"${val}" in ${field}`;
            if (op === 'not_contains') return `!("${val}" in ${field})`;
            if (op === 'starts_with')  return `${field}.startsWith("${val}")`;
            if (op === 'ends_with')    return `${field}.endsWith("${val}")`;
            if (op === 'in')           return `${field} in [${val}]`;
            if (op === 'not_in')       return `!(${field} in [${val}])`;

            const needsQuotes = isNaN(Number(val)) && val !== 'true' && val !== 'false';
            return `${field} ${op} ${needsQuotes ? `"${val}"` : val}`;
        });

    if (parts.length === 0) return '';
    return parts.join(` ${matchType} `);
}

// ── Props ──────────────────────────────────────────────────────────────────
interface DecisionPropertiesPanelProps {
    form: any;
    nodes?: any[];
    availableStateKeys?: { value: string }[];
}

// ── Condition Row ──────────────────────────────────────────────────────────
const ConditionRow = ({ cField, cIndex, field, removeCond, stateKeyOptions }: any) => {
    return (
        <div className="senior-condition-row-container">
            {/* AND / OR connector pill between conditions */}
            {cIndex > 0 && (
                <div className="senior-operator-pill-wrap">
                    <Form.Item {...cField} name={[cField.name, 'match_type']} noStyle initialValue="AND">
                        <Select
                            size="small"
                            className="senior-operator-toggle-select"
                            popupMatchSelectWidth={false}
                            options={[
                                { label: 'AND', value: 'AND' },
                                { label: 'OR',  value: 'OR'  },
                            ]}
                        />
                    </Form.Item>
                </div>
            )}

            <div className="senior-condition-row">
                <div className="senior-expression-group">

                    {/* Row 1 — Value Source + Field Path */}
                    <div className="senior-match-condition-group">
                        {/* Value Source */}
                        <div className="senior-cond-field-group">
                            <div className="senior-cond-label-row">
                                <span className="senior-cond-label">
                                    State Variable
                                    <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
                                        (from Start / Action output)
                                    </span>
                                </span>
                                <Tooltip title="Delete Condition">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<Trash2 size={13} />}
                                        onClick={() => removeCond(cField.name)}
                                        className="senior-cond-delete"
                                    />
                                </Tooltip>
                            </div>
                            <div className="senior-sub-block source-col">
                                <Form.Item {...cField} name={[cField.name, 'root_key']} noStyle>
                                    <AutoComplete
                                        placeholder="e.g. claim_id, status"
                                        size="small"
                                        options={stateKeyOptions}
                                        filterOption={(input, option) =>
                                            String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        style={{ width: '100%', fontSize: 12 }}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* Field Path */}
                        <div className="senior-cond-field-group">
                            <span className="senior-cond-label">
                                Field Path
                                <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
                                    (nested: data.items.code)
                                </span>
                            </span>
                            <div className="senior-sub-block path-wrap">
                                <Form.Item {...cField} name={[cField.name, 'field']} noStyle rules={[{ required: true, message: '' }]}>
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
                                <Form.Item {...cField} name={[cField.name, 'operator']} noStyle initialValue="==">
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

                        <Form.Item
                            noStyle
                            shouldUpdate={(prev, cur) =>
                                prev.rules?.[field.name]?.conditions?.[cField.name]?.operator !==
                                cur.rules?.[field.name]?.conditions?.[cField.name]?.operator
                            }
                        >
                            {({ getFieldValue }) => {
                                const op = getFieldValue(['rules', field.name, 'conditions', cField.name, 'operator']);
                                const noVal = NO_VALUE_OPS.has(op);
                                const isListOp = op === 'in' || op === 'not_in';

                                return (
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
                                                <Form.Item {...cField} name={[cField.name, 'value']} noStyle>
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
                                );
                            }}
                        </Form.Item>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Branch Card ────────────────────────────────────────────────────────────
const BranchItem = ({ field, index, remove, stateKeyOptions, form }: any) => {
    const color = branchColor(index);

    // Live CEL preview — rebuild whenever anything in this branch changes
    const conditions = form?.getFieldValue(['rules', field.name, 'conditions']) || [];
    const matchType  = form?.getFieldValue(['rules', field.name, 'match_type']) || 'AND';
    const preview    = buildConditionPreview(conditions, matchType);

    return (
        <div className="senior-rule-group-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
                className="senior-rule-group"
                style={{ borderColor: color.stroke, borderWidth: 1.5 }}
            >
                {/* Branch Header */}
                <div
                    className="senior-rule-header"
                    style={{ background: color.light, borderBottom: `1px solid ${color.bg}` }}
                >
                    {/* Colored handle indicator */}
                    <div style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: color.stroke, flexShrink: 0,
                        boxShadow: `0 0 4px ${color.stroke}55`,
                        transform: 'rotate(45deg)',
                    }} />

                    <div style={{
                        fontSize: 10, fontWeight: 700, color: color.stroke,
                        letterSpacing: '0.04em', flexShrink: 0,
                    }}>
                        BRANCH {index + 1}
                    </div>

                    <div className="branch-name-input-wrap">
                        <Form.Item {...field} name={[field.name, 'label']} noStyle rules={[{ required: true }]}>
                            <Input
                                className="senior-branch-name-header-input"
                                variant="borderless"
                                placeholder="Enter branch name…"
                                style={{ color: color.stroke }}
                            />
                        </Form.Item>
                    </div>

                    <Tooltip title="Delete Branch">
                        <Button
                            type="text"
                            size="small"
                            icon={<Trash2 size={14} />}
                            onClick={() => remove(field.name)}
                            className="branch-delete-action"
                        />
                    </Tooltip>
                </div>

                {/* Conditions */}
                <div className="senior-rule-content">
                    <Form.List name={[field.name, 'conditions']}>
                        {(condFields, { add: addCond, remove: removeCond }) => (
                            <div className="senior-conditions-wrapper">
                                {condFields.length === 0 && (
                                    <div style={{
                                        padding: '10px 14px',
                                        fontSize: 12, color: '#94a3b8',
                                        fontStyle: 'italic',
                                    }}>
                                        No conditions yet — click "Add condition" below.
                                    </div>
                                )}

                                {condFields.map((cField, cIndex) => (
                                    <ConditionRow
                                        key={cField.key}
                                        cField={cField}
                                        cIndex={cIndex}
                                        field={field}
                                        removeCond={removeCond}
                                        stateKeyOptions={stateKeyOptions}
                                    />
                                ))}

                                <div className="senior-add-cond-wrap">
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => addCond({ operator: '==' })}
                                        icon={<Plus size={14} />}
                                        className="senior-add-cond-btn"
                                    >
                                        Add condition
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form.List>
                </div>

                {/* CEL Preview */}
                {preview && (
                    <div style={{
                        padding: '8px 14px 10px',
                        borderTop: `1px solid ${color.bg}`,
                        background: color.bg,
                    }}>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: '#64748b',
                            marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            Expression Preview
                        </div>
                        <div style={{
                            fontFamily: 'monospace', fontSize: 11,
                            color: color.stroke, lineHeight: 1.6,
                            wordBreak: 'break-all',
                            padding: '4px 8px',
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: 6,
                            border: `1px solid ${color.bg}`,
                        }}>
                            {preview}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Panel ─────────────────────────────────────────────────────────────
export default function DecisionPropertiesPanel({
    form,
    nodes = [],
    availableStateKeys = [],
}: DecisionPropertiesPanelProps) {

    // Merge passed-in keys with any from node output_keys (legacy support)
    const legacyKeys = Array.from(new Set(
        nodes
            .map((n: any) => n.data?.configurations_json?.output_key)
            .filter((key: any) => typeof key === 'string' && key.trim() !== '')
    )).map((key: any) => ({ value: key }));

    const stateKeyOptions = [
        ...availableStateKeys,
        ...legacyKeys.filter(k => !availableStateKeys.find(s => s.value === k.value)),
    ];

    const rules: any[] = form?.getFieldValue('rules') || [];

    return (
        <div className="decision-props">

            {/* Header */}
            <div className="decision-props__banner">
                <div className="decision-props__banner-content">
                    <div className="decision-props__banner-left">
                        <div className="decision-props__banner-title">
                            <div className="decision-props__icon-wrap">
                                <GitBranch size={14} color="#EA580C" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                                Decision Rules
                            </span>
                            {rules.length > 0 && (
                                <span style={{
                                    fontSize: 11, fontWeight: 700, color: '#EA580C',
                                    background: 'rgba(234,88,12,0.08)', borderRadius: 5,
                                    padding: '1px 8px',
                                }}>
                                    {rules.length} branch{rules.length !== 1 ? 'es' : ''} + fallback
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Info size={12} color="#94a3b8" />
                    <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                        Each branch gets its own handle on the node. If no branch matches, the <strong>Fallback</strong> handle is taken.
                    </Text>
                </div>
            </div>

            {/* Empty state */}
            {rules.length === 0 && (
                <div style={{
                    padding: '20px 16px',
                    textAlign: 'center',
                    border: '1.5px dashed #e2e8f0',
                    borderRadius: 10,
                    background: '#fafbff',
                }}>
                    <GitBranch size={22} color="#cbd5e1" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
                        No branches yet
                    </div>
                    <div style={{ fontSize: 11, color: '#b0bac9' }}>
                        Click "Add Branch" to define a routing condition.
                    </div>
                </div>
            )}

            {/* Branches */}
            <Form.List name="rules">
                {(fields, { add, remove }) => (
                    <div className="senior-rules-container">
                        {fields.map((field, index) => (
                            <BranchItem
                                key={field.key}
                                field={field}
                                index={index}
                                remove={remove}
                                stateKeyOptions={stateKeyOptions}
                                form={form}
                            />
                        ))}

                        <Button
                            type="primary"
                            className="senior-add-branch-btn"
                            onClick={() => add({
                                id:         `branch_${Date.now()}`,
                                label:      `Branch ${fields.length + 1}`,
                                match_type: 'AND',
                                conditions: [{ operator: '==' }],
                            })}
                            icon={<PlusOutlined />}
                            block
                        >
                            Add Branch
                        </Button>
                    </div>
                )}
            </Form.List>

            <Divider className="decision-props__divider" />

            {/* Default fallback */}
            <div className="decision-props__fallback-section">
                <div className="fallback-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Grey diamond handle indicator */}
                        <div style={{
                            width: 10, height: 10, borderRadius: 2,
                            background: '#94a3b8', transform: 'rotate(45deg)',
                            flexShrink: 0,
                        }} />
                        <span className="fallback-label">Fallback Path</span>
                    </div>
                    <Tag className="fallback-tag">DEFAULT</Tag>
                </div>
                <Text type="secondary" className="fallback-description">
                    This path is taken if <strong>no branch conditions</strong> match at runtime.
                    Always connect this handle to handle unexpected outcomes gracefully.
                </Text>
            </div>
        </div>
    );
}
