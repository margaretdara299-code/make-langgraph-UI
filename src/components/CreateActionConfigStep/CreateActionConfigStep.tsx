/**
 * CreateActionConfigStep — Step 5: Define dynamic configuration fields for the action.
 * Each row defines a runtime parameter that will render in the Properties Drawer on the canvas.
 */

import { Button, Input, InputNumber, Select, Switch, Typography, Space, Table, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CreateActionStepProps } from '@/interfaces';
import type { ActionConfigField, ActionConfigInputType } from '@/interfaces';
import './CreateActionConfigStep.css';

const { Title, Text } = Typography;

const INPUT_TYPE_OPTIONS: { value: ActionConfigInputType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean (Toggle)' },
    { value: 'select', label: 'Select (Dropdown)' },
    { value: 'textarea', label: 'Text Area' },
];

const createEmptyConfig = (): ActionConfigField => ({
    label: '',
    inputKey: '',
    inputType: 'text',
});

export default function CreateActionConfigStep({ draft, setDraft }: CreateActionStepProps) {
    const configs: ActionConfigField[] = draft.configurationsJson ?? [];

    const updateConfigs = (updated: ActionConfigField[]) => {
        setDraft(prev => ({ ...prev, configurationsJson: updated }));
    };

    const handleAdd = () => {
        updateConfigs([...configs, createEmptyConfig()]);
    };

    const handleRemove = (index: number) => {
        updateConfigs(configs.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index: number, field: keyof ActionConfigField, value: unknown) => {
        const updated = [...configs];
        const current = { ...updated[index], [field]: value };

        // Clear options when switching away from select
        if (field === 'inputType' && value !== 'select') {
            current.options = undefined;
        }
        // Clear default value when switching types
        if (field === 'inputType') {
            current.defaultValue = undefined;
        }

        updated[index] = current;
        updateConfigs(updated);
    };

    const handleOptionsChange = (index: number, options: string[]) => {
        const updated = [...configs];
        updated[index] = { ...updated[index], options };
        updateConfigs(updated);
    };

    /** Renders the default value editor based on the field's inputType */
    const renderDefaultValueEditor = (config: ActionConfigField, index: number) => {
        switch (config.inputType) {
            case 'number':
                return (
                    <InputNumber
                        placeholder="Default"
                        value={config.defaultValue as number | undefined}
                        onChange={(val) => handleFieldChange(index, 'defaultValue', val)}
                        size="small"
                        style={{ width: '100%' }}
                    />
                );
            case 'boolean':
                return (
                    <Switch
                        checked={!!config.defaultValue}
                        onChange={(val) => handleFieldChange(index, 'defaultValue', val)}
                        size="small"
                    />
                );
            case 'select':
                return (
                    <Select
                        placeholder="Default"
                        value={config.defaultValue as string | undefined}
                        onChange={(val) => handleFieldChange(index, 'defaultValue', val)}
                        options={(config.options || []).map(o => ({ value: o, label: o }))}
                        size="small"
                        style={{ width: '100%' }}
                        allowClear
                    />
                );
            default:
                return (
                    <Input
                        placeholder="Default value"
                        value={config.defaultValue as string | undefined}
                        onChange={(e) => handleFieldChange(index, 'defaultValue', e.target.value)}
                        size="small"
                    />
                );
        }
    };

    const columns = [
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            width: '20%',
            render: (_: string, _record: ActionConfigField, index: number) => (
                <Input
                    placeholder="e.g. AI Model"
                    value={configs[index].label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    size="small"
                />
            ),
        },
        {
            title: 'Input Key',
            dataIndex: 'inputKey',
            key: 'inputKey',
            width: '18%',
            render: (_: string, _record: ActionConfigField, index: number) => (
                <Input
                    placeholder="e.g. ai_model"
                    value={configs[index].inputKey}
                    onChange={(e) => handleFieldChange(index, 'inputKey', e.target.value)}
                    size="small"
                />
            ),
        },
        {
            title: 'Input Type',
            dataIndex: 'inputType',
            key: 'inputType',
            width: '16%',
            render: (_: string, _record: ActionConfigField, index: number) => (
                <Select
                    value={configs[index].inputType}
                    onChange={(val) => handleFieldChange(index, 'inputType', val)}
                    options={INPUT_TYPE_OPTIONS}
                    size="small"
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Default Value',
            dataIndex: 'defaultValue',
            key: 'defaultValue',
            width: '18%',
            render: (_: unknown, record: ActionConfigField, index: number) =>
                renderDefaultValueEditor(record, index),
        },
        {
            title: '',
            key: 'actions',
            width: '8%',
            render: (_: unknown, _record: ActionConfigField, index: number) => (
                <Popconfirm
                    title="Remove this field?"
                    onConfirm={() => handleRemove(index)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="action-config-step">
            <div className="action-config-step__header">
                <div>
                    <Title level={5} style={{ margin: 0 }}>Configurations</Title>
                    <Text type="secondary">
                        Define runtime configuration fields that users will fill in when using this action on the canvas.
                    </Text>
                </div>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} size="small">
                    Add Config
                </Button>
            </div>

            {configs.length === 0 ? (
                <div className="action-config-step__empty">
                    <Space direction="vertical" align="center">
                        <Text type="secondary">No configuration fields defined yet.</Text>
                        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Your First Configuration
                        </Button>
                    </Space>
                </div>
            ) : (
                <>
                    <Table
                        dataSource={configs.map((field, i) => ({ ...field, key: i }))}
                        columns={columns}
                        pagination={false}
                        size="small"
                        className="action-config-step__table"
                    />

                    {/* Inline options editor for "select" type fields */}
                    {configs.map((config, index) =>
                        config.inputType === 'select' ? (
                            <div key={index} className="action-config-step__options-row">
                                <Text type="secondary" className="action-config-step__options-label">
                                    Options for <strong>{config.label || `Field ${index + 1}`}</strong>:
                                </Text>
                                <Select
                                    mode="tags"
                                    placeholder="Type an option and press Enter"
                                    value={config.options || []}
                                    onChange={(vals) => handleOptionsChange(index, vals)}
                                    size="small"
                                    style={{ width: '100%' }}
                                    tokenSeparators={[',']}
                                    tagRender={({ label, closable, onClose }) => (
                                        <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                                            {label}
                                        </Tag>
                                    )}
                                />
                            </div>
                        ) : null
                    )}
                </>
            )}
        </div>
    );
}
