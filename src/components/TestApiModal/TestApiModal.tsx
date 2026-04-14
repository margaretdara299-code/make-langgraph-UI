import React from 'react';
import { Modal, Tabs, Typography, Space } from 'antd';
import type { TestApiModalProps } from '@/interfaces';
import './TestApiModal.css';

const { Text } = Typography;

export default function TestApiModal({
    isOpen,
    onClose,
    testState,
    testResponse,
    testInputPayload
}: TestApiModalProps) {
    if (!isOpen) return null;

    // Use testResponse or fallback mapping
    const result = testResponse || {};

    // Attempt to determine success purely from status or testState
    const isSuccess = testState === 'success' || (result.status >= 200 && result.status < 300) || result.status === 'success';
    const statusColor = isSuccess ? '#10b981' : (testState === 'error' ? '#ef4444' : '#f59e0b');

    const renderJson = (data: any) => {
        if (testState === 'loading') {
            return <Text style={{ padding: '16px', display: 'block', color: '#cbd5e1' }}>Executing request...</Text>;
        }
        if (!data) return <Text style={{ padding: '16px', display: 'block', color: '#64748b' }}>No content available</Text>;
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        return (
            <pre className="custom-scrollbar" style={{
                margin: 0,
                padding: '16px',
                fontSize: '12px',
                lineHeight: '1.6',
                background: 'transparent',
                borderRadius: '12px',
                overflow: 'auto',
                height: '100%',
                fontFamily: 'var(--ant-font-family-mono, monospace)',
                color: '#cbd5e1',
                border: 'none',
                whiteSpace: 'pre',
                wordWrap: 'normal'
            }}>
                {content}
            </pre>
        );
    };

    return (
        <Modal
            title={<span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Response Details</span>}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={720}
            zIndex={3000}
            centered
            destroyOnClose
            getContainer={() => document.body}
            bodyStyle={{ padding: '0 24px 24px 24px' }}
        >
            <div style={{ marginTop: 20 }}>
                <Tabs
                    defaultActiveKey="response"
                    size="small"
                    style={{ marginTop: 0 }}
                    tabBarExtraContent={
                        <Space size={16} style={{ marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: statusColor
                                }} />
                                <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                                    Status: <span style={{ color: statusColor, fontWeight: 700 }}>{result?.status || (testState === 'loading' ? 'PENDING' : (testState === 'error' ? 'ERROR' : 'UNKNOWN'))}</span>
                                </Text>
                            </div>
                            <div style={{ width: '1px', height: '12px', background: '#e2e8f0' }} />
                            <Text style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Time: <span style={{ color: '#475569', fontWeight: 600 }}>{result?.latency || result?.time || '0'} ms</span>
                            </Text>
                        </Space>
                    }
                >
                    <Tabs.TabPane
                        tab={<span style={{ fontSize: '12px', fontWeight: 600 }}>Body</span>}
                        key="response"
                    >
                        <div style={{
                            height: '450px',
                            overflow: 'hidden',
                            border: '1px solid #1e293b',
                            borderRadius: 12,
                            background: '#0f172a'
                        }}>
                            {renderJson(result?.data || result?.body || (result && Object.keys(result).length > 0 ? result : null))}
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        tab={<span style={{ fontSize: '12px', fontWeight: 600 }}>Headers</span>}
                        key="resp-headers"
                    >
                        <div style={{
                            height: '450px',
                            overflow: 'hidden',
                            border: '1px solid #1e293b',
                            borderRadius: 12,
                            background: '#0f172a'
                        }}>
                            {renderJson(result?.headers)}
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        tab={<span style={{ fontSize: '12px', fontWeight: 600 }}>Request Payload</span>}
                        key="request-payload"
                    >
                        <div style={{
                            height: '450px',
                            overflow: 'hidden',
                            border: '1px solid #1e293b',
                            borderRadius: 12,
                            background: '#0f172a'
                        }}>
                            {renderJson(testInputPayload)}
                        </div>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        </Modal>
    );
}
