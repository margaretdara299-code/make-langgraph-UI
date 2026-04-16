import { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, message, Space } from 'antd';
import { createVariable, updateVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';

interface Props {
    visible: boolean;
    variable: Variable | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateVariableDrawer({ visible, variable, onClose, onSuccess }: Props) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            if (variable) {
                form.setFieldsValue(variable);
            } else {
                form.resetFields();
            }
        }
    }, [visible, variable, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Force key validation string format
            const payload = {
                ...values,
                key_name: values.key_name.toUpperCase().replace(/\s+/g, '_')
            };

            const res = await (variable ? updateVariable(variable.id, payload) : createVariable(payload));

            if (res.success) {
                message.success(variable ? 'Variable updated' : 'Variable created');
                onSuccess();
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
        <Drawer
            title={variable ? 'Edit Variable' : 'Create Variable'}
            placement="right"
            width={480}
            onClose={onClose}
            open={visible}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" loading={loading} onClick={handleSubmit}>
                        {variable ? 'Save Changes' : 'Create'}
                    </Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="key_name"
                    label="Key Name"
                    rules={[{ required: true, message: 'Key name is required' }]}
                    extra="Automatically formatted to UPPER_SNAKE_CASE (e.g. OPENAI_API_KEY)"
                >
                    <Input placeholder="e.g. BASE_URL" style={{ fontFamily: 'monospace' }} />
                </Form.Item>

                <Form.Item
                    name="group_name"
                    label="Group (Namespace)"
                    rules={[{ required: true, message: 'Group is required' }]}
                    initialValue="General"
                >
                    <Input placeholder="e.g. Authentication" />
                </Form.Item>

                <Form.Item
                    name="value"
                    label="Value"
                    rules={[{ required: true, message: 'Value is required' }]}
                >
                    <Input.TextArea rows={6} placeholder="Enter value here..." />
                </Form.Item>
            </Form>
        </Drawer>
    );
}
