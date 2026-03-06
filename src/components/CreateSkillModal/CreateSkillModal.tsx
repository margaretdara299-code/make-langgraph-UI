/**
 * CreateSkillModal — 2-step wizard for creating a new skill.
 * Step 1: Skill Details (via SkillDetailsForm)
 * Step 2: Creation Method (via CreationMethodCard)
 * Footer: via CreateSkillFooter
 */

import { useState } from 'react';
import { Modal, Steps, Form, message } from 'antd';
import { CREATION_METHODS, WIZARD_STEPS } from '@/constants';
import { createSkill } from '@/services';
import { SkillDetailsForm, CreationMethodCard, CreateSkillFooter } from '@/components';
import type { CreateSkillModalProps, CreateSkillFormData } from '@/interfaces';
import './CreateSkillModal.css';

export default function CreateSkillModal({ isOpen, onClose, onCreated }: CreateSkillModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState<string>('scratch');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateSkillFormData>>({});
    const [form] = Form.useForm<CreateSkillFormData>();

    /** Reset state when modal closes */
    const handleClose = () => {
        form.resetFields();
        setCurrentStep(0);
        setSelectedMethod('scratch');
        setFormData({});
        onClose();
    };

    /** Move to Step 2 after validating Step 1 */
    const handleNext = async () => {
        try {
            await form.validateFields();
            setFormData(form.getFieldsValue());
            setCurrentStep(1);
        } catch {
            // form validation will show errors
        }
    };

    /** Submit the skill creation */
    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await createSkill({
                name: formData.name || '',
                skillKey: formData.skillKey || '',
                description: formData.description || '',
                category: formData.category || 'Eligibility', // default fallback
                tags: formData.tags || [],
                clientId: 'client-acme',
                owner: 'Current User',
                updatedBy: 'Current User',
                status: 'draft',
                environment: 'dev',
            });
            message.success('Skill created successfully!');
            handleClose();
            onCreated();
        } catch {
            message.error('Failed to create skill. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title="Create New Skill"
            width={640}
            destroyOnClose
            footer={
                <CreateSkillFooter
                    currentStep={currentStep}
                    isSubmitting={isSubmitting}
                    onBack={() => setCurrentStep(0)}
                    onNext={handleNext}
                    onCreate={handleCreate}
                />
            }
        >
            <Steps
                current={currentStep}
                items={WIZARD_STEPS}
                className="create-skill__steps"
            />
            <div className="create-skill__body">
                {currentStep === 0 ? (
                    <SkillDetailsForm form={form} />
                ) : (
                    <div className="create-skill__methods">
                        {CREATION_METHODS.map((method) => (
                            <CreationMethodCard
                                key={method.key}
                                methodKey={method.key}
                                title={method.title}
                                description={method.description}
                                isSelected={selectedMethod === method.key}
                                onClick={() => setSelectedMethod(method.key)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
