/**
 * CreateActionModal — The main state container and modal shell for the 7-step wizard.
 */

import { useState, useEffect } from 'react';
import { Modal, Steps, Button, Space, message, Form } from 'antd';
import { ActionPreviewPanel, TestApiModal } from '@/components';
import { useApiTest } from '@/hooks/useApiTest';
import { createAction, updateActionDefinition } from '@/services';
import type { ActionDefinition, CreateActionModalProps } from '@/interfaces';
import './CreateActionModal.css';

import CreateActionOverview from '../CreateActionOverview/CreateActionOverview';
import CreateActionConfigStep from '../CreateActionConfigStep/CreateActionConfigStep';
import CreateActionReviewStep from '../CreateActionReviewStep/CreateActionReviewStep';



export default function CreateActionModal({ isOpen, initialStep = 0, onClose, onCreated, actionToEdit }: CreateActionModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // The single source of truth for the Action being built
    const [actionDraft, setActionDraft] = useState<Partial<ActionDefinition>>({
        category: 'Uncategorized',
        scope: 'global',
        icon: '🧩',
    });

    // Form instances for steps
    const [overviewForm] = Form.useForm();
    const [configForm] = Form.useForm();

    // Populate draft when opening in Edit mode
    useEffect(() => {
        if (isOpen) {
            if (actionToEdit) {
                // Pre-fill existing action for editing
                setActionDraft(actionToEdit);
                setTimeout(() => overviewForm.setFieldsValue(actionToEdit), 0);
            } else {
                // Reset for creating a new action
                setActionDraft({
                    category: 'Uncategorized',
                    scope: 'global' as const,
                    icon: '🧩',
                });
                // Clear all form fields so no stale data remains
                setTimeout(() => overviewForm.resetFields(), 0);
            }
            setCurrentStep(initialStep);
        }
    }, [isOpen, actionToEdit, overviewForm, initialStep]);

    const { 
        isTestPopupOpen, 
        setIsTestPopupOpen, 
        testState, 
        testResponse, 
        testInputPayload, 
        handleTestApi 
    } = useApiTest(actionDraft, configForm);

    const handleNext = async () => {
        // Validate the Overview form before allowing step advancement
        if (currentStep === 0) {
            try {
                await overviewForm.validateFields();
            } catch {
                return; // Validation failed — don't advance
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            // Clean configurations_json: strip empty rows/fields before sending to backend
            const rawConfig = actionDraft.configurations_json || {};
            const cleanedConfig: Record<string, any> = {};
            if (rawConfig.url) cleanedConfig.url = rawConfig.url;
            if (rawConfig.method) cleanedConfig.method = rawConfig.method;
            if (rawConfig.output_key) cleanedConfig.output_key = rawConfig.output_key;
            ['path_params', 'query_params', 'header_params', 'body_params'].forEach(paramType => {
                if (Array.isArray(rawConfig[paramType])) {
                    const filtered = rawConfig[paramType].filter((param: any) => param && (param.key || param.value));
                    if (filtered.length > 0) {
                        if (paramType === 'body_params') {
                            const bodyObj: Record<string, any> = {};
                            filtered.forEach((param: any) => {
                                if (param.key) bodyObj[param.key] = param.value;
                            });
                            cleanedConfig.body_params = bodyObj;
                        } else {
                            cleanedConfig[paramType] = filtered;
                        }
                    }
                }
            });
            if (rawConfig.fallback_message) {
                cleanedConfig.fallback_message = rawConfig.fallback_message;
            }
            if (Array.isArray(rawConfig.input_keys)) {
                const filtered = rawConfig.input_keys.filter((keyItem: any) => keyItem && keyItem.key);
                if (filtered.length > 0) cleanedConfig.input_keys = filtered;
            }
            const cleanedDraft = { ...actionDraft, configurations_json: cleanedConfig };

            let res;
            if (actionToEdit) {
                // Edit: PUT /api/actions/{id}
                res = await updateActionDefinition(actionToEdit.id, cleanedDraft);
                if (res.success) {
                    message.success(res.message || 'Action updated successfully!');
                }
            } else {
                // Create: POST /api/actions
                res = await createAction(cleanedDraft);
                if (res.success) {
                    message.success(res.message || 'Action created successfully!');
                }
            }
            
            if (res.success) {
                onCreated(); // Triggers a refetch in the parent table
                handleClose();
            } else {
                message.error(res.error || 'Failed to save action.');
            }
        } catch (error) {
            console.error('Error saving action:', error);
            message.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    // Form steps configuration
    const steps = [
        { title: 'Overview', content: <CreateActionOverview draft={actionDraft} setDraft={setActionDraft} form={overviewForm} /> },
        { title: 'Configuration', content: <CreateActionConfigStep draft={actionDraft} setDraft={setActionDraft} form={configForm} /> },
        { title: 'Publish', content: <CreateActionReviewStep draft={actionDraft} setDraft={setActionDraft} /> },
    ];

    return (
        <Modal
            title={actionToEdit ? "Edit Action" : "Create New Action"}
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
                                        {actionToEdit ? 'Publish Updates' : 'Publish Action'}
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
                        onTestApiClick={handleTestApi}
                    />
                </div>
            </div>

            {/* ── Test API Popup ── */}
            <TestApiModal
                isOpen={isTestPopupOpen}
                onClose={() => setIsTestPopupOpen(false)}
                testState={testState}
                testResponse={testResponse}
                testInputPayload={testInputPayload}
            />
        </Modal>
    );
}
