import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography } from 'antd';
import { createVariable, updateVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';
import { Hash, AlignLeft, Braces, ToggleLeft } from 'lucide-react';

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

            const res = await (variable ? updateVariable(variable.groupKey, variable.variableKey, values) : createVariable(values));

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
            width={600}
            centered
            footer={null}
            destroyOnClose
            zIndex={2000}
            className="variable-modern-modal"
        >
            <div className="vm-header-content">
                <span className="modal-header-title">
                    {variable ? 'Edit Variable' : 'Create New Variable'}
                </span>
                <span className="modal-header-subtitle">
                    {variable ? 'Modify variable properties.' : 'Define a new environment variable for orchestration.'}
                </span>
            </div>

            <Form form={form} layout="vertical" requiredMark={false} size="large">
                <div className="vm-grid-2col">
                    <Form.Item
                        name="groupName"
                        label="Group Name"
                        rules={[{ required: true, message: 'Required' }]}
                        className="vm-form-item"
                    >
                        <Input placeholder="e.g. API Credentials" />
                    </Form.Item>

                    <Form.Item
                        name="groupKey"
                        label="Group Key"
                        rules={[{ required: true, message: 'Required' }]}
                        normalize={(val) => (val || '').toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}
                        className="vm-form-item"
                    >
                        <Input placeholder="e.g. API_CREDENTIALS" className="variable-monospace-input" />
                    </Form.Item>
                </div>

                <div className="vm-grid-2col">
                    <Form.Item
                        name="variableName"
                        label="Display Name"
                        rules={[{ required: true, message: 'Required' }]}
                        className="vm-form-item"
                    >
                        <Input placeholder="e.g. OpenAI Key" />
                    </Form.Item>

                    <Form.Item
                        name="variableKey"
                        label="Variable Key"
                        rules={[{ required: true, message: 'Required' }]}
                        normalize={(val) => (val || '').toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}
                        className="vm-form-item"
                    >
                        <Input placeholder="e.g. OPENAI_API_KEY" className="variable-monospace-input" />
                    </Form.Item>
                </div>

                <div className="vm-grid-1-2col">
                    <Form.Item
                        name="dataType"
                        label="Data Type"
                        initialValue="string"
                        className="vm-form-item"
                    >
                        <Select dropdownStyle={{ zIndex: 3000 }}>
                            <Option value="string">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlignLeft size={14} className="var-type-icon"/> String
                                </div>
                            </Option>
                            <Option value="number">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Hash size={14} className="var-type-icon"/> Number
                                </div>
                            </Option>
                            <Option value="boolean">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ToggleLeft size={14} className="var-type-icon"/> Boolean
                                </div>
                            </Option>
                            <Option value="json">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Braces size={14} className="var-type-icon"/> JSON
                                </div>
                            </Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="variableValue"
                        label="Default Value"
                        className="vm-form-item"
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

                <div className="vm-footer-actions">
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSubmit} loading={loading} className="vm-submit-btn">
                        {variable ? 'Save Changes' : 'Create Variable'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

