/**
 * CreateSkillModal — Simple modal for creating a new skill.
 * Standardized to a single-step interaction for improved speed.
 */

import { useState } from 'react';
import { Modal, Form, message, Button, Space } from 'antd';
import { createSkill } from '@/services';
import { SkillDetailsForm } from '@/components';
import type { CreateSkillModalProps, CreateSkillFormData } from '@/interfaces';
import './CreateSkillModal.css';

export default function CreateSkillModal({ isOpen, onClose, onCreated }: CreateSkillModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm<CreateSkillFormData>();

    /** Reset state when modal closes */
    const handleClose = () => {
        form.resetFields();
        setIsSubmitting(false);
        onClose();
    };

    /** Submit the skill creation */
    const handleCreate = async () => {
        try {
            await form.validateFields();
            setIsSubmitting(true);
            const formData = form.getFieldsValue();

            const result = await createSkill({
                name: formData.name || '',
                skillKey: formData.skillKey || '',
                description: formData.description || '',
                icon: formData.icon || 'Box',
                categoryId: formData.categoryId || 1, // default internal fallback
                tags: formData.tags || [],
                clientId: '1',
                owner: 'Current User',
                updatedBy: 'Current User',
                status: 'draft',
                environment: 'dev',
            });

            if (result.success) {
                message.success(result.message || 'Skill created successfully!');
                handleClose();
                onCreated();
            } else {
                message.error(result.error || 'Failed to create skill. Please try again.');
            }
        } catch (error) {
            // Validation errors are handled by AntD form
            console.error('Validation or Creation error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title={null}
            width={680}
            zIndex={1300}
            destroyOnHidden
            centered
            footer={null}
            className="create-skill-modal-v2"
        >
            <div className="modal-header-neat">
                <div className="csm-header-inner">
                    <span className="modal-header-title">Create New Skill</span>
                    <span className="modal-header-subtitle">Give your skill a name and description to get started.</span>
                </div>
            </div>

            <div className="create-skill__body csm-body">
                <SkillDetailsForm form={form} />
            </div>

            <div className="csm-footer">
                <Space size={12}>
                    <Button onClick={handleClose} className="csm-btn">
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleCreate} 
                        loading={isSubmitting}
                        className="csm-btn csm-btn--primary"
                    >
                        Create Skill
                    </Button>
                </Space>
            </div>
        </Modal>
    );
}
