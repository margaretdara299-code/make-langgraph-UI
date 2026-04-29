import React from 'react';
import { Form, Input, Select, Button, Space, Tabs, Row, Col, Typography, Collapse, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import type { CreateActionStepProps } from '@/interfaces';
import { ACTION_HTTP_METHODS, UrlUtils, CONFIG_TABS } from './CreateActionConfigStep.constants';
import { useCreateActionConfig } from './useCreateActionConfig.hook';
import type { ParameterSectionProps } from './CreateActionConfigStep.types';
import './CreateActionConfigStep.css';

const { Text } = Typography;

const ParameterSection: React.FC<ParameterSectionProps> = ({ name, form }) => {
    const listName = `${name}_list`;
    const isBody = name === 'body_params';
    const bodyType = Form.useWatch(`${name}_type`, form) || 'form-data';

    const handleBeautify = () => {
        const current = form.getFieldValue(`${name}_raw`);
        if (current) {
            form.setFieldsValue({ [`${name}_raw`]: UrlUtils.beautifyJson(current) });
        }
    };

    return (
        <div className="request-params-section">
            {isBody && (
                <div className="request-body-header">
                    <Form.Item name={`${name}_type`} initialValue="form-data" noStyle>
                        <Radio.Group size="small" className="request-body-type-selector">
                            {['none', 'form-data', 'raw'].map(type => (
                                <Radio key={type} value={type}>
                                    <span className="request-type-label">{type}</span>
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>

                    {bodyType === 'raw' && (
                        <Button type="link" size="small" className="request-beautify-btn" onClick={handleBeautify}>
                            Beautify
                        </Button>
                    )}
                </div>
            )}

            {isBody && bodyType === 'none' && (
                <div className="request-body-empty">
                    <Text type="secondary">This request does not have a body</Text>
                </div>
            )}

            {isBody && bodyType === 'raw' && (
                <div className="request-body-raw">
                    <Form.Item name={`${name}_raw`} className="request-form-item-no-margin">
                        <Input.TextArea
                            placeholder='{"key": "value"}'
                            autoSize={{ minRows: 8, maxRows: 12 }}
                            className="request-raw-textarea custom-scrollbar"
                        />
                    </Form.Item>
                </div>
            )}

            {(!isBody || bodyType === 'form-data') && (
                <div className="request-params-container">
                    <Row gutter={16} className="request-params-head">
                        <Col span={10}><Text className="var-column-header">Key</Text></Col>
                        <Col span={12}><Text className="var-column-header">Value</Text></Col>
                        <Col span={2} />
                    </Row>

                    <Form.List name={listName}>
                        {(fields, { add, remove }) => (
                            <>
                                <div className="request-params-rows custom-scrollbar">
                                    {fields.map(({ key, name: fieldName, ...restField }) => (
                                        <Row key={key} gutter={16} align="middle" className="request-param-row">
                                            <Col span={10}>
                                                <Form.Item {...restField} name={[fieldName, 'key']} className="request-compact-item">
                                                    <Input placeholder="Key" size="small" className="request-compact-input" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item {...restField} name={[fieldName, 'value']} className="request-compact-item">
                                                    <Input placeholder="Value" size="small" className="request-compact-input" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} className="request-row-action">
                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined className="request-icon-sm" />}
                                                    onClick={() => remove(fieldName)}
                                                    className="request-delete-btn"
                                                />
                                            </Col>
                                        </Row>
                                    ))}
                                </div>
                                <Button
                                    type="link"
                                    onClick={() => add({ key: '', value: '' })}
                                    size="small"
                                    icon={<PlusOutlined className="request-icon-sm" />}
                                    className="request-add-btn"
                                >
                                    Add Row
                                </Button>
                            </>
                        )}
                    </Form.List>
                </div>
            )}
        </div>
    );
};

const InputVariablesSection: React.FC<ParameterSectionProps> = ({ form }) => {
    return (
        <div className="request-params-container">
            <div className="request-params-body">
                <div className="group-variables-card">
                    <div className="group-variables-header">
                        <div className="group-header-left">
                            <div className="group-icon-shell">
                                <SendOutlined />
                            </div>
                            <div className="group-title-info">
                                <Text className="group-title">Action Inputs</Text>
                                <Text className="group-subtitle">INPUT_VARIABLES</Text>
                                <Text className="group-desc">Parameters that users will provide when executing this action.</Text>
                            </div>
                        </div>
                    </div>

                    <div className="group-variables-list">
                        <Row gutter={16} className="request-params-head var-column-header-row">
                            <Col span={10}><Text className="var-column-header">NAME / KEY</Text></Col>
                            <Col span={6}><Text className="var-column-header">TYPE</Text></Col>
                            <Col span={6}><Text className="var-column-header">VALUE</Text></Col>
                            <Col span={2} />
                        </Row>
                        
                        <Form.List name="input_keys" initialValue={[{ label: '', key: '', type: 'string', value: '' }]}>
                            {(fields, { add, remove }) => (
                                <>
                                    <div className="request-params-rows custom-scrollbar">
                                        {fields.map(({ key, name: fieldName, ...restField }) => (
                                            <div key={key} className="variable-list-item">
                                                <Row gutter={16} align="middle" style={{ width: '100%' }}>
                                                    <Col span={10}>
                                                        <div className="var-info-cell">
                                                            <Form.Item {...restField} name={[fieldName, 'label']} className="request-compact-item">
                                                                <Input placeholder="Friendly Name" size="small" className="request-compact-input var-name-input" />
                                                            </Form.Item>
                                                            <Form.Item {...restField} name={[fieldName, 'key']} className="request-compact-item">
                                                                <Input placeholder="technical_key" size="small" className="request-compact-input var-key-code" />
                                                            </Form.Item>
                                                        </div>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item {...restField} name={[fieldName, 'type']} initialValue="string" className="request-compact-item">
                                                            <Select size="small" className="request-compact-select var-type-select">
                                                                <Select.Option value="string">STRING</Select.Option>
                                                                <Select.Option value="number">NUMBER</Select.Option>
                                                                <Select.Option value="boolean">BOOLEAN</Select.Option>
                                                                <Select.Option value="json">JSON</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item {...restField} name={[fieldName, 'value']} className="request-compact-item">
                                                            <Input placeholder="Default Value" size="small" className="request-compact-input var-value-input" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={2} className="request-row-action">
                                                        <Button
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={<DeleteOutlined className="request-icon-sm" />}
                                                            onClick={() => remove(fieldName)}
                                                            className="request-delete-btn"
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="link"
                                        onClick={() => add({ label: '', key: '', type: 'string', value: '' })}
                                        size="small"
                                        icon={<PlusOutlined className="request-icon-sm" />}
                                        className="request-add-btn"
                                    >
                                        Add Variable
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CreateActionConfigStep({ draft, setDraft, form: externalForm, onTestClick, isTesting }: CreateActionStepProps) {
    const { 
        form, 
        config, 
        watchedUrl, 
        handleValuesChange, 
        hasItems 
    } = useCreateActionConfig(draft, setDraft, externalForm);


    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={config}
            onValuesChange={handleValuesChange}
            className="premium-form request-config-form"
        >
            <Row gutter={24}>
                <Col span={24} className="request-main-col">
                    <div className="request-panel">
                        {/* Method & URL Bar */}
                        <div className="request-bar-wrapper">
                            <div className="request-bar">
                                <Form.Item name="method" initialValue="POST" noStyle>
                                    <Select
                                        size="large"
                                        variant="borderless"
                                        className="request-method-select"
                                        options={ACTION_HTTP_METHODS}
                                        popupClassName="action-config-step__method-dropdown"
                                    />
                                </Form.Item>

                                <div className="request-url-slot">
                                    <Form.Item
                                        name="url"
                                        rules={[{ required: true, message: 'URL is required.' }]}
                                        className="request-url-form-item"
                                    >
                                        <Input
                                            size="large"
                                            placeholder="https://api.example.com/v1/:id"
                                            variant="borderless"
                                            className="request-url-input"
                                        />
                                    </Form.Item>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={onTestClick}
                                    loading={isTesting}
                                    icon={<SendOutlined />}
                                    className="request-send-btn"
                                    disabled={!watchedUrl || !watchedUrl.trim()}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>

                        {/* Configuration Tabs */}
                        <div className="request-tabs-shell">
                            <Tabs
                                defaultActiveKey="query_params"
                                size="small"
                                className="request-tabs"
                                items={CONFIG_TABS.map(tc => ({
                                    key: tc.key,
                                    label: (
                                        <Space size={6}>
                                            <span className={`request-tab-label ${hasItems(tc.key) ? 'has-data' : ''}`}>
                                                {tc.label}
                                            </span>
                                            {hasItems(tc.key) && <span className="request-tab-dot" />}
                                        </Space>
                                    ),
                                    children: tc.key === 'input_variables' ? 
                                        <InputVariablesSection name={tc.key} form={form} config={config} /> : 
                                        <ParameterSection name={tc.key} form={form} config={config} />
                                }))}
                            />
                        </div>

                        {/* Fallback Message */}
                        <div className="request-accordion-shell">
                            <Collapse
                                ghost
                                items={[{
                                    key: 'fallback',
                                    label: (
                                        <div className="request-fallback-label-row">
                                            <span className="request-side-label request-side-label--inline">Fallback Config</span>
                                            <Text type="secondary" className="request-fallback-hint">(Display if request fails)</Text>
                                        </div>
                                    ),
                                    children: (
                                        <div className="request-fallback-body">
                                            <Form.Item
                                                name="fallback_message"
                                                className="request-form-item-no-margin"
                                            >
                                                <Input.TextArea
                                                    placeholder="e.g. Service unavailable..."
                                                    autoSize={{ minRows: 3, maxRows: 4 }}
                                                    className="request-fallback-input"
                                                />
                                            </Form.Item>
                                        </div>
                                    )
                                }]}
                                className="request-collapse"
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </Form>
    );
}
