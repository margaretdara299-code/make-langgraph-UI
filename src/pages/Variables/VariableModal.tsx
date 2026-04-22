import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography } from 'antd';
import { createVariable, updateVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';

const { Text } = Typography;
const { Option } = Select;

interface Props {
    visible: boolean;
    variable: Variable | null;
    defaultGroupName?: string;
    defaultGroupKey?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function VariableModal({ visible, variable, defaultGroupName, defaultGroupKey, onClose, onSuccess }: Props) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const dataType = Form.useWatch('dataType', form);

    useEffect(() => {
        if (visible) {
            if (variable) {
                form.setFieldsValue(variable);
            } else {
                form.resetFields();
                if (defaultGroupName) {
                    form.setFieldsValue({
                        groupName: defaultGroupName,
                        groupKey: defaultGroupKey
                    });
                }
            }
        }
    }, [visible, variable, form, defaultGroupName, defaultGroupKey]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // The service handles camelCase to snake_case mapping for the API
            const res = await (variable ? updateVariable(variable.variableId, values) : createVariable(values));

            if (res.success) {
                message.success(variable ? 'Variable updated' : 'Variable created');
                onSuccess();
                handleClose();
            } else {
                message.error(res.error || 'Operation failed');
            }
        } catch (e) {
            // Validation error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={handleClose}
            width={580}
            centered
            footer={null}
            destroyOnClose
            zIndex={2000}
        >
            <div className="modal-header-neat">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="modal-header-title">
                        {variable ? 'Edit Variable' : 'Create New Variable'}
                    </span>
                    <span className="modal-header-subtitle">
                        {variable ? 'Modify system constant properties.' : 'Define a new environment variable for orchestration.'}
                    </span>
                </div>
            </div>

            <Form form={form} layout="vertical" requiredMark={false} size="large">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Form.Item
                        name="groupName"
                        label={<Text strong>Group Name</Text>}
                        rules={[{ required: true, message: 'Required' }]}
                        style={{ marginBottom: '14px' }}
                    >
                        <Input placeholder="e.g. Security" />
                    </Form.Item>

                    <Form.Item
                        name="groupKey"
                        label={<Text strong>Group Key</Text>}
                        rules={[{ required: true, message: 'Required' }]}
                        normalize={(val) => (val || '').toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}
                        style={{ marginBottom: '14px' }}
                    >
                        <Input placeholder="e.g. SECURITY" className="variable-monospace-input" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Form.Item
                        name="variableName"
                        label={<Text strong>Display Name</Text>}
                        rules={[{ required: true, message: 'Required' }]}
                        style={{ marginBottom: '14px' }}
                    >
                        <Input placeholder="e.g. API Key" />
                    </Form.Item>

                    <Form.Item
                        name="variableKey"
                        label={<Text strong>Variable Key</Text>}
                        rules={[{ required: true, message: 'Required' }]}
                        normalize={(val) => (val || '').toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}
                        style={{ marginBottom: '14px' }}
                    >
                        <Input placeholder="e.g. API_KEY" className="variable-monospace-input" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <Form.Item
                        name="dataType"
                        label={<Text strong>Data Type</Text>}
                        initialValue="string"
                        style={{ marginBottom: '14px' }}
                    >
                        <Select>
                            <Option value="string">String</Option>
                            <Option value="number">Number</Option>
                            <Option value="boolean">Boolean</Option>
                            <Option value="json">JSON</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="variableValue"
                        label={<Text strong>Default Value</Text>}
                        style={{ marginBottom: '14px' }}
                    >
                        {dataType === 'json' ? (
                            <Input.TextArea 
                                rows={4} 
                                placeholder='{ "key": "value" }' 
                                className="variable-monospace-input" 
                            />
                        ) : (
                            <Input placeholder="Enter value..." className="variable-monospace-input" />
                        )}
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSubmit} loading={loading} style={{ fontWeight: 600, padding: '0 32px' }}>
                        {variable ? 'Update' : 'Create Variable'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
