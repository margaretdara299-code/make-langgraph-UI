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
        <div className="review-root">
            <Card
                size="small"
                bordered={true}
                className="review-overview-card"
                title={
                    <div className="review-card-title-row">
                        <span className="review-card-title-text">Overview</span>
                        <Tag color={isEditMode ? 'orange' : 'green'} bordered={false} className="review-mode-tag">
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
                <div className="review-payload-header">
                    <Text strong className="review-payload-label">
                        Payload Snapshot ({isEditMode ? 'PUT' : 'POST'})
                    </Text>
                    <Tag color="blue" bordered={false} className="review-json-tag">JSON</Tag>
                </div>
                <Card
                    size="small"
                    className="review-code-card"
                    styles={{ body: { padding: '16px' } }}
                >
                    <div className="review-payload-scroll">
                        <pre className="review-payload-pre">
                            {JSON.stringify(finalPayload, null, 2)}
                        </pre>
                    </div>
                </Card>
            </div>
        </div>
    );
}
