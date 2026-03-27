/**
 * CreateCapabilityModal — modal for creating and editing capabilities.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createCapability, updateCapability } from '@/services/capability.service';
import type { CreateCapabilityModalProps } from '@/interfaces';

export default function CreateCapabilityModal({
    isOpen,
    capabilityToEdit,
    onClose,
    onCreated,
}: CreateCapabilityModalProps) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!capabilityToEdit;

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
                const result = await updateCapability(capabilityToEdit!.capability_id, values);
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
            title={isEditMode ? 'Edit Capability' : 'Create Capability'}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? 'Save' : 'Create'}
            confirmLoading={isSubmitting}
            width={520}
            destroyOnClose
        >
            <Form form={form} layout="vertical" requiredMark>
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter a capability name' }]}
                >
                    <Input placeholder="e.g. API" />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input.TextArea placeholder="Optional description" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
