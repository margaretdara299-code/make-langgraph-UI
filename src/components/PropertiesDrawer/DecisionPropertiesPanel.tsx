import { Form, Input, Select, Button, Typography, Tag, Divider, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Split, Trash2, Plus } from 'lucide-react';

const { Text, Title } = Typography;

const OPERATORS = [
    { value: '==',       label: 'Equals (==)' },
    { value: '!=',       label: 'Not Equals (!=)' },
    { value: '>',        label: 'Greater Than (>)' },
    { value: '<',        label: 'Less Than (<)' },
    { value: '>=',       label: 'Greater or Equal (>=)' },
    { value: '<=',       label: 'Less or Equal (<=)' },
    { value: 'contains', label: 'Contains' },
    { value: 'exists',   label: 'Exists (not null)' },
    { value: 'is_true',  label: 'Is True' },
    { value: 'is_false', label: 'Is False' },
];

interface DecisionPropertiesPanelProps {
    form: any;
    nodes?: any[];
}

// --- Condition row ---

const ConditionRow = ({ cField, cIndex, field, removeCond, availableOutputKeys }: any) => {
    return (
        <div className="senior-condition-row-container">
            {/* AND / OR pill between conditions */}
            {cIndex > 0 && (
                <div className="senior-operator-pill-wrap">
                    <Form.Item {...field} name={[field.name, 'match_type']} noStyle initialValue="OR">
                        <Select
                            size="small"
                            className="senior-operator-toggle-select"
                            popupMatchSelectWidth={false}
                            options={[{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }]}
                        />
                    </Form.Item>
                </div>
            )}

            <div className="senior-condition-row">
                <div className="senior-expression-group">
                    {/* Field Path + Value Source — stacked vertically, full width each */}
                    <div className="senior-match-condition-group">
                        {/* Value Source — label row WITH delete button */}
                        <div className="senior-cond-field-group">
                            <div className="senior-cond-label-row">
                                <span className="senior-cond-label">Value Source <span style={{ fontSize: '10px', color: '#94a3b8' }}>(State Key or Node Key)</span></span>
                                <Tooltip title="Delete Condition">
                                    <Button type="text" size="small" icon={<Trash2 size={13} />} onClick={() => removeCond(cField.name)} className="senior-cond-delete" />
                                </Tooltip>
                            </div>
                            <div className="senior-sub-block source-col">
                                <Form.Item {...cField} name={[cField.name, 'root_key']} noStyle>
                                    <Select
                                        placeholder="Which state"
                                        size="small"
                                        variant="borderless"
                                        className="senior-inner-select"
                                        options={availableOutputKeys}
                                        showSearch
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* Field Path — label only, no delete button */}
                        <div className="senior-cond-field-group">
                            <span className="senior-cond-label">Field Path</span>
                            <div className="senior-sub-block path-wrap">
                                <Form.Item {...cField} name={[cField.name, 'field']} noStyle rules={[{ required: true, message: '' }]}>
                                    <Input
                                        placeholder="e.g. data.items.token"
                                        size="small"
                                        variant="borderless"
                                        className="senior-inner-input"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    {/* Operator + Compare With */}
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
                                        popupMatchSelectWidth={190}
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
                                const noVal = op === 'exists' || op === 'is_true' || op === 'is_false';
                                return !noVal ? (
                                    <div className="senior-cond-field-group">
                                        <span className="senior-cond-label">Compare With</span>
                                        <div className="senior-value-block">
                                            <Form.Item {...cField} name={[cField.name, 'value']} noStyle>
                                                <Input placeholder="e.g. 1, yes, approved" size="small" variant="borderless" className="senior-inner-input value-input" />
                                            </Form.Item>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="senior-cond-field-group">
                                        <span className="senior-cond-label">Compare With</span>
                                        <div className="senior-empty-value">No value needed</div>
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

// --- Branch (Route) card ---

const BranchItem = ({ field, index, remove, availableOutputKeys }: any) => {
    return (
        <div
            className="senior-rule-group-container"
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            {/* Branch separator */}
            {index > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 12px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-medium)' }} />
                    <div style={{ padding: '0 12px' }}>
                        <Form.Item {...field} name={[field.name, 'branch_match_type']} noStyle initialValue="OR">
                            <Select
                                size="small"
                                className="senior-operator-toggle-select"
                                style={{ right: 'auto', top: 'auto', bottom: 'auto' }}
                                popupMatchSelectWidth={false}
                                options={[{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }]}
                            />
                        </Form.Item>
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-medium)' }} />
                </div>
            )}

            <div className="senior-rule-group">
                {/* Branch header */}
                <div className="senior-rule-header">
                    <div className="branch-label">BRANCH {index + 1}</div>
                    <div className="branch-name-input-wrap">
                        <Form.Item {...field} name={[field.name, 'label']} noStyle rules={[{ required: true }]}>
                            <Input className="senior-branch-name-header-input" variant="borderless" placeholder="Enter branch name..." />
                        </Form.Item>
                    </div>
                    <div className="header-right">
                        <Tooltip title="Delete Branch">
                            <Button type="text" size="small" icon={<Trash2 size={15} />} onClick={() => remove(field.name)} className="branch-delete-action" />
                        </Tooltip>
                    </div>
                </div>

                {/* Column headers */}
                <div className="senior-rule-content">
                    <Form.List name={[field.name, 'conditions']}>
                        {(condFields, { add: addCond, remove: removeCond }) => (
                            <div className="senior-conditions-wrapper">
                                {condFields.map((cField, cIndex) => (
                                    <ConditionRow
                                        key={cField.key}
                                        cField={cField}
                                        cIndex={cIndex}
                                        field={field}
                                        removeCond={removeCond}
                                        availableOutputKeys={availableOutputKeys}
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
            </div>
        </div>
    );
};

// --- Main panel ---

export default function DecisionPropertiesPanel({ nodes = [] }: DecisionPropertiesPanelProps) {
    const availableOutputKeys = Array.from(new Set(
        nodes
            .map(n => n.data?.configurations_json?.output_key)
            .filter(key => typeof key === 'string' && key.trim() !== '')
    )).map(key => ({ label: key, value: key }));

    return (
        <div className="decision-props">

            {/* Header */}
            <div className="decision-props__banner">
                <div className="decision-props__banner-content">
                    <div className="decision-props__banner-left">
                        <div className="decision-props__banner-title">
                            <div className="decision-props__icon-wrap">
                                <Split size={14} color="#6366f1" />
                            </div>
                            <Title level={5} className="decision-props__title">Decision Rules</Title>
                        </div>
                    </div>
                </div>
            </div>

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
                                availableOutputKeys={availableOutputKeys}
                            />
                        ))}
                        <Button
                            type="primary"
                            className="senior-add-branch-btn"
                            onClick={() => add({
                                id: 'branch_' + Date.now(),
                                label: `Branch ${fields.length + 1}`,
                                match_type: 'OR',
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
                    <span className="fallback-label">Fallback Path</span>
                    <Tag className="fallback-tag">DEFAULT</Tag>
                </div>
                <Text type="secondary" className="fallback-description">
                    This branch is taken if no other rules match above.
                </Text>
            </div>
        </div>
    );
}
