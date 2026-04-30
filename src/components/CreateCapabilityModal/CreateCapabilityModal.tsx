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
            <div className="modal-header-neat ccm2-header">
                <div className="ccm2-header-inner">
                    <span className="modal-header-title">
                        {isEditMode ? "Edit Capability" : "Create New Capability"}
                    </span>
                    <span className="modal-header-subtitle">
                        {isEditMode ? "Modify capability details and its core function" : "Define a new capability to extend your skill potential"}
                    </span>
                </div>
            </div>

            <div className="ccm2-form-body">
                <Form form={form} layout="vertical" requiredMark>
                    <Form.Item
                        label="Capability Name"
                        name="name"
                        rules={[
                            { required: true, whitespace: true, message: 'Capability name is required' },
                            { min: 3, message: 'Name must be at least 3 characters long' }
                        ]}
                    >
                        <Input placeholder="e.g. RPA, API Integration, AI Triage" />
                    </Form.Item>

                    <div className="ccm2-icon-row">
                        <span className="ccm2-icon-label"><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>Capability Icon</span>
                        <div className="ccm2-icon-picker-wrap">
                            <Form.Item
                                name="icon"
                                rules={[{ required: true, message: 'Icon is required' }]}

                            >
                                <LucideIconPicker />
                            </Form.Item>
                        </div>

                    </div>

                    <Form.Item label="Description" name="description">
                        <TextArea
                            placeholder="What is this capability for?"
                            rows={8}
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>
                </Form>
            </div>

            <div className="ccm2-footer">
                <Space size={12}>
                    <Button onClick={handleCancel} className="ccm2-btn">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!nameValue || nameValue.trim().length < 3}
                        className="ccm2-btn ccm2-btn--primary"
                    >
                        {isEditMode ? "Save Changes" : "Create Capability"}
                    </Button>
                </Space>
            </div>
        </Modal>
    );
}
