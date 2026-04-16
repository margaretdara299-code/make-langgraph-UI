/**
 * CreateCapabilityModal — modal for creating and editing capabilities.
 * High-fidelity, industry-level design refactor.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Typography, Space } from 'antd';
import { createCapability, updateCapability } from '@/services/capability.service';
import type { CreateCapabilityModalProps } from '@/interfaces';

const { TextArea } = Input;
const { Text } = Typography;

export default function CreateCapabilityModal({
    isOpen,
    capabilityToEdit,
    onClose,
    onCreated,
}: CreateCapabilityModalProps) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!capabilityToEdit;
    const nameValue = Form.useWatch('name', form);

    useEffect(() => {
        if (isOpen && capabilityToEdit) {
            form.setFieldsValue({
                name: capabilityToEdit.name,
                description: capabilityToEdit.description,
            });
        } else if (isOpen && !capabilityToEdit) {
            form.resetFields();
        }
    }, [isOpen, capabilityToEdit, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            if (isEditMode) {
                const capabilityId = (capabilityToEdit as any).capabilityId ?? capabilityToEdit!.capability_id;
                const result = await updateCapability(capabilityId, values);
                if (result.success) {
                    message.success(result.message || 'Capability updated successfully');
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await createCapability(values);
                if (result.success) {
                    message.success(result.message || 'Capability created successfully');
                } else {
                    throw new Error(result.error);
                }
            }

            form.resetFields();
            onCreated();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} capability.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <Space direction="vertical" size={2} style={{ width: '100%', lineHeight: '1.2', paddingBottom: '12px' }}>
                    <Text style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', display: 'block', letterSpacing: '-0.02em' }}>
                        {isEditMode ? "Edit Capability" : "Create New Capability"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px', fontWeight: 400, display: 'block' }}>
                        {isEditMode ? "Modify capability details and its core function" : "Define a new capability to extend your skill potential"}
                    </Text>
                </Space>
            }
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? "Save Changes" : "Create Capability"}
            confirmLoading={isSubmitting}
            width={480}
            zIndex={1300}
            centered
            destroyOnHidden
            okButtonProps={{ 
                style: { height: '40px', fontWeight: 600, padding: '0 24px', borderRadius: '8px' },
                disabled: !nameValue || nameValue.trim().length < 3
            }}
            cancelButtonProps={{ 
                style: { height: '40px', padding: '0 24px', borderRadius: '8px' }
            }}
        >
            <div style={{ paddingTop: '12px' }}>
                <Form form={form} layout="vertical" requiredMark="optional">
                    <Form.Item
                        label="Capability Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter a capability name' },
                            { min: 3, message: 'Name must be at least 3 characters' }
                        ]}
                    >
                        <Input size="large" placeholder="e.g. RPA, API Integration, AI Triage" style={{ borderRadius: '4px' }} />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <TextArea 
                            size="large"
                            placeholder="What is this capability for?" 
                            rows={4} 
                            style={{ borderRadius: '4px', minHeight: '100px' }}
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
