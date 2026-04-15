/**
 * DecisionPropertiesPanel — Properties panel for Decision nodes.
 *
 * Lets user configure:
 *   - rules: an array of routing rules
 *     - rule name (generates a handle)
 *     - match type (AND / OR)
 *     - conditions (field, operator, value)
 *
 * NO API call — this node only evaluates conditions and routes flow.
 */

import { Form, Input, Select, Button, Typography, Tag, Divider, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Split } from 'lucide-react';

const { Text, Title } = Typography;

const MATCH_TYPES = [
    { value: 'AND', label: 'AND (All conditions must pass)' },
    { value: 'OR',  label: 'OR (Any condition can pass)' },
];

const OPERATORS = [
    { value: '==',       label: '== equals' },
    { value: '!=',       label: '!= not equals' },
    { value: '>',        label: '>  greater than' },
    { value: '<',        label: '<  less than' },
    { value: '>=',       label: '>= greater or equal' },
    { value: '<=',       label: '<= less or equal' },
    { value: 'contains', label: 'contains' },
    { value: 'exists',   label: 'exists (not null)' },
    { value: 'is_true',  label: 'is true' },
    { value: 'is_false', label: 'is false' },
];

interface DecisionPropertiesPanelProps {
    form: any;
    nodes?: any[];
}

