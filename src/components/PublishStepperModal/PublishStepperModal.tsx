/**
 * PublishStepperModal — 3-step animated publish flow.
 * Step 1: Generate Code (API call)
 * Step 2: Rendering Code (preview)
 * Step 3: Success
 */

import { useState, useEffect } from 'react';
import { Modal, Steps, Spin, Typography, Button, message, Input } from 'antd';
import {
    CodeOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { generateCode } from '@/services/graph.service';
import type { PublishStepperModalProps } from '@/interfaces';
import './PublishStepperModal.css';

const { Text, Title } = Typography;

export default function PublishStepperModal({
    isOpen,
    versionId,
    onClose,
    onViewCode,
}: PublishStepperModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [generatedCode, setGeneratedCode] = useState('');
    const [downloadName, setDownloadName] = useState('workflow.py');
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setGeneratedCode('');
            setDownloadName('workflow.py');
            setError('');
            startCodeGeneration();
        }
    }, [isOpen]);

    const startCodeGeneration = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const result: any = await generateCode(versionId);
            const code = result?.code || result?.data?.code || '';
            if (!code) throw new Error('No code returned from API');
            setGeneratedCode(code);
            setCurrentStep(1);

            // Auto-advance to success after a brief preview delay
            setTimeout(() => setCurrentStep(2), 1500);
        } catch (err: any) {
            const msg = err?.message || 'Failed to generate code';
            setError(msg);
            message.error(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([generatedCode], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName.endsWith('.py') ? downloadName : `${downloadName}.py`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success(`Downloaded ${a.download}`);
    };

    const stepItems = [
        {
            title: 'Generate Code',
            icon: currentStep === 0 && isGenerating ? <LoadingOutlined /> : <CodeOutlined />,
        },
        {
            title: 'Rendering Code',
            icon: currentStep === 1 ? <LoadingOutlined /> : <CodeOutlined />,
        },
        {
            title: 'Success',
            icon: <CheckCircleOutlined />,
        },
    ];

    const renderStepContent = () => {
        if (error) {
            return (
                <div className="publish-stepper-modal__content" key="error">
                    <Text type="danger" style={{ fontSize: 16 }}>{error}</Text>
                    <Button onClick={startCodeGeneration}>Retry</Button>
                </div>
            );
        }

        switch (currentStep) {
            case 0:
                return (
                    <div className="publish-stepper-modal__content" key="step-0">
                        <div className="publish-stepper-modal__spinner">
                            <Spin size="large" indicator={<LoadingOutlined spin />} />
                        </div>
                        <Title level={5}>Generating LangGraph Code...</Title>
                        <Text type="secondary">
                            Analyzing your workflow graph and building the execution plan
                        </Text>
                    </div>
                );
            case 1:
                return (
                    <div className="publish-stepper-modal__content" key="step-1">
                        <Title level={5}>Rendering Generated Code</Title>
                        <div className="publish-stepper-modal__code-preview">
                            <Editor
                                height="250px"
                                language="python"
                                value={generatedCode}
                                theme="vs-dark"
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 12,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 8 },
                                }}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="publish-stepper-modal__content" key="step-2">
                        <CheckCircleOutlined className="publish-stepper-modal__success-icon" />
                        <Title level={4}>Code Generated Successfully!</Title>
                        <Text type="secondary">
                            Your LangGraph workflow code is ready to download or view.
                        </Text>
                        <div className="publish-stepper-modal__actions">
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => onViewCode?.(generatedCode)}
                            >
                                View Code
                            </Button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Input 
                                    value={downloadName} 
                                    onChange={(e) => setDownloadName(e.target.value)} 
                                    style={{ width: '180px' }} 
                                    placeholder="workflow.py"
                                />
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={handleDownload}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            title="Publish Workflow"
            open={isOpen}
            onCancel={onClose}
            width={650}
            className="publish-stepper-modal"
            footer={null}
            destroyOnClose
        >
            <Steps
                current={currentStep}
                items={stepItems}
                className="publish-stepper-modal__steps"
            />
            {renderStepContent()}
        </Modal>
    );
}
