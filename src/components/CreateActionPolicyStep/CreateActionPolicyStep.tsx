/**
 * CreateActionPolicyStep — Step 6: Security, compliance, and data retention settings.
 */

import { useEffect } from 'react';
import { Form, InputNumber, Switch, Checkbox, Input, Typography } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import type { ActionPolicyConfig } from '@/interfaces';
import { ENVIRONMENT_OPTIONS, DEFAULT_POLICY_CONFIG } from '@/constants';
import './CreateActionPolicyStep.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateActionPolicyStep({ draft, setDraft }: CreateActionStepProps) {
    const policy: ActionPolicyConfig = draft.policyJson ?? DEFAULT_POLICY_CONFIG;

    // Seed draft with defaults on mount so the payload is never null
    useEffect(() => {
        if (!draft.policyJson) {
            setDraft(prev => ({ ...prev, policyJson: DEFAULT_POLICY_CONFIG }));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const updatePolicy = (field: keyof ActionPolicyConfig, value: unknown) => {
        setDraft(prev => ({
            ...prev,
            policyJson: { ...policy, [field]: value },
        }));
    };

    return (
        <div className="action-policy-step">
            <div className="action-policy-step__header">
                <Title level={5} style={{ margin: 0 }}>Security &amp; Compliance</Title>
                <Text type="secondary">
                    Set data sensitivity flags and environment restrictions for this action.
                </Text>
            </div>

            <Form layout="vertical" className="action-policy-step__form">
                <div className="action-policy-step__switches">
                    <Form.Item label="Contains PHI (Protected Health Information)">
                        <Switch
                            checked={policy.containsPhi}
                            onChange={(val) => updatePolicy('containsPhi', val)}
                            checkedChildren="Yes"
                            unCheckedChildren="No"
                        />
                    </Form.Item>

                    <Form.Item label="Contains PII (Personally Identifiable Information)">
                        <Switch
                            checked={policy.containsPii}
                            onChange={(val) => updatePolicy('containsPii', val)}
                            checkedChildren="Yes"
                            unCheckedChildren="No"
                        />
                    </Form.Item>

                    <Form.Item label="Requires Audit Logging">
                        <Switch
                            checked={policy.requiresAuditLogging}
                            onChange={(val) => updatePolicy('requiresAuditLogging', val)}
                            checkedChildren="Enabled"
                            unCheckedChildren="Disabled"
                        />
                    </Form.Item>
                </div>

                <Form.Item label="Data Retention (days)">
                    <InputNumber
                        value={policy.dataRetentionDays}
                        onChange={(val) => updatePolicy('dataRetentionDays', val ?? 90)}
                        min={1}
                        max={3650}
                        style={{ width: 200 }}
                    />
                </Form.Item>

                <Form.Item label="Allowed Environments">
                    <Checkbox.Group
                        options={ENVIRONMENT_OPTIONS}
                        value={policy.allowedEnvironments}
                        onChange={(val) => updatePolicy('allowedEnvironments', val as string[])}
                    />
                </Form.Item>

                <Form.Item label="Policy Notes">
                    <TextArea
                        placeholder="Any additional compliance or security notes..."
                        value={policy.notes}
                        onChange={(e) => updatePolicy('notes', e.target.value)}
                        rows={3}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
            </Form>
        </div>
    );
}
