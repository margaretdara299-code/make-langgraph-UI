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

export default function CreateActionConfigStep({ draft, setDraft }: CreateActionStepProps) {
    const [form] = Form.useForm();

    // Only seed form on initial mount or when configurations_json reference changes from outside (e.g. edit mode)
    useEffect(() => {
        const config = draft.configurations_json;
        if (config && Object.keys(config).length > 0) {
            form.setFieldsValue(config);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleValuesChange = (_: any, allValues: any) => {
        // Store ALL form values (including empty rows) so the form state stays intact.
        // Empty-field stripping is done only at final save time, not during editing.
        setDraft(prev => ({ ...prev, configurations_json: allValues }));
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
                <SectionTitle>Parameters</SectionTitle>
                <Form.List name="parameters">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.length === 0 && (
                                <Text type="secondary" className="action-config-step__empty-hint">
                                    No parameters added yet. Click "Add Parameter" to define key-value pairs.
                                </Text>
                            )}
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="action-config-step__kv-row">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'key']}
                                        className="action-config-step__kv-field"
                                    >
                                        <Input placeholder="Key" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'value']}
                                        className="action-config-step__kv-field"
                                    >
                                        <Input placeholder="Value" />
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
                                Add Parameter
                            </Button>
                        </>
                    )}
                </Form.List>

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
