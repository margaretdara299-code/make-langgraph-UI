import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Select, Row, Col, Typography, Space, Button, Tabs, Radio, message, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { ACTION_HTTP_METHODS } from '@/constants/action.constants';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionConfigStep.css';

const { Text, Title } = Typography;

// --- Utilities ---
const UrlUtils = {
    parse: (url: string) => {
        const hashIndex = url.indexOf('#');
        const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
        const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
        const queryIndex = withoutHash.indexOf('?');
        const base = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
        const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';
        return { base, query, hash };
    },

    extractQueryRows: (url: string) => {
        const { query } = UrlUtils.parse(url);
        if (!query) return [{ key: '', value: '' }];

        const rows = query.split('&').filter(Boolean).map((entry) => {
            const [rawKey, ...rawValueParts] = entry.split('=');
            return {
                key: decodeURIComponent(rawKey || ''),
                value: decodeURIComponent(rawValueParts.join('=') || '')
            };
        });
        return rows.length > 0 ? rows : [{ key: '', value: '' }];
    },

    buildUrlFromRows: (currentUrl: string, rows: Array<{ key?: string; value?: string }>) => {
        const { base, hash } = UrlUtils.parse(currentUrl || '');
        const queryString = rows
            .filter((item) => item?.key?.trim())
            .map((item) => `${encodeURIComponent(item.key as string)}=${encodeURIComponent(item.value || '')}`)
            .join('&');

        return `${base}${queryString ? `?${queryString}` : ''}${hash}`;
    },

    extractPathRows: (url: string, existingPathParams: Record<string, string> = {}) => {
        const pathParams = Array.from(url.matchAll(/:([a-zA-Z0-9_]+)/g)).map((match: any) => match[1]);
        const rows = pathParams.map((param) => ({
            key: param,
            value: existingPathParams[param] || ''
        }));
        return rows.length > 0 ? rows : [{ key: '', value: '' }];
    },

    toObject: (rows: Array<{ key?: string; value?: string }>) => {
        const obj: Record<string, string> = {};
        rows.forEach((item) => {
            if (item?.key?.trim()) obj[item.key] = item.value || '';
        });
        return obj;
    }
};

interface ParameterSectionProps {
    name: string;
    form: any;
    config: any;
}

const ParameterSection: React.FC<ParameterSectionProps> = ({ name, form, config }) => {
    const bodyType = Form.useWatch(`${name}_type`, form) || 'form-data';
    const isBody = name === 'body_params';
    
    const initialValue = React.useMemo(() => {
        const list = Object.entries((config as any)[name] || {}).map(([k, v]) => ({ key: k, value: v }));
        return list.length > 0 ? list : [{ key: '', value: '' }];
    }, [name, config]);

    const handleBeautify = () => {
        const rawValue = form.getFieldValue(`${name}_raw`);
        if (!rawValue) return;
        try {
            const obj = JSON.parse(rawValue);
            form.setFieldsValue({ [`${name}_raw`]: JSON.stringify(obj, null, 2) });
        } catch (e) {
            message.error('Invalid JSON');
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
                <Form.Item name={`${name}_raw`} style={{ marginBottom: 0 }}>
                    <Input.TextArea 
                        placeholder='{"key": "value"}' 
                        rows={8}
                        className="request-raw-body-input custom-scrollbar"
                    />
                </Form.Item>
            )}

            {(!isBody || bodyType === 'form-data') && (
                <div className="request-params-container">
                    <Row gutter={8} className="request-params-head">
                        <Col flex="0.42"><Text>Key</Text></Col>
                        <Col flex="0.58"><Text>Value</Text></Col>
                        <Col flex="26px" />
                    </Row>

                    <Form.List name={`${name}_list`} initialValue={initialValue}>
                        {(fields, { add, remove }) => (
                            <div className="request-params-body">
                                <div className="request-params-rows">
                                    {fields.map(({ key, name: fieldName, ...restField }) => (
                                        <Row key={key} gutter={6} wrap={false} align="middle" className="request-params-row">
                                            <Col flex="0.42">
                                                <Form.Item {...restField} name={[fieldName, 'key']} className="request-compact-item">
                                                    <Input placeholder="Key" size="small" className="request-compact-input" />
                                                </Form.Item>
                                            </Col>
                                            <Col flex="0.58">
                                                <Form.Item {...restField} name={[fieldName, 'value']} className="request-compact-item">
                                                    <Input placeholder="Value" size="small" className="request-compact-input" />
                                                </Form.Item>
                                            </Col>
                                            <Col flex="26px" className="request-row-action">
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined style={{ fontSize: '12px' }} />}
                                                        onClick={() => remove(fieldName)}
                                                        className="request-delete-btn"
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                    ))}
                                </div>

                                <Button
                                    type="link"
                                    onClick={() => add({ key: '', value: '' })}
                                    size="small"
                                    icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                                    className="request-add-btn"
                                >
                                    Add Row
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </div>
            )}
        </div>
    );
};

