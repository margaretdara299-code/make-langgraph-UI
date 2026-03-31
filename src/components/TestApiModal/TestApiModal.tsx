import { Modal, Button, Row, Col, Typography, Descriptions, Tag, Progress } from 'antd';
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
    return (
        <Modal
            title="Test API Connection"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <div key="footer" className="test-api-modal__footer-inner">
                    <Button key="close" onClick={onClose} size="large">Close</Button>
                </div>
            ]}
            width={1000}
            centered
            className="test-api-modal"
        >
            {testState === 'loading' && (
                <div className="test-api-modal__loading">
                    <Progress percent={99} status="active" showInfo={false} strokeColor="var(--color-primary)" />
                    <Text type="secondary" className="test-api-modal__loading-text">Sending request to endpoint...</Text>
                </div>
            )}
            
            {testState !== 'loading' && testInputPayload && (
                <Row gutter={24} className="test-api-modal__content-row">
                    <Col span={12}>
                        <div className="test-api-modal__section-header">
                            <Text strong className="test-api-modal__section-title">Request Input</Text>
                        </div>
                        <div className="test-api-modal__container">
                            <Descriptions bordered size="small" column={1} layout="vertical">
                                <Descriptions.Item label="Endpoint">
                                    <Tag color="geekblue">{testInputPayload.method.toUpperCase()}</Tag>
                                    <Text copyable className="test-api-modal__url-text">{testInputPayload.url}</Text>
                                </Descriptions.Item>
                                {testInputPayload.headers && Object.keys(testInputPayload.headers).length > 0 && (
                                    <Descriptions.Item label="Headers">
                                        <pre className="test-api-modal__json-pre">
                                            {JSON.stringify(testInputPayload.headers, null, 2)}
                                        </pre>
                                    </Descriptions.Item>
                                )}
                                {testInputPayload.data && (
                                    <Descriptions.Item label="Body">
                                        <pre className="test-api-modal__json-pre">
                                            {JSON.stringify(testInputPayload.data, null, 2)}
                                        </pre>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>
                    </Col>
                    
                    <Col span={12}>
                        <div className="test-api-modal__section-header">
                            <Text strong className="test-api-modal__section-title">Response Output</Text>
                        </div>
                        {testResponse ? (
                            <div className={`test-api-modal__container ${
                                testState === 'error' ? 'test-api-modal__container--error' : 
                                testState === 'success' ? 'test-api-modal__container--success' : ''
                            }`}>
                                <Descriptions bordered size="small" column={1} layout="vertical">
                                    <Descriptions.Item label="Status">
                                        <Tag color={testState === 'success' ? 'green' : 'red'}>
                                            {testResponse.status || 'ERROR'} {testResponse.statusText}
                                        </Tag>
                                        {testResponse.latency !== undefined && (
                                            <Text type="secondary" className="test-api-modal__latency-text">
                                                {testResponse.latency} ms
                                            </Text>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Body">
                                        <div className={`test-api-modal__response-body ${
                                            testState === 'success' ? 'test-api-modal__response-body--success' : 
                                            'test-api-modal__response-body--error'
                                        }`}>
                                            <pre className="test-api-modal__monospace-pre">
                                                {typeof testResponse.data === 'object' ? JSON.stringify(testResponse.data, null, 2) : String(testResponse.data)}
                                            </pre>
                                        </div>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        ) : (
                            <div className="test-api-modal__placeholder">
                                <Text type="secondary">Waiting for response...</Text>
                            </div>
                        )}
                    </Col>
                </Row>
            )}
        </Modal>
    );
}

