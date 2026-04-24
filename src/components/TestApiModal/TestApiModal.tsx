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
            return <Text className="tam-loading-text">Executing request...</Text>;
        }
        if (!data) return <Text className="tam-empty-text">No content available</Text>;
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        return (
            <pre className="custom-scrollbar tam-response-pre">
                {content}
            </pre>
        );
    };

    return (
        <Modal
            className="test-api-modal"
            title={<span className="tam-modal-title">Response Details</span>}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={720}
            zIndex={3000}
            centered
            destroyOnHidden
            getContainer={() => document.body}
            styles={{ body: { padding: '0 24px 24px 24px' } }}
        >
            <div className="tam-content-wrapper">
                <Tabs
                    defaultActiveKey="response"
                    size="small"
                    style={{ marginTop: 0 }}
                    tabBarExtraContent={
                        <Space size={16} className="tam-tab-meta">
                            <div className="tam-status-row">
                                <div className="tam-status-dot" style={{ background: statusColor }} />
                                <Text className="tam-status-text">
                                    Status: <span className="tam-status-value" style={{ color: statusColor }}>{result?.status || (testState === 'loading' ? 'PENDING' : (testState === 'error' ? 'ERROR' : 'UNKNOWN'))}</span>
                                </Text>
                            </div>
                            <div className="tam-divider-vertical" />
                            <Text className="tam-latency-text">
                                Time: <span className="tam-latency-value">{result?.latency || result?.time || '0'} ms</span>
                            </Text>
                        </Space>
                    }
                >
                    <Tabs.TabPane
                        tab={<span className="tam-tab-label">Body</span>}
                        key="response"
                    >
                        <div className="tam-code-pane">
                            {renderJson(result?.data || result?.body || (result && Object.keys(result).length > 0 ? result : null))}
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        tab={<span className="tam-tab-label">Headers</span>}
                        key="resp-headers"
                    >
                        <div className="tam-code-pane">
                            {renderJson(result?.headers)}
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        tab={<span className="tam-tab-label">Request Payload</span>}
                        key="request-payload"
                    >
                        <div className="tam-code-pane">
                            {renderJson(testInputPayload)}
                        </div>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        </Modal>
    );
}
