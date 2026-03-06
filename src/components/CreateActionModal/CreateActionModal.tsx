/**
 * CreateActionModal — The main state container and modal shell for the 7-step wizard.
 */

import { useState } from 'react';
import { Modal, Steps, Button, Space, message } from 'antd';
import { ActionPreviewPanel, PlaceholderStep } from '@/components';
import { createAction } from '@/services';
import type { ActionDefinition, CreateActionModalProps } from '@/interfaces';
import './CreateActionModal.css';

// We'll import step components here soon as we build them.
import CreateActionOverview from '../CreateActionOverview/CreateActionOverview';

export default function CreateActionModal({ isOpen, onClose, onCreated }: CreateActionModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // The single source of truth for the Action being built
    const [actionDraft, setActionDraft] = useState<Partial<ActionDefinition>>({
        category: 'Uncategorized',
        capability: 'api',
        scope: 'global',
        icon: '🧩',
    });

    const handleNext = () => {
        // Validation could go here
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            const res = await createAction(actionDraft);
            if (res.success) {
                message.success('Action published successfully!');
                onCreated(); // Triggers a refetch in the parent table
                handleClose();
            } else {
                message.error(res.error || 'Failed to publish action.');
            }
        } catch (error) {
            console.error('Error publishing action:', error);
            message.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        setActionDraft({
            category: 'Uncategorized',
            capability: 'api',
            scope: 'global',
            icon: '🧩',
        });
        onClose();
    };

    // Form steps configuration
    const steps = [
        {
            title: 'Overview',
            content: <CreateActionOverview draft={actionDraft} setDraft={setActionDraft} />,
        },
        { title: 'Inputs', content: <PlaceholderStep stepName="Input Schema" /> },
        { title: 'Execution', content: <PlaceholderStep stepName="Connector & Execution Options" /> },
        { title: 'Outputs', content: <PlaceholderStep stepName="Output Schema" /> },
        { title: 'UI Form', content: <PlaceholderStep stepName="Canvas Node Layout" /> },
        { title: 'Policy', content: <PlaceholderStep stepName="PHI & Security Policy" /> },
        { title: 'Publish', content: <PlaceholderStep stepName="Final Review" /> },
    ];

    return (
        <Modal
            title="Create New Action"
            open={isOpen}
            onCancel={handleClose}
            width={1280}
            footer={null}
            destroyOnClose
            className="create-action-modal"
            centered
        >
            <div className="create-action-modal__layout">
                {/* ── Left Side: Steps Navigation & Form ── */}
                <div className="create-action-modal__form-col">
                    <div className="create-action-modal__stepper">
                        <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} size="small" />
                    </div>

                    <div className="create-action-modal__step-content">
                        {steps[currentStep].content}
                    </div>

                    <div className="create-action-modal__footer">
                        <Space>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button>Save as Draft</Button>
                        </Space>
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={handleBack}>
                                    Back
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={handleNext}>
                                    Continue
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <Button type="primary" onClick={handlePublish} loading={isSubmitting}>
                                    Publish Action
                                </Button>
                            )}
                        </Space>
                    </div>
                </div>

                {/* ── Right Side: Live Preview ── */}
                <div className="create-action-modal__preview-col">
                    <ActionPreviewPanel
                        actionDef={actionDraft}
                        currentStep={currentStep + 1}
                    />
                </div>
            </div>
        </Modal>
    );
}
