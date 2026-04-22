import { Form, Input, Select, Button, Typography, Tag, Divider, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Split, GripVertical, Trash2, Plus, Info, Search } from 'lucide-react';
import { Reorder, LayoutGroup, useDragControls } from 'framer-motion';

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

// --- Sub-components to handle useDragControls correctly ---

const ConditionRow = ({ cField, cIndex, field, removeCond, moveCond, availableOutputKeys }: any) => {
    const controls = useDragControls();
    return (
        <Reorder.Item 
            key={cField.key} 
            value={cField} 
            layout
            dragListener={false}
            dragControls={controls}
            className="senior-condition-row-container"
            transition={{ type: "spring", stiffness: 600, damping: 45 }}
        >
            {cIndex > 0 && (
                <div className="senior-operator-pill-wrap">
                    <Form.Item {...field} name={[field.name, 'match_type']} noStyle initialValue="OR">
                        <Select size="small" className="senior-operator-toggle-select" popupMatchSelectWidth={false} options={[{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }]} />
                    </Form.Item>
                </div>
            )}

            <div className="senior-condition-row">
                <div 
                    className="senior-drag-handle"
                    onPointerDown={(e) => controls.start(e)}
                    style={{ cursor: 'grab' }}
                >
                    <GripVertical size={14} />
                </div>
                <div className="senior-expression-group">
                    <div className="senior-match-condition-group">
                        <div className="senior-sub-block source-col">
                            <Form.Item {...cField} name={[cField.name, 'source_type']} noStyle initialValue="custom">
                                <Select placeholder="Source" size="small" variant="borderless" className="senior-inner-select" options={[{ label: 'Step Output', value: 'output_key' }, { label: 'Custom Value', value: 'custom' }]} />
                            </Form.Item>
                        </div>
                        <div className="senior-sub-block path-wrap">
                            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.rules?.[field.name]?.conditions?.[cField.name]?.source_type !== cur.rules?.[field.name]?.conditions?.[cField.name]?.source_type}>
                                {({ getFieldValue }) => {
                                    const sType = getFieldValue(['rules', field.name, 'conditions', cField.name, 'source_type']) || 'custom';
                                    return sType === 'output_key' ? (
                                        <Form.Item {...cField} name={[cField.name, 'root_key']} noStyle rules={[{ required: true }]}><Select placeholder="Variable Path" size="small" variant="borderless" options={availableOutputKeys} showSearch /></Form.Item>
                                    ) : (
                                        <Form.Item {...cField} name={[cField.name, 'field']} noStyle rules={[{ required: true }]}><Input placeholder="Field" size="small" variant="borderless" className="senior-inner-input" /></Form.Item>
                                    );
                                }}
                            </Form.Item>
                        </div>
                        <div className="senior-sub-block subpath-wrap">
                            <Form.Item {...cField} name={[cField.name, 'path_suffix']} noStyle><Input placeholder="Path" size="small" variant="borderless" className="senior-inner-input suffix-input" /></Form.Item>
                        </div>
                    </div>
                    
                    <div className="senior-operator-value-row">
                        <div className="senior-operator-block">
                            <Form.Item {...cField} name={[cField.name, 'operator']} noStyle initialValue="=="><Select options={OPERATORS} size="small" variant="borderless" className="senior-inner-select op-select" placeholder="Operator" popupMatchSelectWidth={190} /></Form.Item>
                        </div>
                        <div className="senior-value-block">
                            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.rules?.[field.name]?.conditions?.[cField.name]?.operator !== cur.rules?.[field.name]?.conditions?.[cField.name]?.operator}>
                                {({ getFieldValue }) => {
                                    const op = getFieldValue(['rules', field.name, 'conditions', cField.name, 'operator']);
                                    const noVal = op === 'exists' || op === 'is_true' || op === 'is_false';
                                    return !noVal ? (
                                        <Form.Item {...cField} name={[cField.name, 'value']} noStyle><Input placeholder="Value" size="small" variant="borderless" className="senior-inner-input value-input" /></Form.Item>
                                    ) : <div className="senior-empty-value">No value needed</div>;
                                }}
                            </Form.Item>
                        </div>
                    </div>
                </div>
                <Tooltip title="Delete Condition"><Button type="text" size="small" icon={<Trash2 size={14} />} onClick={() => removeCond(cField.name)} className="senior-cond-delete" /></Tooltip>
            </div>
        </Reorder.Item>
    );
};

