import { useEffect } from 'react';
import { Form, Input, Select, Typography, Divider, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { HTTP_METHODS } from '@/constants';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionConfigStep.css';

const { Title, Text } = Typography;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Title level={5} className="action-config-step__section-title">{children}</Title>
);

const DynamicParamList = ({ name, title, emptyMessage }: { name: string, title: string, emptyMessage: string }) => (
    <div className="action-config-step__param-group">
        <Text strong className="action-config-step__subsection-label">{title}</Text>
        <Form.List name={name}>
            {(fields, { add, remove }) => (
                <>
                    {fields.length === 0 && (
                        <Text type="secondary" className="action-config-step__empty-hint">
                            {emptyMessage}
                        </Text>
                    )}
                    {fields.map(({ key, name: fieldName, ...restField }) => (
                        <div key={key} className="action-config-step__kv-row">
                            <Form.Item
                                {...restField}
                                name={[fieldName, 'key']}
                                className="action-config-step__kv-field"
                            >
                                <Input placeholder="Key" />
                            </Form.Item>
                            
                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => 
                                    prevValues[name]?.[fieldName]?.key !== currentValues[name]?.[fieldName]?.key
                                }
                            >
                                {({ getFieldValue }) => {
                                    const keyVal = getFieldValue([name, fieldName, 'key']);
                                    return (
                                        <Form.Item
                                            {...restField}
                                            name={[fieldName, 'value']}
                                            className="action-config-step__kv-field"
                                            rules={keyVal ? [{ required: true, message: 'Required' }] : []}
                                        >
                                            <Input placeholder="Value" />
                                        </Form.Item>
                                    );
                                }}
                            </Form.Item>

                            <DeleteOutlined
                                className="action-config-step__delete-icon"
                                onClick={() => remove(fieldName)}
                            />
                        </div>
                    ))}
                    <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className="action-config-step__add-btn"
                    >
                        Add {title}
                    </Button>
                </>
            )}
        </Form.List>
    </div>
);

