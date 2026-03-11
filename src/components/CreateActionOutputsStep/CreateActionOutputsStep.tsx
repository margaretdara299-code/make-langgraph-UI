/**
 * CreateActionOutputsStep — Step 4: Define output parameters for the action.
 * Same dynamic table pattern as Inputs (Step 2).
 */

import { Button, Input, Select, Switch, Typography, Space, Table, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CreateActionStepProps } from '@/interfaces';
import type { ActionOutputField } from '@/interfaces';
import { FIELD_TYPE_OPTIONS } from '@/constants';
import './CreateActionOutputsStep.css';

const { Title, Text } = Typography;

const createEmptyField = (): ActionOutputField => ({
    name: '',
    type: 'string',
    required: false,
    description: '',
});

export default function CreateActionOutputsStep({ draft, setDraft }: CreateActionStepProps) {
    const outputs: ActionOutputField[] = draft.outputsSchemaJson ?? [];

    const updateOutputs = (updated: ActionOutputField[]) => {
        setDraft(prev => ({ ...prev, outputsSchemaJson: updated }));
    };

    const handleAdd = () => {
        updateOutputs([...outputs, createEmptyField()]);
    };

    const handleRemove = (index: number) => {
        updateOutputs(outputs.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index: number, field: keyof ActionOutputField, value: unknown) => {
        const updated = [...outputs];
        updated[index] = { ...updated[index], [field]: value };
        updateOutputs(updated);
    };

    const columns = [
        {
            title: 'Field Name',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            render: (_: string, _record: ActionOutputField, index: number) => (
                <Input
                    placeholder="e.g. label"
                    value={outputs[index].name}
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                    size="small"
                />
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: '20%',
            render: (_: string, _record: ActionOutputField, index: number) => (
                <Select
                    value={outputs[index].type}
                    onChange={(val) => handleFieldChange(index, 'type', val)}
                    options={FIELD_TYPE_OPTIONS}
                    size="small"
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
            width: '10%',
            render: (_: boolean, _record: ActionOutputField, index: number) => (
                <Switch
                    checked={outputs[index].required}
                    onChange={(val) => handleFieldChange(index, 'required', val)}
                    size="small"
                />
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '35%',
            render: (_: string, _record: ActionOutputField, index: number) => (
                <Input
                    placeholder="What this output represents"
                    value={outputs[index].description}
                    onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                    size="small"
                />
            ),
        },
        {
            title: '',
            key: 'actions',
            width: '10%',
            render: (_: unknown, _record: ActionOutputField, index: number) => (
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
        <div className="action-outputs-step">
            <div className="action-outputs-step__header">
                <div>
                    <Title level={5} style={{ margin: 0 }}>Output Parameters</Title>
                    <Text type="secondary">
                        Define the fields this action produces after execution.
                    </Text>
                </div>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} size="small">
                    Add Output
                </Button>
            </div>

            {outputs.length === 0 ? (
                <div className="action-outputs-step__empty">
                    <Space direction="vertical" align="center">
                        <Text type="secondary">No output parameters defined yet.</Text>
                        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Your First Output
                        </Button>
                    </Space>
                </div>
            ) : (
                <Table
                    dataSource={outputs.map((field, i) => ({ ...field, key: i }))}
                    columns={columns}
                    pagination={false}
                    size="small"
                    className="action-outputs-step__table"
                />
            )}
        </div>
    );
}
