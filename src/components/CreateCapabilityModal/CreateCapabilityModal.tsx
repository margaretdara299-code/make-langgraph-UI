/**
 * CreateCapabilityModal — modal for creating and editing capabilities.
 * High-fidelity, industry-level design refactor.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Typography, Space, Button } from 'antd';

import { createCapability, updateCapability } from '@/services/capability.service';
import type { CreateCapabilityModalProps } from '@/interfaces';
import LucideIconPicker from '../LucideIconPicker/LucideIconPicker';
import './CreateCapabilityModal.css';


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
                icon: capabilityToEdit.icon || 'Rocket'
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
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? "Save Changes" : "Create Capability"}
            confirmLoading={isSubmitting}
            width={540}
            zIndex={1300}
            centered
            destroyOnHidden
            footer={null}
            className="create-capability-modal-v2"
        >
            <div className="modal-header-neat" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="modal-header-title">
                        {isEditMode ? "Edit Capability" : "Create New Capability"}
                    </span>
                    <span className="modal-header-subtitle">
                        {isEditMode ? "Modify capability details and its core function" : "Define a new capability to extend your skill potential"}
                    </span>
                </div>
            </div>

            <div style={{ minHeight: '440px' }}>
                <Form form={form} layout="vertical" requiredMark>
                    <Form.Item
                        label="Capability Name"
                        name="name"
                        rules={[
                            { required: true, whitespace: true, message: 'Capability name is required' },
                            { min: 3, message: 'Name must be at least 3 characters long' }
                        ]}
                    >
                        <Input size="large" placeholder="e.g. RPA, API Integration, AI Triage" style={{ borderRadius: '4px' }} />
                    </Form.Item>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '24px', padding: '12px 0', borderBottom: '1px dotted var(--border-light)', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>Capability Icon</span>
                        <Form.Item 
                            name="icon" 
                            rules={[{ required: true, message: 'Icon is required' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <LucideIconPicker placeholder="Select Icon" />
                        </Form.Item>
                    </div>

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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <Space size={12}>
                    <Button onClick={handleCancel} style={{ borderRadius: '4px', height: '36px', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleSubmit} 
                        loading={isSubmitting}
                        disabled={!nameValue || nameValue.trim().length < 3}
                        style={{ borderRadius: '4px', height: '36px', fontWeight: 600, padding: '0 24px' }}
                    >
                        {isEditMode ? "Save Changes" : "Create Capability"}
                    </Button>
                </Space>
            </div>
        </Modal>
    );
}