export default function DecisionPropertiesPanel({ form, nodes = [] }: DecisionPropertiesPanelProps) {
    // Extract unique output keys from all provided nodes
    const availableOutputKeys = Array.from(new Set(
        nodes
            .map(n => n.data?.configurations_json?.output_key)
            .filter(key => typeof key === 'string' && key.trim() !== '')
    )).map(key => ({ label: key, value: key }));
    return (
        <div className="decision-props">

            {/* ── Info Banner ── */}
            <div className="decision-props__banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                <Tag color="gold" icon={<Split size={12} />} style={{ marginBottom: 0, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '4px' }}>ROUTER</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Create multiple routing rules. Each rule generates a distinct output port on the canvas that you can connect to any target node.
                </Text>
            </div>

            <div className="properties-drawer__section-title" style={{ marginTop: 0 }}>Routing Rules</div>
            
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, lineHeight: '1.5', padding: '0 4px' }}>
                Evaluated top-to-bottom. Rules generate distinct output ports on the canvas. The first rule to match will be executed.
            </Text>

            <Form.List name="rules">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name: fieldName, ...restField }, index) => (
                            <Card 
                                key={key} 
                                size="small" 
                                className="decision-props__rule-card"
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="properties-drawer__meta-value" style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5', fontSize: '10px' }}>
                                            BRANCH {index + 1}
                                        </div>
                                        <Form.Item {...restField} name={[fieldName, 'id']} hidden><Input /></Form.Item>
                                        <Form.Item 
                                            {...restField} 
                                            name={[fieldName, 'label']}
                                            style={{ margin: 0, flex: 1 }}
                                            rules={[{ required: true, message: 'Missing branch name' }]}
                                        >
                                            <Input placeholder="Branch Name" variant="borderless" style={{ fontWeight: 700, padding: 0, fontSize: '13px' }} />
                                        </Form.Item>
                                    </div>
                                }
                                extra={<DeleteOutlined className="properties-drawer__delete-icon" onClick={() => remove(fieldName)} />}
                            >
                                <Form.Item
                                    {...restField}
                                    name={[fieldName, 'match_type']}
                                    label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Match Condition</span>}
                                    initialValue="AND"
                                    style={{ marginBottom: 12 }}
                                >
                                    <Select options={MATCH_TYPES} size="small" style={{ fontSize: 12 }} />
                                </Form.Item>

                                <Form.List name={[fieldName, 'conditions']}>
                                    {(condFields, { add: addCond, remove: removeCond }) => (
                                        <div style={{ paddingLeft: 8, borderLeft: '2px solid rgba(245,158,11,0.2)' }}>
                                            {condFields.map(({ key, name: cName, ...restCField }) => (
                                                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed var(--border-color)' }}>
                                                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                                        <Form.Item 
                                                            {...restCField} 
                                                            name={[cName, 'source_type']} 
                                                            label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Condition Source</span>}
                                                            style={{ marginBottom: 8, flex: 1 }}
                                                            initialValue="custom"
                                                        >
                                                            <Select size="small" style={{ fontSize: 12 }} options={[
                                                                { label: 'State Output (Node Key)', value: 'output_key' },
                                                                { label: 'Custom Parameter', value: 'custom' },
                                                            ]} />
                                                        </Form.Item>
                                                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeCond(cName)} style={{ marginTop: 22, padding: '0 4px' }} />
                                                    </div>

                                                    <Form.Item
                                                        noStyle
                                                        shouldUpdate={(prev, cur) =>
                                                            prev.rules?.[fieldName]?.conditions?.[cName]?.source_type !== cur.rules?.[fieldName]?.conditions?.[cName]?.source_type
                                                        }
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const sType = getFieldValue(['rules', fieldName, 'conditions', cName, 'source_type']) || 'custom';
                                                            
                                                            return sType === 'output_key' ? (
                                                                <div style={{ display: 'flex', gap: 6 }}>
                                                                    <Form.Item 
                                                                        {...restCField} 
                                                                        name={[cName, 'root_key']} 
                                                                        label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Variable Output</span>}
                                                                        style={{ marginBottom: 8, flex: 1 }}
                                                                        rules={[{ required: true, message: 'Req' }]}
                                                                    >
                                                                        <Select 
                                                                            placeholder="Output Key" 
                                                                            size="small" 
                                                                            style={{ fontSize: 12 }}
                                                                            options={availableOutputKeys}
                                                                            showSearch
                                                                        />
                                                                    </Form.Item>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', gap: 6 }}>
                                                                    <Form.Item 
                                                                        {...restCField} 
                                                                        name={[cName, 'field']} 
                                                                        label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Variable Path</span>}
                                                                        style={{ marginBottom: 8, flex: 1 }}
                                                                        rules={[{ required: true, message: 'Req' }]}
                                                                    >
                                                                        <Input placeholder="e.g. data.age" size="small" style={{ fontSize: 12 }} />
                                                                    </Form.Item>
                                                                </div>
                                                            );
                                                        }}
                                                    </Form.Item>

                                                    <Form.Item 
                                                        {...restCField} 
                                                        name={[cName, 'path_suffix']} 
                                                        label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Sub Path</span>}
                                                        style={{ marginBottom: 8, flex: 1 }}
                                                    >
                                                        <Input placeholder="e.g. data.value" size="small" style={{ fontSize: 12 }} />
                                                    </Form.Item>

                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <Form.Item 
                                                            {...restCField} 
                                                            name={[cName, 'operator']} 
                                                            label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Operator</span>}
                                                            style={{ margin: 0, flex: 1 }}
                                                            initialValue="=="
                                                        >
                                                            <Select options={OPERATORS} size="small" style={{ fontSize: 12 }} />
                                                        </Form.Item>
                                                        <Form.Item
                                                            noStyle
                                                            shouldUpdate={(prev, cur) =>
                                                                prev.rules?.[fieldName]?.conditions?.[cName]?.operator !== cur.rules?.[fieldName]?.conditions?.[cName]?.operator
                                                            }
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const op = getFieldValue(['rules', fieldName, 'conditions', cName, 'operator']);
                                                                const noVal = op === 'exists' || op === 'is_true' || op === 'is_false';
                                                                return !noVal ? (
                                                                    <Form.Item 
                                                                        {...restCField} 
                                                                        name={[cName, 'value']} 
                                                                        label={<span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Value</span>}
                                                                        style={{ margin: 0, flex: 1 }}
                                                                    >
                                                                        <Input placeholder="Val" size="small" style={{ fontSize: 12 }} />
                                                                    </Form.Item>
                                                                ) : <div style={{ flex: 1 }}></div>;
                                                            }}
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button type="dashed" size="small" onClick={() => addCond({ source_type: 'custom', field: '', root_key: '', path_suffix: '', operator: '==', value: '' })} icon={<PlusOutlined />} block>
                                                Add Condition
                                            </Button>
                                        </div>
                                    )}
                                </Form.List>
                            </Card>
                        ))}

                        <Button
                            type="dashed"
                            onClick={() => add({ id: 'branch_' + Date.now(), label: `Condition ${fields.length + 1}`, match_type: 'AND', conditions: [] })}
                            icon={<PlusOutlined />}
                            block
                        >
                            Add Routing Branch
                        </Button>
                    </>
                )}
            </Form.List>

            <div className="properties-drawer__section-title">Default Output</div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, lineHeight: '1.5', padding: '0 4px' }}>
                Triggers when <strong>none</strong> of the rules above match.
            </Text>
            <div className="properties-drawer__meta" style={{ margin: 0, background: 'var(--bg-card)' }}>
                <div className="properties-drawer__meta-item">
                    <span className="properties-drawer__meta-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-subtle)' }} />
                        Default Path
                    </span>
                    <span className="properties-drawer__meta-value">FALLBACK</span>
                </div>
            </div>
        </div>
    );
}
