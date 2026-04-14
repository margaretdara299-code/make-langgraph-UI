/**
 * CreateActionModal — The main state container and modal shell for the 7-step wizard.
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, Steps, Button, Space, message, Form, Typography } from 'antd';
const { Text } = Typography;
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

    const handleStepChange = useCallback(async (step: number) => {
        // Validate current step before allowing navigation
        let hasErrors = false;

        // Validate Overview form when moving to Configuration or Review step
        if (currentStep === 0 && step >= 1) {
            try {
                await overviewForm.validateFields();
            } catch {
                hasErrors = true;
            }
        }

        // Validate Configuration form when moving to Review step
        if (currentStep === 1 && step >= 2) {
            try {
                await configForm.validateFields();
            } catch {
                hasErrors = true;
            }

        }

        // Validate Overview form when going back from Configuration or Review step
        if (step < currentStep) {
            if (currentStep >= 1) {
                try {
                    await overviewForm.validateFields();
                } catch {
                    hasErrors = true;
                }
            }

            if (currentStep === 2) {
                try {
                    await configForm.validateFields();
                } catch {
                    hasErrors = true;
                }

            }
        }

        if (hasErrors) return;

        setCurrentStep(step);
    }, [currentStep, overviewForm, configForm]);

    const {
        isTestPopupOpen,
        setIsTestPopupOpen,
        testState,
        testResponse,
        testInputPayload,
        handleTestApi
    } = useApiTest(actionDraft, configForm);

    const handleNext = async () => {
        // Validate the current form before allowing step advancement
        try {
            if (currentStep === 0) {
                await overviewForm.validateFields();
            } else if (currentStep === 1) {
                await configForm.validateFields();
            }
            // If validation passes, advance to next step
            setCurrentStep(prev => prev + 1);
        } catch {
            return;
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handlePublish = async () => {
        // Validate all forms before publishing
        try {
            await overviewForm.validateFields();
        } catch {
            setCurrentStep(0);
            return;
        }

        try {
            await configForm.validateFields();
        } catch {
            setCurrentStep(1);
            return;
        }

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
                await onCreated(); // Triggers a refetch in the parent table
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
        {
            title: 'Overview',
            description: 'Provide basic details and categorization for the action.',
            content: <CreateActionOverview draft={actionDraft} setDraft={setActionDraft} form={overviewForm} />
        },
        {
            title: 'Configuration',
            description: 'Configure API endpoints and technical parameters.',
            content: <CreateActionConfigStep draft={actionDraft} setDraft={setActionDraft} form={configForm} onTestClick={handleTestApi} isTesting={testState === 'loading'} />
        },
        {
            title: 'Review & Publish',
            description: 'Review all details before publishing to the catalog.',
            content: <CreateActionReviewStep draft={actionDraft} setDraft={setActionDraft} />
        },
    ];

    const getStepDescription = () => {
        if (currentStep === 0) return "Provide basic details and categorization for the action.";
        if (currentStep === 1) return "Configure API endpoints and technical parameters.";
        if (currentStep === 2) return "Review all details before publishing to the catalog.";
        return "";
    };

    return (
        <Modal
            title={null}
            open={isOpen}
            onCancel={handleClose}
            width={1000}
            footer={null}
            destroyOnClose
            className="create-action-modal"
            centered
            zIndex={1300}
            bodyStyle={{ padding: 0 }}
            styles={{ body: { padding: 0 } }}
        >
            <div className="create-action-modal__layout">
                {/* -- Left Side: Vertical Progress Stepper -- */}
                <div className="create-action-modal__stepper-col">
                    <div style={{ marginBottom: 40 }}>
                        <Text strong style={{ fontSize: '18px', fontWeight: 700, display: 'block', marginTop: 5, marginBottom: 9, color: 'rgb(15, 23, 42)', letterSpacing: '-0.02em', maxWidth: 241 }}>
                            {actionToEdit ? 'Edit Action' : 'Create New Action'}
                        </Text>
                        <Text style={{ fontSize: '12px', color: 'rgb(100, 116, 139)', display: 'block', lineHeight: 1.5, paddingRight: '10px' }}>
                            Provide basic details and categorization for the action.
                        </Text>
                    </div>
                    <div className="create-action-modal__stepper">
                        <Steps
                            current={currentStep}
                            items={steps.map(s => ({ title: s.title }))}
                            size="small"
                            direction="vertical"
                            onChange={handleStepChange}
                            className="create-action-stepper"
                        />
                    </div>
                </div>

                {/* -- Right Side: Form Content -- */}
                <div className="create-action-modal__form-col">
                    <div className="create-action-modal__step-content">
                        {steps[currentStep].content}
                    </div>

                    <div className="create-action-modal__footer">
                        <div></div>
                        <Space>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button>Save as Draft</Button>
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
