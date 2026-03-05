/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Drawer, Input, Form, Typography, Select, Button, theme } from 'antd';
import { useReactFlow, useNodes } from '@xyflow/react';
import { useEffect } from 'react';
import type { CanvasNodeData, PropertiesDrawerProps } from '@/interfaces';
import './PropertiesDrawer.css';

const { Title, Text } = Typography;

export default function PropertiesDrawer({ selectedNodeId, onClose }: PropertiesDrawerProps) {
    const { token } = theme.useToken();
    const { setNodes } = useReactFlow();
    const nodes = useNodes();

    // Find the reactive node instance based on the explicit click ID
    const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;
    const [form] = Form.useForm();

    // Re-surface the correct node title onto the form fields when a new one is clicked
    useEffect(() => {
        if (selectedNode) {
            form.setFieldsValue({
                label: (selectedNode.data as unknown as CanvasNodeData).label,
            });
        } else {
            form.resetFields();
        }
    }, [selectedNodeId, selectedNode?.data?.label, form]);

    // When the form values change (i.e. the user types in the label input)
    // we want to instantly update the React Flow node data so the canvas updates.
    const handleValuesChange = (changedValues: any) => {
        if (changedValues.label !== undefined && selectedNode) {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: changedValues.label,
                            },
                        };
                    }
                    return node;
                })
            );
        }
    };

    // Render configuration inputs based on capability type
    const renderNodeConfig = (nodeData: CanvasNodeData) => {
        switch (nodeData.capability) {
            case 'api':
                return (
                    <>
                        <Form.Item label="HTTP Method" name="method" initialValue="POST">
                            <Select
                                options={[
                                    { value: 'GET', label: 'GET' },
                                    { value: 'POST', label: 'POST' },
                                    { value: 'PUT', label: 'PUT' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item label="Endpoint URL" name="endpoint" initialValue="https://api.example.com/v1/">
                            <Input />
                        </Form.Item>
                    </>
                );
            case 'ai':
                return (
                    <>
                        <Form.Item label="Model" name="model" initialValue="gpt-4">
                            <Select
                                options={[
                                    { value: 'gpt-4', label: 'GPT-4' },
                                    { value: 'gpt-3.5', label: 'GPT-3.5-Turbo' },
                                    { value: 'claude-3', label: 'Claude 3 Opus' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item label="System Prompt" name="system_prompt" initialValue="You are a helpful assistant.">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </>
                );
            case 'rules':
                return (
                    <Form.Item label="Rule Expression" name="expression">
                        <Input.TextArea rows={3} placeholder="e.g. payload.status === 'success'" />
                    </Form.Item>
                );
            default:
                return (
                    <div className="properties-drawer__empty-config">
                        <Text type="secondary">No specific configuration available for this capability.</Text>
                    </div>
                );
        }
    };

    // Drawer is open if exactly ONE node is selected
    const isOpen = selectedNode !== null;
    const nodeData = selectedNode?.data as unknown as CanvasNodeData | undefined;

    return (
        <Drawer
            title={
                <div className="properties-drawer__header">
                    <span className="properties-drawer__icon">{nodeData?.icon}</span>
                    <span className="properties-drawer__title-text">Node Properties</span>
                </div>
            }
            placement="right"
            closable={true}
            onClose={onClose}
            open={isOpen}
            mask={false} // Allow interacting with the canvas while drawer is open
            width={340}
            className="properties-drawer"
            zIndex={10} // Keep it above the canvas but below modals
            styles={{
                header: { padding: '16px 20px', background: token.colorBgContainer },
                body: { padding: '20px', background: token.colorBgLayout },
            }}
        >
            {nodeData && (
                <div className="properties-drawer__content">
                    {/* Node Metadata Card */}
                    <div className="properties-drawer__meta" style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }}>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Type</Text>
                            <Text strong>{nodeData.category}</Text>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Capability</Text>
                            <div className={`properties-drawer__capability-badge badge-${nodeData.capability}`}>
                                {nodeData.capability.toUpperCase()}
                            </div>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Action ID</Text>
                            <Text code>{nodeData.actionKey}</Text>
                        </div>
                    </div>

                    <div className="properties-drawer__divider" />

                    {/* Node Configuration Form */}
                    <Title level={5} className="properties-drawer__section-title">Configuration</Title>
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleValuesChange}
                        className="properties-drawer__form"
                    >
                        <Form.Item
                            label="Node Label"
                            name="label"
                            rules={[{ required: true, message: 'Label is required' }]}
                        >
                            <Input />
                        </Form.Item>

                        {/* Render capability-specific mock properties */}
                        {renderNodeConfig(nodeData)}
                    </Form>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                        <Button type="primary" block onClick={() => form.submit()}>
                            Apply
                        </Button>
                        <Button danger variant="outlined" block onClick={() => {
                            if (selectedNode) {
                                setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
                                onClose();
                            }
                        }}>
                            Delete Node
                        </Button>
                    </div>
                </div>
            )}
        </Drawer>
    );
}
