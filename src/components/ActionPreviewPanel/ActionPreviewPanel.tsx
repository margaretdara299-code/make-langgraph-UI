/**
 * ActionPreviewPanel — a real-time card preview of the Action being drafted.
 */

import { Typography, Space, Divider, Switch, Card } from 'antd';
import { ActionCard } from '@/components';
import { CREATE_ACTION_STEPS } from '@/constants';
import type { ActionDefinition, ActionPreviewPanelProps } from '@/interfaces';
import './ActionPreviewPanel.css';

const { Text, Title } = Typography;

export default function ActionPreviewPanel({ actionDef, currentStep }: ActionPreviewPanelProps) {
    // Generate a mock complete ActionDefinition for the card to render
    const mockAction: ActionDefinition = {
        id: 'preview-01',
        actionKey: actionDef.actionKey || 'my.new.action',
        name: actionDef.name || 'Untitled Action',
        description: actionDef.description || 'Provide a description for this action...',
        category: actionDef.category || 'Uncategorized',
        capability: actionDef.capability || 'api',
        scope: actionDef.scope || 'global',
        icon: actionDef.icon || '🧩',
        defaultNodeTitle: actionDef.defaultNodeTitle || actionDef.name || 'Untitled',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return (
        <div className="action-preview-panel">
            <Card title="Action Definition Preview" bordered={false} className="action-preview-panel__card">

                {/* The actual live-updating Action Card mockup */}
                <div className="action-preview-panel__card-wrapper">
                    <ActionCard action={mockAction} />
                </div>

                <Divider />

                <Title level={5}>This action will require:</Title>
                <div className="action-preview-panel__stats">
                    <Space size="large">
                        <div className="action-preview-panel__stat">
                            <Text className="action-preview-panel__stat-val">{(actionDef.inputsSchemaJson || []).length}</Text>
                            <Text type="secondary" className="action-preview-panel__stat-lbl">Input fields</Text>
                        </div>
                        <div className="action-preview-panel__stat">
                            <Text className="action-preview-panel__stat-val">{(actionDef.outputsSchemaJson || []).length}</Text>
                            <Text type="secondary" className="action-preview-panel__stat-lbl">Output fields</Text>
                        </div>
                    </Space>
                </div>

                <div className="action-preview-panel__toggles">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div className="action-preview-panel__toggle-row">
                            <Text>Execution config defined</Text>
                            <Switch size="small" checked={currentStep > 2} disabled />
                        </div>
                        <div className="action-preview-panel__toggle-row">
                            <Text>UI Form layout defined</Text>
                            <Switch size="small" checked={currentStep > 4} disabled />
                        </div>
                    </Space>
                </div>

                <Divider />

                <Title level={5}>Next Steps</Title>
                <div className="action-preview-panel__steps">
                    {CREATE_ACTION_STEPS.map((step, idx) => {
                        const stepNum = idx + 2; // Steps 2-7
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
