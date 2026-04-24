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
            width={520}
            zIndex={1300}
            destroyOnHidden
            centered
            footer={null}
            className="create-skill-modal-v2"
        >
            <div className="modal-header-neat">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="modal-header-title">Create New Skill</span>
                    <span className="modal-header-subtitle">Give your skill a name and description to get started.</span>
                </div>
            </div>

            <div className="create-skill__body" style={{  padding: '0 4px' }}>
                <SkillDetailsForm form={form} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, padding: '0 4px' }}>
                <Space size={12}>
                    <Button onClick={handleClose} style={{ borderRadius: '4px', height: '36px', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleCreate} 
                        loading={isSubmitting}
                        style={{ borderRadius: '4px', height: '36px', fontWeight: 600, padding: '0 24px' }}
                    >
                        Create Skill
                    </Button>
                </Space>
            </div>
        </Modal>
    );
}
