/**
 * ActionPreviewPanel — a real-time card preview of the Action being drafted.
 */

import { Typography, Card, Button, Tooltip } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { ActionCard } from '@/components';
import type { ActionDefinition, ActionPreviewPanelProps } from '@/interfaces';
import './ActionPreviewPanel.css';

const { Title } = Typography;

export default function ActionPreviewPanel({ actionDef, currentStep, onTestApiClick }: ActionPreviewPanelProps) {
    // Generate a mock complete ActionDefinition for the card to render
    const mockAction: ActionDefinition = {
        id: 'preview-01',
        action_key: actionDef.action_key || 'my_new_action',
        name: actionDef.name || 'Untitled Action',
        description: actionDef.description || 'Provide a description for this action...',
        category: actionDef.category || 'Uncategorized',
        capability: actionDef.capability || 'api',
        scope: actionDef.scope || 'global',
        icon: actionDef.icon || '🧩',
        default_node_title: actionDef.default_node_title || actionDef.name || 'Untitled',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };


    return (
        <div className="action-preview-panel">
            <Card title="Action Definition Preview" bordered={false} className="action-preview-panel__card">

                {/* The actual live-updating Action Card mockup */}
                <div className="action-preview-panel__card-wrapper">
                    <ActionCard action={mockAction} />
                </div>

                {/* API Test Button placed here for high visibility */}
                <div className="action-preview-panel__test-btn-wrapper">
                    <Tooltip title={currentStep !== 2 ? "The API testing feature is only available during the Configuration step." : "Open Test Interface"}>
                        <span>
                            <Button 
                                type="primary" 
                                icon={<ApiOutlined />} 
                                size="large" 
                                block
                                disabled={currentStep !== 2}
                                onClick={onTestApiClick}
                            >
                                Test API Connection
                            </Button>
                        </span>
                    </Tooltip>
                </div>



                <Title level={5}>Progress</Title>
                <div className="action-preview-panel__steps">
                    {['Overview', 'Configuration', 'Publish'].map((step, idx) => {
                        const stepNum = idx + 1;
                        const isPast = currentStep > stepNum;
                        const isCurrent = currentStep === stepNum;

                        return (
                            <div
                                key={step}
                                className={`action-preview-panel__step ${isPast ? 'action-preview-panel__step--past' : ''} ${isCurrent ? 'action-preview-panel__step--current' : ''}`}
                            >
                                <span className="action-preview-panel__step-num">{stepNum}</span>
                                <span className="action-preview-panel__step-lbl">{step}</span>
                                {isPast && <span className="action-preview-panel__step-check">✓</span>}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