export default function CreateActionConfigStep({ draft, setDraft, form: externalForm }: CreateActionStepProps) {
    const [internalForm] = Form.useForm();
    const form = externalForm || internalForm;

    // Only seed form on initial mount or when configurations_json reference changes from outside (e.g. edit mode)
    useEffect(() => {
        const config = draft.configurations_json;
        if (config && Object.keys(config).length > 0) {
            const formConfig = { ...config };
            if (formConfig.body_params && !Array.isArray(formConfig.body_params) && typeof formConfig.body_params === 'object') {
                formConfig.body_params = Object.entries(formConfig.body_params).map(([key, value]) => ({ key, value }));
            }
            form.setFieldsValue(formConfig);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleValuesChange = (changedValues: any, allValues: any) => {
        let newValues = { ...allValues };

        // 1. If URL changed manually, parse it to update path/query params
        if ('url' in changedValues) {
            const urlStr = changedValues.url || '';
            
            // Parse path params (e.g. /users/:id)
            const pathMatches = [...urlStr.matchAll(/:([a-zA-Z0-9_]+)/g)];
            const pathKeys = pathMatches.map(match => match[1]);
            
            // Preserve existing path values if key matches
            const currentPathParams = newValues.path_params || [];
            newValues.path_params = pathKeys.map(key => {
                const existing = currentPathParams.find((param: any) => param && param.key === key);
                return existing ? existing : { key, value: '' };
            });

            // Parse query params (e.g. ?search=test&sort=asc)
            const queryParams: any[] = [];
            try {
                const urlParts = urlStr.split('?');
                if (urlParts.length > 1) {
                    const searchParams = new URLSearchParams(urlParts[1]);
                    searchParams.forEach((val, key) => {
                        queryParams.push({ key, value: val });
                    });
                }
            } catch (e) {
                // Ignore parse errors
            }
            if (queryParams.length > 0 || urlStr.includes('?')) {
                 newValues.query_params = queryParams;
            }

            form.setFieldsValue({ 
                path_params: newValues.path_params, 
                query_params: newValues.query_params 
            });
        }

        // 2. If path_params or query_params changed, rebuild the URL
        if ('path_params' in changedValues || 'query_params' in changedValues) {
            const baseUrl = newValues.url || '';
            const pathParams = newValues.path_params || [];
            const queryParams = newValues.query_params || [];

            let [basePath] = baseUrl.split('?');
            
            const formPathKeys = pathParams.map((param: any) => param?.key).filter(Boolean);
            const currentPathKeys = [...basePath.matchAll(/:([a-zA-Z0-9_]+)/g)].map(match => match[1]);

            // First, remove path params from the URL that were deleted from the form
            currentPathKeys.forEach((key) => {
                if (!formPathKeys.includes(key)) {
                    basePath = basePath.replace(new RegExp(`/:${key}(?=/|$)`, 'g'), '');
                    basePath = basePath.replace(new RegExp(`^:${key}(?=/|$)`, 'g'), '');
                }
            });

            // Re-check after removal
            const finalPathKeys = [...basePath.matchAll(/:([a-zA-Z0-9_]+)/g)].map(match => match[1]);

            // Then, append path params that are in the form but missing from the URL
            pathParams.forEach((param: any) => {
                if (param && param.key && !finalPathKeys.includes(param.key)) {
                    basePath += (basePath.endsWith('/') ? '' : '/') + `:${param.key}`;
                }
            });

            // Rebuild query string
            const validQueries = queryParams.filter((query: any) => query && query.key);
            let updatedUrl = basePath;

            if (validQueries.length > 0) {
                const searchParams = new URLSearchParams();
                validQueries.forEach((query: any) => {
                    searchParams.append(query.key, query.value || '');
                });
                updatedUrl = basePath + '?' + decodeURIComponent(searchParams.toString());
            }

            newValues.url = updatedUrl;
            form.setFieldsValue({ url: updatedUrl });
        }

        setDraft(prev => ({ ...prev, configurations_json: newValues }));
    };

    return (
        <div className="action-config-step">
            <div className="action-config-step__header">
                <Title level={5} className="action-config-step__header-title">Action Configuration</Title>
                <Text type="secondary">
                    Define the endpoint, parameters, and state mappings for this action.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                className="action-config-step__form"
            >
                {/* ── Section 1: Endpoint ── */}
                <SectionTitle>Endpoint</SectionTitle>
                <div className="action-config-step__flex-row">
                    <Form.Item label="URL" name="url" className="action-config-step__flex-item">
                        <Input placeholder="https://api.example.com/v1/resource" />
                    </Form.Item>
                    <Form.Item label="Method" name="method" className="action-config-step__method-select">
                        <Select placeholder="GET" options={HTTP_METHODS} />
                    </Form.Item>
                </div>

                {/* ── Section 2: Parameters (Dynamic Key-Value) ── */}
                <Divider />
                <SectionTitle>Integration Parameters</SectionTitle>
                
                <DynamicParamList 
                    name="path_params" 
                    title="Path Parameters" 
                    emptyMessage="No path parameters added." 
                />
                <DynamicParamList name="query_params" title="Query Parameters" emptyMessage="No query parameters added." />
                <DynamicParamList name="header_params" title="Header Parameters" emptyMessage="No header key-value pairs added." />
                <DynamicParamList name="body_params" title="Body Parameters" emptyMessage="No body parameters added." />

                {/* ── Section 3: Fallback ── */}
                <Divider />
                <SectionTitle>Fallback Configuration</SectionTitle>
                <Form.Item name="fallback_message" label="Fallback Message">
                    <Input.TextArea placeholder="Enter a message to be used if the action fails..." rows={3} />
                </Form.Item>

                {/* ── Section 3: State Management ── */}
                <Divider />
                <SectionTitle>State Management</SectionTitle>

                <div className="action-config-step__state-row">
                    {/* Input Keys */}
                    <div className="action-config-step__state-col">
                        <Text strong className="action-config-step__subsection-label">Input</Text>
                        <Form.List name="input_keys">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.length === 0 && (
                                        <Text type="secondary" className="action-config-step__empty-hint">
                                            No input keys added yet.
                                        </Text>
                                    )}
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} className="action-config-step__key-row">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'key']}
                                                className="action-config-step__key-field"
                                            >
                                                <Input placeholder="e.g. claim_id" />
                                            </Form.Item>
                                            <DeleteOutlined
                                                className="action-config-step__delete-icon"
                                                onClick={() => remove(name)}
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        className="action-config-step__add-btn"
                                    >
                                        Add Input Key
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </div>

                    {/* Vertical Divider */}
                    <Divider type="vertical" className="action-config-step__state-divider" />

                    {/* Output Key */}
                    <div className="action-config-step__state-col">
                        <Text strong className="action-config-step__subsection-label">Output</Text>
                        <Form.Item name="output_key">
                            <Input placeholder="e.g. result_key" />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </div>
    );
}
