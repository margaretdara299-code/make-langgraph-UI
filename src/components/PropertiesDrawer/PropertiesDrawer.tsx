/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Drawer, Input, Form, Typography, Select, Button, theme } from 'antd';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useEffect } from 'react';
import type { CanvasNodeData, CanvasEdgeData, PropertiesDrawerProps } from '@/interfaces';
import './PropertiesDrawer.css';

const { Title, Text } = Typography;

export default function PropertiesDrawer({ selectedNodeId, selectedEdgeId, onClose }: PropertiesDrawerProps) {
    const { token } = theme.useToken();
    const { setNodes, setEdges } = useReactFlow();
    const nodes = useNodes();
    const edges = useEdges();

    // Find the reactive node or edge instance based on the explicit click ID
    const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
    const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) || null : null;
    const [form] = Form.useForm();

    // Re-surface the correct node/edge title onto the form fields when a new one is clicked
    useEffect(() => {
        if (selectedNode) {
            form.setFieldsValue({
                label: (selectedNode.data as unknown as CanvasNodeData).label,
            });
        } else if (selectedEdge) {
            const edgeData = selectedEdge.data as unknown as CanvasEdgeData | undefined;
            form.setFieldsValue({
                routeType: edgeData?.routeType || 'unconditional',
                conditionLabel: edgeData?.conditionLabel || '',
            });
        } else {
            form.resetFields();
        }
    }, [selectedNodeId, selectedEdgeId, selectedNode?.data?.label, selectedEdge?.data, form]);

    // When the form values change we instantly update the React Flow instance
    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (selectedNode && changedValues.label !== undefined) {
            setNodes((nodes) =>
                nodes.map((node) => {
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
        } else if (selectedEdge) {
            setEdges((edges) =>
                edges.map((edge) => {
                    if (edge.id === selectedEdge.id) {
                        const newRouteType = allValues.routeType;
                        // Use conditionLabel as the visual edge 'label' in ReactFlow if Route is conditional
                        const labelText = newRouteType === 'conditional' ? allValues.conditionLabel : (newRouteType === 'fallback' ? 'Default' : undefined);
                        return {
                            ...edge,
                            label: labelText,
                            labelShowBg: !!labelText,
                            data: {
                                ...edge.data,
                                routeType: newRouteType,
                                conditionLabel: allValues.conditionLabel,
                            },
                        };
                    }
                    return edge;
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

    // Drawer is open if exactly ONE node or exactly ONE edge is selected
    const isOpen = selectedNode !== null || selectedEdge !== null;
    const nodeData = selectedNode?.data as unknown as CanvasNodeData | undefined;
    const edgeData = selectedEdge?.data as unknown as CanvasEdgeData | undefined;

    // Render forms based on what is selected
    const renderContent = () => {
        if (selectedNode && nodeData) {
            return (
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
                            setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
                            onClose();
                        }}>
                            Delete Node
                        </Button>
                    </div>
                </div>
            );
        }

        if (selectedEdge) {
            return (
                <div className="properties-drawer__content">
                    <div className="properties-drawer__meta" style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }}>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Connection</Text>
                            <Text strong>Edge Route</Text>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Current Route</Text>
                            <div className="properties-drawer__capability-badge badge-default" style={{ textTransform: 'capitalize' }}>
                                {edgeData?.routeType || 'unconditional'}
                            </div>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">From Node</Text>
                            <Text code>{selectedEdge.source}</Text>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">To Node</Text>
                            <Text code>{selectedEdge.target}</Text>
                        </div>
                    </div>

                    <div className="properties-drawer__divider" />

                    <Title level={5} className="properties-drawer__section-title">Routing Configuration</Title>
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleValuesChange}
                        className="properties-drawer__form"
                        initialValues={{ routeType: 'unconditional' }}
                    >
                        <Form.Item label="Route Type" name="routeType">
                            <Select
                                options={[
                                    { value: 'unconditional', label: 'Unconditional (Always)' },
                                    { value: 'conditional', label: 'Conditional' },
                                    { value: 'fallback', label: 'Default / Fallback' },
                                ]}
                            />
                        </Form.Item>

                        {/* Render condition label input only when conditional route type is selected */}
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => prevValues.routeType !== currentValues.routeType}
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('routeType') === 'conditional' ? (
                                    <Form.Item
                                        label="Condition Label"
                                        name="conditionLabel"
                                        rules={[{ required: true, message: 'Please provide a condition label' }]}
                                    >
                                        <Input placeholder="e.g. status == 'success'" />
                                    </Form.Item>
                                ) : null
                            }
                        </Form.Item>
                    </Form>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                        <Button type="primary" block onClick={() => form.submit()}>
                            Apply
                        </Button>
                        <Button danger variant="outlined" block onClick={() => {
                            setEdges((edges) => edges.filter(edge => edge.id !== selectedEdge.id));
                            onClose();
                        }}>
                            Delete Edge
                        </Button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <Drawer
            title={
                <div className="properties-drawer__header">
                    <span className="properties-drawer__icon">
                        {selectedNode ? nodeData?.icon : selectedEdge ? '↪️' : ''}
                    </span>
                    <span className="properties-drawer__title-text">
                        {selectedNode ? 'Node Properties' : 'Edge Properties'}
                    </span>
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
            {renderContent()}
        </Drawer>
    );
}