export default function CreateActionConfigStep({ draft, setDraft, form: externalForm, onTestClick, isTesting }: CreateActionStepProps) {
    const [internalForm] = Form.useForm();
    const form = externalForm || internalForm;
    const [urlError, setUrlError] = useState<string>('');

    // Reactive tab indicators using Form.useWatch
    const watchedUrl = Form.useWatch('url', form);
    const queryList = Form.useWatch('query_params_list', form);
    const headerList = Form.useWatch('header_params_list', form);
    const pathList = Form.useWatch('path_params_list', form);
    const bodyList = Form.useWatch('body_params_list', form);
    const bodyRaw = Form.useWatch('body_params_raw', form);

    const config = draft.configurations_json || {};
    const isInitialized = useRef(false);
    const debounceTimeout = useRef<any>(null);

    // Initial Hydration
    useEffect(() => {
        const currentConfig = draft.configurations_json;
        if (currentConfig && !isInitialized.current) {
            const formValues: any = { ...currentConfig };
            const paramTypes = ['query_params', 'header_params', 'body_params', 'path_params'];

            paramTypes.forEach((key) => {
                const listName = `${key}_list`;
                const obj = (currentConfig as any)[key] || {};
                formValues[listName] = Object.entries(obj).map(([k, v]) => ({ key: k, value: v }));
                if (formValues[listName].length === 0) formValues[listName] = [{ key: '', value: '' }];
            });

            if (currentConfig.input_keys && Array.isArray(currentConfig.input_keys)) {
                // Ensure array shape is { key: string } objects
                formValues.input_keys = currentConfig.input_keys.map((k: any) => typeof k === 'string' ? { key: k } : k);
            } else if (currentConfig.input_keys && typeof currentConfig.input_keys === 'string') {
                formValues.input_keys = currentConfig.input_keys.split(',').filter((k: string) => k.trim()).map((k: string) => ({ key: k.trim() }));
            }

            form.setFieldsValue(formValues);
            isInitialized.current = true;
        }
    }, [draft.configurations_json, form]);

    const handleValuesChange = (changed: any, allValues: any) => {
        const updatedConfig = { ...config, ...allValues };
        const changedKey = Object.keys(changed)[0];

        // URL <-> Query/Path Sync Logic
        if (changedKey === 'url') {
            const newUrl = changed.url || '';
            const queryRows = UrlUtils.extractQueryRows(newUrl);
            const currentQueryStr = UrlUtils.buildUrlFromRows('', allValues.query_params_list || []).split('?')[1] || '';
            const newQueryStr = UrlUtils.parse(newUrl).query;
            
            if (newQueryStr !== currentQueryStr) {
                updatedConfig.query_params_list = queryRows;
                form.setFieldsValue({ query_params_list: queryRows });
            }

            const pathRows = UrlUtils.extractPathRows(newUrl, updatedConfig.path_params || {});
            form.setFieldsValue({ path_params_list: pathRows });
        }

        if (changedKey === 'query_params_list') {
            const newUrl = UrlUtils.buildUrlFromRows(allValues.url || '', allValues.query_params_list);
            if (newUrl !== (allValues.url || '')) {
                form.setFieldsValue({ url: newUrl });
                updatedConfig.url = newUrl;
            }
        }

        // Data Serialization
        ['query_params', 'header_params', 'body_params', 'path_params'].forEach((key) => {
            const listName = `${key}_list`;
            if (allValues[listName]) {
                (updatedConfig as any)[key] = UrlUtils.toObject(allValues[listName]);
            }
        });

        // Debounced Parent Update
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        const isTypingField = changedKey === 'body_params_raw' || changedKey === 'url' || changedKey === 'fallback_message' || (changedKey?.endsWith('_list'));
        
        const updateParent = () => setDraft(prev => ({ ...prev, configurations_json: updatedConfig }));

        if (isTypingField) {
            debounceTimeout.current = setTimeout(updateParent, 300);
        } else {
            updateParent();
        }
    };

    // Flush any pending updates when the component unmounts (e.g. switching steps)
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
                // We need the latest config from the form
                const currentValues = form.getFieldsValue();
                const latestConfig = { ...config, ...currentValues };
                ['query_params', 'header_params', 'body_params', 'path_params'].forEach((key) => {
                    const listName = `${key}_list`;
                    if (currentValues[listName]) {
                        (latestConfig as any)[key] = UrlUtils.toObject(currentValues[listName]);
                    }
                });
                setDraft(prev => ({ ...prev, configurations_json: latestConfig }));
            }
        };
    }, [form, setDraft, config]);

    const hasItems = (key: string) => {
        // Fallback check against the saved configuration object
        const savedObj = (config as any)[key] || {};
        const hasSavedData = Object.keys(savedObj).length > 0 && Object.keys(savedObj).some(k => k.trim().length > 0);

        if (key === 'body_params') {
            const hasListItems = bodyList?.some((p: any) => p?.key?.trim() || p?.value?.trim());
            const hasRawContent = bodyRaw && bodyRaw.trim().length > 0;
            return !!(hasListItems || hasRawContent || hasSavedData);
        }

        let list: any[] = [];
        if (key === 'query_params') list = queryList;
        if (key === 'header_params') list = headerList;
        if (key === 'path_params') list = pathList;

        const hasLiveItems = !!(list?.some((p: any) => p?.key?.trim() || p?.value?.trim()));
        return hasLiveItems || hasSavedData;
    };

    const tabConfigs = [
        { key: 'query_params', label: 'Query' },
        { key: 'header_params', label: 'Headers' },
        { key: 'body_params', label: 'Body' },
        { key: 'path_params', label: 'Path' }
    ];

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={config}
            onValuesChange={handleValuesChange}
            className="premium-form request-config-form"
        >
            <Row gutter={24}>
                <Col span={16} className="request-main-col">
                    <div className="request-panel">
                        {/* Method & URL Bar */}
                        <div className="request-bar-wrapper">
                            <div className="request-bar">
                                <Form.Item name="method" initialValue="POST" noStyle>
                                <Select 
                                    size="middle" 
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
                                >
                                    <Input 
                                        placeholder="https://api.example.com/v1/:id" 
                                        variant="borderless" 
                                        className="request-url-input"
                                    />
                                </Form.Item>
                            </div>

                            <Button 
                                type="primary" 
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
                                items={tabConfigs.map(tc => ({
                                    key: tc.key,
                                    label: (
                                        <Space size={6}>
                                            <span className={`request-tab-label ${hasItems(tc.key) ? 'has-data' : ''}`}>
                                                {tc.label}
                                            </span>
                                            {hasItems(tc.key) && <span className="request-tab-dot" />}
                                        </Space>
                                    ),
                                    children: <ParameterSection name={tc.key} form={form} config={config} />
                                }))}
                            />
                        </div>
                    </div>
                </Col>

                <Col span={8} className="request-side-col">
                    <div className="request-side-panel">


                        {/* Fallback Message */}
                        <div className="request-side-card">
                            <div className="request-side-card-top">
                                <span className="request-side-label">Fallback Config</span>
                            </div>
                            <Text className="request-help-text" style={{ marginBottom: 12 }}>Displayed to the user if the API request fails.</Text>
                            
                            <Form.Item
                                name="fallback_message"
                                style={{ marginBottom: 0 }}
                            >
                                <Input.TextArea
                                    placeholder="e.g. Service unavailable..."
                                    autoSize={{ minRows: 3, maxRows: 4 }}
                                    className="request-fallback-input"
                                />
                            </Form.Item>
                        </div>
                    </div>
                </Col>
            </Row>
        </Form>
    );
}
