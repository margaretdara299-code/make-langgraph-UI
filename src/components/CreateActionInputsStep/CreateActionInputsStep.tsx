/**
 * CreateActionInputsStep — Step 2: Define input parameters for the action.
 * Renders a dynamic table where users can add/remove input fields.
 */

import { Button, Input, Select, Switch, Typography, Space, Table, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CreateActionStepProps } from '@/interfaces';
import type { ActionInputField } from '@/interfaces';
import { FIELD_TYPE_OPTIONS } from '@/constants';
import './CreateActionInputsStep.css';

const { Title, Text } = Typography;

const createEmptyField = (): ActionInputField => ({
    name: '',
    type: 'string',
    required: false,
    description: '',
});

export default function CreateActionInputsStep({ draft, setDraft }: CreateActionStepProps) {
    const inputs: ActionInputField[] = draft.inputsSchemaJson ?? [];

    const updateInputs = (updated: ActionInputField[]) => {
        setDraft(prev => ({ ...prev, inputsSchemaJson: updated }));
    };

    const handleAdd = () => {
        updateInputs([...inputs, createEmptyField()]);
    };

    const handleRemove = (index: number) => {
        updateInputs(inputs.filter((_, inputIndex) => inputIndex !== index));
    };

    const handleFieldChange = (index: number, field: keyof ActionInputField, value: unknown) => {
        const updated = [...inputs];
        updated[index] = { ...updated[index], [field]: value };
        updateInputs(updated);
    };

    const columns = [
        {
            title: 'Field Name',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            render: (_: string, _record: ActionInputField, index: number) => (
                <Input
                    placeholder="e.g. record_id"
                    value={inputs[index].name}
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
            render: (_: string, _record: ActionInputField, index: number) => (
                <Select
                    value={inputs[index].type}
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
            render: (_: boolean, _record: ActionInputField, index: number) => (
                <Switch
                    checked={inputs[index].required}
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
            render: (_: string, _record: ActionInputField, index: number) => (
                <Input
                    placeholder="What this field is for"
                    value={inputs[index].description}
                    onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                    size="small"
                />
            ),
        },
        {
            title: '',
            key: 'actions',
            width: '10%',
            render: (_: unknown, _record: ActionInputField, index: number) => (
                <Popconfirm
                    title="Remove this field?"
                    onConfirm={() => handleRemove(index)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="action-inputs-step">
            <div className="action-inputs-step__header">
                <div>
                    <Title level={5} style={{ margin: 0 }}>Input Parameters</Title>
                    <Text type="secondary">
                        Define the fields this action expects as input when executed on the canvas.
                    </Text>
                </div>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="small"
                >
                    Add Input
                </Button>
            </div>

            {inputs.length === 0 ? (
                <div className="action-inputs-step__empty">
                    <Space direction="vertical" align="center">
                        <Text type="secondary">No input parameters defined yet.</Text>
                        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Your First Input
                        </Button>
                    </Space>
                </div>
            ) : (
                <Table
                    dataSource={inputs.map((field, i) => ({ ...field, key: i }))}
                    columns={columns}
                    pagination={false}
                    size="small"
                    className="action-inputs-step__table"
                />
            )}
        </div>
    );
}
