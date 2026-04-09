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
}

export default function DecisionPropertiesPanel({ form }: DecisionPropertiesPanelProps) {
    return (
        <div className="decision-props">

            {/* ── Info Banner ── */}
            <div className="decision-props__banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 12px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px', marginBottom: '4px' }}>
                <Tag color="gold" style={{ marginBottom: 0, width: 'fit-content' }}>⚡ ROUTER ROUTER</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Create multiple routing rules. Each rule generates a distinct output port on the canvas that you can connect to any target node.
                </Text>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* ── Rules List ── */}
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
                Routing Rules
            </Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                Evaluated top-to-bottom. The first rule to match will be executed.
            </Text>

            <Form.List name="rules">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name: fieldName, ...restField }, index) => (
                            <Card 
                                key={key} 
                                size="small" 
                                style={{ marginBottom: 16, borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.01)' }}
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Tag color="orange">Branch {index + 1}</Tag>
                                        <Form.Item {...restField} name={[fieldName, 'id']} hidden><Input /></Form.Item>
                                        <Form.Item 
                                            {...restField} 
                                            name={[fieldName, 'label']}
                                            style={{ margin: 0, flex: 1 }}
                                            rules={[{ required: true, message: 'Missing branch name' }]}
                                        >
                                            <Input placeholder="Branch Name (e.g. High Risk)" size="small" variant="borderless" style={{ fontWeight: 600, padding: 0 }} />
                                        </Form.Item>
                                    </div>
                                }
                                extra={<DeleteOutlined style={{ color: '#ff4d4f' }} onClick={() => remove(fieldName)} />}
                            >
                                <Form.Item
                                    {...restField}
                                    name={[fieldName, 'match_type']}
                                    label="Match Condition"
                                    initialValue="AND"
                                    style={{ marginBottom: 12 }}
                                >
                                    <Select options={MATCH_TYPES} size="small" />
                                </Form.Item>

                                <Form.List name={[fieldName, 'conditions']}>
                                    {(condFields, { add: addCond, remove: removeCond }) => (
                                        <div style={{ paddingLeft: 8, borderLeft: '2px solid rgba(245,158,11,0.2)' }}>
                                            {condFields.map((cField) => (
                                                <div key={cField.key} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
                                                    <Form.Item 
                                                        {...cField} 
                                                        name={[cField.name, 'field']} 
                                                        style={{ margin: 0, flex: 2 }}
                                                        rules={[{ required: true, message: 'Req' }]}
                                                    >
                                                        <Input placeholder="e.g. data.age" size="small" />
                                                    </Form.Item>
                                                    <Form.Item 
                                                        {...cField} 
                                                        name={[cField.name, 'operator']} 
                                                        style={{ margin: 0, flex: 2 }}
                                                        initialValue="=="
                                                    >
                                                        <Select options={OPERATORS} size="small" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        noStyle
                                                        shouldUpdate={(prev, cur) =>
                                                            prev.rules?.[fieldName]?.conditions?.[cField.name]?.operator !== cur.rules?.[fieldName]?.conditions?.[cField.name]?.operator
                                                        }
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const op = getFieldValue(['rules', fieldName, 'conditions', cField.name, 'operator']);
                                                            const noVal = op === 'exists' || op === 'is_true' || op === 'is_false';
                                                            return !noVal ? (
                                                                <Form.Item 
                                                                    {...cField} 
                                                                    name={[cField.name, 'value']} 
                                                                    style={{ margin: 0, flex: 2 }}
                                                                >
                                                                    <Input placeholder="Val" size="small" />
                                                                </Form.Item>
                                                            ) : <div style={{ flex: 2 }}></div>;
                                                        }}
                                                    </Form.Item>
                                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeCond(cField.name)} style={{ padding: '0 4px', marginTop: 2 }} />
                                                </div>
                                            ))}
                                            <Button type="dashed" size="small" onClick={() => addCond({ field: '', operator: '==', value: '' })} icon={<PlusOutlined />} block>
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

            <Divider style={{ margin: '24px 0' }} />

            {/* ── Default fallback branch ── */}
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
                Default Output
            </Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
                This is the fallback port that triggers when <strong>none</strong> of the rules match.
            </Text>
            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <Text strong>Fallback / Default Branch</Text>
            </div>
        </div>
    );
}
