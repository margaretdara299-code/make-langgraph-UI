/**
 * ActionPreviewPanel — a real-time card preview of the Action being drafted.
 */

import { Typography, Space, Divider, Card } from 'antd';
import { ActionCard } from '@/components';
import type { ActionDefinition, ActionPreviewPanelProps } from '@/interfaces';
import './ActionPreviewPanel.css';

const { Text, Title } = Typography;

export default function ActionPreviewPanel({ actionDef, currentStep }: ActionPreviewPanelProps) {
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
    const configKeysCount = Object.keys(actionDef.configurations_json || {}).length;

    return (
        <div className="action-preview-panel">
            <Card title="Action Definition Preview" bordered={false} className="action-preview-panel__card">

                {/* The actual live-updating Action Card mockup */}
                <div className="action-preview-panel__card-wrapper">
                    <ActionCard action={mockAction} />
                </div>

                <Divider />

                <Title level={5}>Configuration Info</Title>
                <div className="action-preview-panel__stats">
                    <Space size="large">
                        <div className="action-preview-panel__stat">
                            <Text className="action-preview-panel__stat-val">{configKeysCount}</Text>
                            <Text type="secondary" className="action-preview-panel__stat-lbl">Settings Configured</Text>
                        </div>
                    </Space>
                </div>

                <Divider />

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
