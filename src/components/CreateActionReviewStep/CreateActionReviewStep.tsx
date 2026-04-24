import React from 'react';
import { Typography, Descriptions, Card, Tag } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionReviewStep.css';

const { Text } = Typography;

export default function CreateActionReviewStep({ draft }: CreateActionStepProps) {
    const isEditMode = !!draft.id;

    // Helper to generate the exact payload that will be sent to the server
    const getFinalPayload = () => {
        const payload: any = {
            name: draft.name,
            action_key: draft.action_key,
            description: draft.description,
            category: draft.category,
            capability: draft.capability,
            scope: draft.scope || 'global',
            status: draft.status || 'draft',
            icon: draft.icon,
        };

        const rawConfig = draft.configurations_json || {};
        const cleanedConfig: Record<string, any> = {};

        if (rawConfig.url) cleanedConfig.url = rawConfig.url;
        if (rawConfig.method) cleanedConfig.method = rawConfig.method;
        if (rawConfig.output_key) cleanedConfig.output_key = rawConfig.output_key;

        ['path_params', 'query_params', 'header_params'].forEach(paramType => {
            const paramObj = rawConfig[paramType];
            if (paramObj && typeof paramObj === 'object' && !Array.isArray(paramObj)) {
                if (Object.keys(paramObj).length > 0) cleanedConfig[paramType] = paramObj;
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
                if (Object.keys(bodyObj).length > 0) cleanedConfig.body_params = bodyObj;
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
            const filtered = rawConfig.input_keys.filter((item: any) => item?.key && item.key.trim() !== '');
            if (filtered.length > 0) cleanedConfig.input_keys = filtered;
        }

        payload.configurations_json = cleanedConfig;

        // Strip undefined/null top-level fields
        return Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
        );
    };

    const finalPayload = getFinalPayload();

    return (
        <div style={{ padding: '0 4px' }}>
            <Card
                size="small"
                bordered={true}
                style={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    marginBottom: 20
                }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>Overview</span>
                        <Tag color={isEditMode ? 'orange' : 'green'} bordered={false} style={{ fontSize: '10px', borderRadius: 4, margin: 0, fontWeight: 700 }}>
                            {isEditMode ? 'Update Mode' : 'Create Mode'}
                        </Tag>
                    </div>
                }
            >
                <Descriptions
                    layout="vertical"
                    column={4}
                    size="small"
                    colon={false}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em' }}
                    contentStyle={{ color: '#1e293b', fontSize: '13px', fontWeight: 500, paddingTop: 4 }}
                >
                    <Descriptions.Item label="Name">{draft.name || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Key">{draft.action_key || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Category">{draft.category || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Capability">{draft.capability || 'N/A'}</Descriptions.Item>
                </Descriptions>
            </Card>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.02em' }}>
                        Payload Snapshot ({isEditMode ? 'PUT' : 'POST'})
                    </Text>
                    <Tag color="blue" bordered={false} style={{ fontSize: '10px', borderRadius: 4, margin: 0 }}>JSON</Tag>
                </div>
                <Card
                    size="small"
                    style={{
                        background: '#0f172a',
                        borderRadius: 12,
                        border: '1px solid #1e293b',
                    }}
                    styles={{ body: { padding: '16px' } }}
                >
                    <div className="review-payload-scroll" style={{ maxHeight: '310px', overflowY: 'auto' }}>
                        <pre style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#cbd5e1',
                            lineHeight: 1.6,
                            letterSpacing: '0.01em',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            {JSON.stringify(finalPayload, null, 2)}
                        </pre>
                    </div>
                </Card>
            </div>
        </div>
    );
}
