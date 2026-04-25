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
        category_id: 1,
        capability: 'api',
        capability_id: 1,
        scope: 'global' as const,
        status: 'draft' as const,
        configurations_json: {}
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
                overviewForm.setFieldsValue(actionToEdit);
            } else {
                // Reset for creating a new action
                setActionDraft({
                    category: 'Uncategorized',
                    category_id: 1,
                    capability: 'api',
                    capability_id: 1,
                    scope: 'global' as const,
                    status: 'draft' as const,
                    configurations_json: {}
                });
                // Clear all form fields so no stale data remains
                overviewForm.resetFields();
                configForm.resetFields();
            }
            setCurrentStep(initialStep);
        }
    }, [isOpen, actionToEdit, overviewForm, configForm, initialStep]);



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
            ['path_params', 'query_params', 'header_params'].forEach(paramType => {
                const paramObj = rawConfig[paramType];
                if (paramObj && typeof paramObj === 'object' && !Array.isArray(paramObj)) {
                    if (Object.keys(paramObj).length > 0) {
                        cleanedConfig[paramType] = paramObj;
                    }
                } else if (Array.isArray(paramObj)) {
                    // Fallback in case they were left as objects somehow
                    const obj: any = {};
                    paramObj.forEach(p => { if (p?.key) obj[p.key] = p.value; });
                    if (Object.keys(obj).length > 0) cleanedConfig[paramType] = obj;
                }
            });

            // Special handling for body: raw string vs form-data list
            const bodyType = rawConfig.body_params_type || 'form-data';
            if (bodyType === 'raw' && rawConfig.body_params_raw) {
                try {
                    cleanedConfig.body_params = JSON.parse(rawConfig.body_params_raw);
                } catch {
                    cleanedConfig.body_params = rawConfig.body_params_raw; // keep as string if not parseable
                }
            } else if (bodyType === 'form-data') {
                const bodyObj = rawConfig.body_params;
                if (bodyObj && typeof bodyObj === 'object' && !Array.isArray(bodyObj)) {
                    if (Object.keys(bodyObj).length > 0) {
                        cleanedConfig.body_params = bodyObj;
                    }
                } else if (Array.isArray(bodyObj)) {
                    const obj: any = {};
                    bodyObj.forEach(p => { if (p?.key) obj[p.key] = p.value; });
                    if (Object.keys(obj).length > 0) cleanedConfig.body_params = obj;
                }
            }
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
                onClose();
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



    const handleSaveAsDraft = async () => {
        // Optionally validate forms before saving - we'll save partial drafts without validation
        setIsSubmitting(true);
        try {
            const rawConfig = actionDraft.configurations_json || {};
            const cleanedConfig: Record<string, any> = {};
            if (rawConfig.url) cleanedConfig.url = rawConfig.url;
            if (rawConfig.method) cleanedConfig.method = rawConfig.method;
            if (rawConfig.output_key) cleanedConfig.output_key = rawConfig.output_key;
            ['path_params', 'query_params', 'header_params'].forEach(paramType => {
                const paramObj = rawConfig[paramType];
                if (paramObj && typeof paramObj === 'object' && !Array.isArray(paramObj)) {
                    if (Object.keys(paramObj).length > 0) {
                        cleanedConfig[paramType] = paramObj;
                    }
                } else if (Array.isArray(paramObj)) {
                    const obj: any = {};
                    paramObj.forEach(p => { if (p?.key) obj[p.key] = p.value; });
                    if (Object.keys(obj).length > 0) cleanedConfig[paramType] = obj;
                }
            });

            const bodyType = rawConfig.body_params_type || 'form-data';
            if (bodyType === 'raw' && rawConfig.body_params_raw) {
                try {
                    cleanedConfig.body_params = JSON.parse(rawConfig.body_params_raw);
                } catch {
                    cleanedConfig.body_params = rawConfig.body_params_raw;
                }
            } else if (bodyType === 'form-data') {
                const bodyObj = rawConfig.body_params;
                if (bodyObj && typeof bodyObj === 'object' && !Array.isArray(bodyObj)) {
                    if (Object.keys(bodyObj).length > 0) {
                        cleanedConfig.body_params = bodyObj;
                    }
                } else if (Array.isArray(bodyObj)) {
                    const obj: any = {};
                    bodyObj.forEach(p => { if (p?.key) obj[p.key] = p.value; });
                    if (Object.keys(obj).length > 0) cleanedConfig.body_params = obj;
                }
            }
            if (rawConfig.fallback_message) {
                cleanedConfig.fallback_message = rawConfig.fallback_message;
            }
            if (Array.isArray(rawConfig.input_keys)) {
                const filtered = rawConfig.input_keys.filter((keyItem: any) => keyItem && keyItem.key);
                if (filtered.length > 0) cleanedConfig.input_keys = filtered;
            }
            const cleanedDraft = { ...actionDraft, configurations_json: cleanedConfig, status: 'draft' as const };

            let res;
            if (actionToEdit) {
                res = await updateActionDefinition(actionToEdit.id, cleanedDraft);
                if (res.success) {
                    message.success(res.message || 'Action draft updated!');
                }
            } else {
                res = await createAction(cleanedDraft);
                if (res.success) {
                    message.success(res.message || 'Action saved as draft!');
                }
            }

            if (res.success) {
                await onCreated();
                onClose();
            } else {
                message.error(res.error || 'Failed to save draft.');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            message.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            title: 'Overview',
            description: 'Provide basic details and categorization for the action.',
            content: <CreateActionOverview key={actionToEdit?.id || 'new-action'} draft={actionDraft} setDraft={setActionDraft} form={overviewForm} />
        },
        {
            title: 'Configuration',
            description: 'Configure API endpoints, methods, and parameters.',
            content: <CreateActionConfigStep key={actionToEdit?.id || 'new-action'} draft={actionDraft} setDraft={setActionDraft} form={configForm} onTestClick={handleTestApi} isTesting={testState === 'loading'} />
        },
        {
            title: 'Review & Publish',
            description: 'Double check all settings before taking the action live.',
            content: <CreateActionReviewStep key={actionToEdit?.id || 'new-action'} draft={actionDraft} setDraft={setActionDraft} />
        },
    ];

    const currentStepObj = steps[currentStep];

    return (
        <Modal
            title={null}
            open={isOpen}
            onCancel={onClose}
            width={1100}
            footer={null}
            destroyOnClose
            className="create-action-modal"
            centered
            zIndex={1300}
            styles={{ body: { padding: 0, height: 800, display: 'flex', flexDirection: 'row' } }}
        >
            {/* -- Left Side: Pure Vertical Navigator -- */}
            <div className="create-action-modal__stepper-col">
                <div style={{ marginBottom: 32, paddingLeft: 4 }}>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                        {actionToEdit ? 'Edit Action' : 'Create New Action'}
                    </span>
                </div>
                <div className="create-action-modal__stepper">
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {steps.map((step, index) => {
                            const isFinished = index < currentStep;
                            const isActive = index === currentStep;
                            const isLast = index === steps.length - 1;
                            return (
                                <div key={index} style={{ display: 'flex', gap: 16, cursor: 'pointer' }} onClick={() => handleStepChange(index)}>
                                    {/* Icon + Line column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                        {/* Step icon */}
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                            backgroundColor: isActive || isFinished ? 'var(--accent)' : 'transparent',
                                            border: `1.5px solid ${isActive || isFinished ? 'var(--accent)' : '#e2e8f0'}`,
                                            color: isActive || isFinished ? '#fff' : '#94a3b8',
                                            fontSize: 13, fontWeight: 700,
                                            transition: 'background-color 0.4s ease, border-color 0.4s ease, color 0.3s ease',
                                            boxShadow: isActive ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
                                        }}>
                                            <span style={{ transition: 'transform 0.3s ease', transform: isFinished ? 'scale(1.1)' : 'scale(1)' }}>
                                                {isFinished ? '✓' : index + 1}
                                            </span>
                                        </div>
                                        {/* Connector line */}
                                        {!isLast && (
                                            <div style={{
                                                width: 2,
                                                flex: 1,
                                                minHeight: 40,
                                                background: isFinished
                                                    ? 'var(--accent)'
                                                    : 'linear-gradient(to bottom, #e2e8f0, #e2e8f0)',
                                                margin: '4px 0',
                                                borderRadius: 2,
                                                transition: 'background 0.5s ease',
                                            }} />
                                        )}
                                    </div>
                                    {/* Text content */}
                                    <div style={{ paddingBottom: isLast ? 0 : 28, paddingTop: 4 }}>
                                        <div style={{
                                            fontSize: 14, fontWeight: 700,
                                            color: isActive ? 'var(--accent)' : isFinished ? '#1E293B' : '#94a3b8',
                                            lineHeight: '24px',
                                            transition: 'color 0.3s ease',
                                        }}>
                                            {step.title}
                                        </div>
                                        <div style={{
                                            fontSize: 12,
                                            color: isActive ? '#334155' : isFinished ? '#64748b' : '#94a3b8',
                                            lineHeight: 1.5,
                                            transition: 'color 0.3s ease',
                                        }}>
                                            {step.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* -- Right Side: Dedicated Form Panel -- */}
            <div className="create-action-modal__form-col">
                <div className="create-action-modal__header">
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        Step {currentStep + 1} / {steps.length}
                    </span>
                    <Text strong style={{ fontSize: '26px', fontWeight: 700, display: 'block', marginBottom: 6, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        {currentStepObj.title}
                    </Text>
                    <Text style={{ fontSize: '14px', color: '#64748B', display: 'block', lineHeight: 1.5 }}>
                        {currentStepObj.description}
                    </Text>
                </div>

                <div className="create-action-modal__step-content">
                    {steps[currentStep].content}
                </div>

                <div className="create-action-modal__footer">
                    <div></div>
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSaveAsDraft} loading={isSubmitting}>Save as Draft</Button>
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
