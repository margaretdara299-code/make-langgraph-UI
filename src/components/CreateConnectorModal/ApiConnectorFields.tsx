/**
 * ApiConnectorFields — reusable form items for API connectors.
 * Separated from the Form wrapper to allow embedding in different contexts (Modal, Drawer).
 */

import { Form, Input, Select, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { API_METHOD_OPTIONS, API_BODY_MODE_OPTIONS } from '@/constants';

/** Reusable dynamic key-value pair list */
function KeyValueList({ name, label }: { name: (string | number)[]; label: string }) {
    return (
        <Form.Item label={label}>
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name: fieldName, ...restField }) => (
                            <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                <Form.Item
                                    {...restField}
                                    name={[fieldName, 'key']}
                                    rules={[{ required: true, message: 'Key is required' }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input placeholder="Key" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[fieldName, 'value']}
                                    rules={[{ required: true, message: 'Value is required' }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input placeholder="Value" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(fieldName)} />
                            </Space>
                        ))}
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add {label.replace(/s$/, '')}
                        </Button>
                    </>
                )}
            </Form.List>
        </Form.Item>
    );
}

export default function ApiConnectorFields() {
    return (
        <>
            <Form.Item
                label="Connector Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a connector name' }]}
            >
                <Input placeholder="e.g. Postman-style API Connector" />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter a description' }]}
            >
                <Input.TextArea placeholder="e.g. Configuration using familiar Postman fields" rows={2} />
            </Form.Item>

            <Form.Item
                label="Method"
                name={['configJson', 'method']}
                rules={[{ required: true, message: 'Please select an HTTP method' }]}
            >
                <Select placeholder="Select HTTP method" options={API_METHOD_OPTIONS} />
            </Form.Item>

            <Form.Item
                label="URL"
                name={['configJson', 'url']}
                rules={[{ required: true, message: 'Please enter the API URL' }]}
            >
                <Input placeholder="e.g. https://api.example.com/v1/:resource" />
            </Form.Item>

            {/* ── Dynamic Key-Value Pair Lists ── */}
            <KeyValueList name={['configJson', 'headers']} label="Headers" />
            <KeyValueList name={['configJson', 'queryParams']} label="Query Params" />
            <KeyValueList name={['configJson', 'pathVariables']} label="Path Variables" />

            {/* ── Body ── */}
            <Form.Item
                label="Body Mode"
                name={['configJson', 'body', 'mode']}
            >
                <Select placeholder="Select body mode" options={API_BODY_MODE_OPTIONS} allowClear />
            </Form.Item>

            <Form.Item
                label="Body (Raw)"
                name={['configJson', 'body', 'raw']}
            >
                <Input.TextArea
                    placeholder='e.g. {"status": "active"}'
                    rows={4}
                    style={{ fontFamily: 'monospace' }}
                />
            </Form.Item>
        </>
    );
}