const BranchItem = ({ field, index, remove, availableOutputKeys }: any) => {
    const controls = useDragControls();
    return (
        <Reorder.Item 
            key={field.key} 
            value={field} 
            layout
            dragListener={false}
            dragControls={controls}
            initial={{ opacity: 1 }}
            className="senior-rule-group-container"
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            {index > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 12px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-medium)' }}></div>
                    <div style={{ padding: '0 12px' }}>
                        <Form.Item {...field} name={[field.name, 'branch_match_type']} noStyle initialValue="OR">
                            <Select size="small" className="senior-operator-toggle-select" style={{ right: 'auto', top: 'auto', bottom: 'auto' }} popupMatchSelectWidth={false} options={[{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }]} />
                        </Form.Item>
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-medium)' }}></div>
                </div>
            )}
            <div className="senior-rule-group shadow-sm">
                <div className="senior-rule-header">
                <div 
                    className="senior-drag-handle branch-drag"
                    onPointerDown={(e) => controls.start(e)}
                    style={{ cursor: 'grab' }}
                >
                    <GripVertical size={14} />
                </div>
                <div className="branch-label">BRANCH {index + 1}</div>
                <div className="branch-name-input-wrap">
                    <Form.Item {...field} name={[field.name, 'label']} noStyle rules={[{ required: true }]}>
                        <Input className="senior-branch-name-header-input" variant="borderless" placeholder="Enter branch name..." />
                    </Form.Item>
                </div>
                <div className="header-right">
                    <Tooltip title="Delete Branch">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<Trash2 size={15} />} 
                            onClick={() => remove(field.name)} 
                            className="branch-delete-action" 
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="senior-rule-content">
                <Form.List name={[field.name, 'conditions']}>
                    {(condFields, { add: addCond, remove: removeCond, move: moveCond }) => (
                        <div className="senior-conditions-wrapper">
                            <div className="senior-conditions-header">
                                <div className="col-label source-col">CONDITION SOURCE</div>
                                <div className="col-label path-col">VARIABLE PATH</div>
                                <div className="col-label subpath-col">SUB PATH</div>
                                <div className="col-label op-col">OPERATOR</div>
                                <div className="col-label val-col">VALUE</div>
                            </div>

                            <div className="senior-conditions-pipe" />

                            <LayoutGroup id={`branch-${field.key}-conds`}>
                                <Reorder.Group 
                                    axis="y" 
                                    values={condFields} 
                                    onReorder={(newConds) => {
                                        const fromIndex = condFields.findIndex(f => f.key !== newConds[condFields.indexOf(f)].key);
                                        if (fromIndex !== -1) {
                                            const toIndex = newConds.findIndex(f => f.key === condFields[fromIndex].key);
                                            moveCond(fromIndex, toIndex);
                                        }
                                    }}
                                >
                                    {condFields.map((cField, cIndex) => (
                                        <ConditionRow 
                                            key={cField.key} 
                                            cField={cField} 
                                            cIndex={cIndex} 
                                            field={field} 
                                            removeCond={removeCond} 
                                            moveCond={moveCond} 
                                            availableOutputKeys={availableOutputKeys} 
                                        />
                                    ))}
                                </Reorder.Group>
                            </LayoutGroup>

                            <div className="senior-add-cond-wrap">
                                <Button type="text" size="small" onClick={() => addCond({ source_type: 'custom', operator: '==' })} icon={<Plus size={14} />} className="senior-add-cond-btn">Add condition</Button>
                            </div>
                        </div>
                    )}
                </Form.List>
            </div>
            </div>
        </Reorder.Item>
    );
};

export default function DecisionPropertiesPanel({ nodes = [] }: DecisionPropertiesPanelProps) {
    const availableOutputKeys = Array.from(new Set(
        nodes
            .map(n => n.data?.configurations_json?.output_key)
            .filter(key => typeof key === 'string' && key.trim() !== '')
    )).map(key => ({ label: key, value: key }));

    return (
        <div className="decision-props">
            <div className="decision-props__banner">
                <div className="decision-props__banner-content">
                    <div className="decision-props__banner-left">
                        <div className="decision-props__banner-title">
                            <div className="decision-props__icon-wrap">
                                <Split size={14} color="#6366f1" />
                            </div>
                            <Title level={5} className="decision-props__title">Routing Rules</Title>
                        </div>
                    </div>
                    <div className="decision-props__banner-right">
                        {/* Search removed as requested */}
                    </div>
                </div>
            </div>

            <Form.List name="rules">
                {(fields, { add, remove, move }) => (
                    <div className="senior-rules-container">
                        <LayoutGroup>
                            <Reorder.Group 
                                axis="y" 
                                values={fields} 
                                onReorder={(newFields) => {
                                    const fromIndex = fields.findIndex(f => f.key !== newFields[fields.indexOf(f)].key);
                                    if (fromIndex !== -1) {
                                        const toIndex = newFields.findIndex(f => f.key === fields[fromIndex].key);
                                        move(fromIndex, toIndex);
                                    }
                                }}
                            >
                                {fields.map((field, index) => (
                                    <BranchItem 
                                        key={field.key} 
                                        field={field} 
                                        index={index} 
                                        remove={remove} 
                                        availableOutputKeys={availableOutputKeys} 
                                    />
                                ))}
                            </Reorder.Group>
                        </LayoutGroup>
                        <Button
                            type="primary"
                            className="senior-add-branch-btn"
                            onClick={() => add({ id: 'branch_' + Date.now(), label: `Branch ${fields.length + 1}`, match_type: 'OR', conditions: [{ source_type: 'custom', operator: '==' }] })}
                            icon={<PlusOutlined />}
                            block
                        >
                            Add Branch
                        </Button>
                    </div>
                )}
            </Form.List>

            <Divider className="decision-props__divider" />

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
