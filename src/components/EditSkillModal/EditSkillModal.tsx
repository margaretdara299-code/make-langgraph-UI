import { useState, useEffect } from 'react';
import { Modal, Form, message, Button, Space } from 'antd';
import { updateSkill } from '@/services';
import { SkillDetailsForm } from '@/components';
import type { EditSkillModalProps, CreateSkillFormData } from '@/interfaces';
import './EditSkillModal.css';

export default function EditSkillModal({ isOpen, onClose, onUpdated, skill }: EditSkillModalProps) {
    const [form] = Form.useForm<CreateSkillFormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync the form with the passed skill when the modal opens
    useEffect(() => {
        if (isOpen && skill) {
            form.setFieldsValue({
                name: skill.name,
                skillKey: skill.skillKey,
                description: skill.description,
                categoryId: skill.categoryId,
                icon: skill.icon || 'Box',
                tags: skill.tags,
            });
        }
    }, [isOpen, skill, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSave = async () => {
        if (!skill) return;

        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            const result = await updateSkill(skill.id, values);
            if (result.success) {
                message.success(result.message || 'Skill updated successfully');
                onUpdated();
                handleClose();
            } else {
                message.error(result.error || 'Failed to update skill');
            }
        } catch (error) {
            // Form validation error, handled by AntD
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title="Edit Skill Details"
            width={540}
            zIndex={1300}
            destroyOnHidden
            className="edit-skill-modal"
            footer={
                <Space>
                    <Button onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="primary" onClick={handleSave} loading={isSubmitting}>
                        Save Changes
                    </Button>
                </Space>
            }
        >
            <div className="edit-skill__body">
                <SkillDetailsForm form={form} />
            </div>
        </Modal>
    );
}
