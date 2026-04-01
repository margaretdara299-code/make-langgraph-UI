/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Drawer, Input, Form, Typography, Select, Spin, theme, Button } from 'antd';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { HTTP_METHODS } from '@/constants';
import type { CanvasNodeData, CanvasEdgeData, PropertiesDrawerProps } from '@/interfaces';
import { useCategories, useCapabilities } from '@/hooks';
import { loadGraphFromStorage, upsertNodeInStorage, upsertConnectionInStorage } from '@/services/skillGraphStorage.service';
import './PropertiesDrawer.css';

const { Title, Text } = Typography;


export default function PropertiesDrawer({ selectedNodeId, selectedEdgeId, onClose }: PropertiesDrawerProps) {
    const { token } = theme.useToken();
    const { setNodes, setEdges } = useReactFlow();
    const nodes = useNodes();
    const edges = useEdges();
    const { versionId } = useParams<{ versionId: string }>();
    const [isLoadingAction] = useState(false);
    const { categories } = useCategories();
    const categoryMap: Record<number, string> = Object.fromEntries(
        categories.map((category: any) => [category.categoryId ?? category.id ?? category.category_id, category.name])
    );

    const { capabilities: _capabilities } = useCapabilities();

    // Find the reactive node or edge instance based on the explicit click ID
    const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
    const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) || null : null;
    const [form] = Form.useForm();

    // When a node is selected, populate the form from localStorage
    useEffect(() => {
        if (!selectedNode) {
            form.resetFields();
            return;
        }

        // Helper to normalize Object maps to Array of key-value objects for Form.List
        const prepareConfigsForForm = (rawConfigs: any) => {
            if (typeof rawConfigs !== 'object' || Array.isArray(rawConfigs) || !rawConfigs) return {};
            const prepared = { ...rawConfigs };
            ['path_params', 'query_params', 'header_params', 'body_params'].forEach(paramKey => {
                if (prepared[paramKey] && !Array.isArray(prepared[paramKey]) && typeof prepared[paramKey] === 'object') {
                    prepared[paramKey] = Object.entries(prepared[paramKey]).map(([key, value]) => ({ key, value }));
                }
            });
            return prepared;
        };

        // For connectors, read from node.data directly
        if (selectedNode.type === 'connector') {
            const nd = selectedNode.data as any;
            form.setFieldsValue({
                name: nd.label,
                description: nd.description || '',
                config_json: nd.config_json || nd.configJson || {},
            });
            return;
        }

        // For subflows, read from node.data directly
        if (selectedNode.type === 'subflow') {
            const sd = selectedNode.data as any;
            form.setFieldsValue({
                label: sd.label,
                description: sd.description || '',
            });
            return;
        }

        // For action/trigger nodes: read from localStorage
        if (versionId) {
            const stored = loadGraphFromStorage(versionId);
            const storedNode = stored?.nodes?.[selectedNode.id];
            if (storedNode) {
                const configs = prepareConfigsForForm(storedNode.data?.configurations_json);
                form.setFieldsValue({
                    label: storedNode.data?.label || selectedNode.data.label,
                    ...configs,
                });
            } else {
                // Fallback: read from React Flow node data
                const nd = selectedNode.data as any;
                const configs = prepareConfigsForForm(nd.configurations_json);
                form.setFieldsValue({
                    label: nd.label,
                    ...configs,
                });
            }
        } else {
            const nd = selectedNode.data as any;
            const configs = prepareConfigsForForm(nd.configurations_json);
            form.setFieldsValue({
                label: nd.label,
                ...configs,
            });
        }
    }, [selectedNodeId, selectedEdgeId, form, versionId]);

    // When edge is selected, populate edge form
    useEffect(() => {
        if (selectedEdge) {
            const edgeData = selectedEdge.data as unknown as CanvasEdgeData | undefined;
            form.setFieldsValue({
                routeType: edgeData?.routeType || 'unconditional',
                conditionLabel: edgeData?.conditionLabel || '',
            });
        }
    }, [selectedEdgeId, selectedEdge, form]);

    // When the form values change we instantly update the React Flow instance
    const handleValuesChange = (changedValues: any, allValues: any) => {
        let newValues = { ...allValues };

        // 1. If URL changed manually, parse it to update path/query params
        if ('url' in changedValues) {
            const urlStr = changedValues.url || '';
            const pathMatches = [...urlStr.matchAll(/:([a-zA-Z0-9_]+)/g)];
            const pathKeys = pathMatches.map(match => match[1]);
            const currentPathParams = newValues.path_params || [];
            newValues.path_params = pathKeys.map(key => {
                const existing = currentPathParams.find((param: any) => param && param.key === key);
                return existing ? existing : { key, value: '' };
            });

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

            // Remove path params from the URL that were deleted
            currentPathKeys.forEach((key) => {
                if (!formPathKeys.includes(key)) {
                    basePath = basePath.replace(new RegExp(`/:${key}(?=/|$)`, 'g'), '');
                    basePath = basePath.replace(new RegExp(`^:${key}(?=/|$)`, 'g'), '');
                }
            });

            const finalPathKeys = [...basePath.matchAll(/:([a-zA-Z0-9_]+)/g)].map(match => match[1]);

            // Append path params that are in the form but missing from the URL
            pathParams.forEach((param: any) => {
                if (param && param.key && !finalPathKeys.includes(param.key)) {
                    basePath += (basePath.endsWith('/') ? '' : '/') + `:${param.key}`;
                }
            });

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


        if (selectedNode) {
            const currentNode = nodes.find(n => n.id === selectedNode.id);
            if (!currentNode) return;

            let updatedNode: any = null;

            if (selectedNode.type === 'subflow') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label,
                        description: newValues.description,
                    },
                };
            } else if (selectedNode.type === 'connector') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.name || newValues.label,
                        name: newValues.name || newValues.label, // ensure API parity
                        description: newValues.description,
                        config_json: newValues.config_json || newValues.configJson,
                    },
                };
            } else {
                // Action/Trigger nodes
                // Extract configurations (all fields except native node properties)
                const { label, name, description, ...configurations } = newValues;

                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: label || name || currentNode.data.label,
                        name: label || name || currentNode.data.name || currentNode.data.label, // strictly mirror to "name" for API
                        description: description || currentNode.data.description,
                        // Safely merge new edits into existing objects so we don't drop invisible fields
                        configurations_json: { ...(currentNode.data.configurations_json || {}), ...configurations },
                    },
                };
            }

            // Update React Flow state
            setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? updatedNode : n)));

            // Sync to localStorage immediately
            if (versionId && updatedNode) {
                upsertNodeInStorage(versionId, selectedNode.id, updatedNode);
            }
        } else if (selectedEdge) {
            let updatedEdge: any = null;
            setEdges((edges) =>
                edges.map((edge) => {
                    if (edge.id === selectedEdge.id) {
                        const newRouteType = allValues.routeType;
                        const labelText = newRouteType === 'conditional' ? allValues.conditionLabel : (newRouteType === 'fallback' ? 'Default' : undefined);
                        updatedEdge = {
                            ...edge,
                            label: labelText,
                            labelShowBg: !!labelText,
                            data: {
                                ...edge.data,
                                routeType: newRouteType,
                                conditionLabel: allValues.conditionLabel,
                            },
                        };
                        return updatedEdge;
                    }
                    return edge;
                })
            );
            
            // Sync to localStorage
            if (versionId && updatedEdge) {
                // To avoid React Flow specific internal props (like selected) blowing up storage,
                // we store a clean representation
                upsertConnectionInStorage(versionId, selectedEdge.id, {
                    id: updatedEdge.id,
                    source: updatedEdge.source,
                    target: updatedEdge.target,
                    ...updatedEdge.data, // store routeType and conditionLabel
                });
            }
        }
    };

    const DynamicParamList = ({ name, title, emptyMessage }: { name: string, title: string, emptyMessage: string }) => (
        <div className="properties-drawer__param-group" style={{ marginBottom: 16 }}>
            <Text strong className="properties-drawer__subsection-label" style={{ display: 'block', marginBottom: 8 }}>{title}</Text>
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.length === 0 && (
                            <Text type="secondary" className="properties-drawer__empty-hint" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                                {emptyMessage}
                            </Text>
                        )}
                        {fields.map(({ key, name: fieldName, ...restField }) => (
                            <div key={key} className="properties-drawer__kv-row">
                                <Form.Item {...restField} name={[fieldName, 'key']} className="properties-drawer__kv-field">
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
                                                className="properties-drawer__kv-field"
                                                rules={keyVal ? [{ required: true, message: 'Required' }] : []}
                                            >
                                                <Input placeholder="Value" />
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                                <DeleteOutlined className="properties-drawer__delete-icon" onClick={() => remove(fieldName)} />
                            </div>
                        ))}
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                            Add {title}
                        </Button>
                    </>
                )}
            </Form.List>
        </div>
    );

    /** Render the Connector-specific fields */
    const renderNodeConfig = (_nodeData: CanvasNodeData) => {
        return (
            <>
                {/* ── Section 1: Endpoint ── */}
                <Title level={5} className="properties-drawer__section-subtitle">Endpoint</Title>
                <div className="properties-drawer__flex-row">
                    <Form.Item label="URL" name="url" className="properties-drawer__flex-item">
                        <Input placeholder="https://api.example.com/v1/resource" />
                    </Form.Item>
                    <Form.Item label="Method" name="method" className="properties-drawer__method-select">
                        <Select options={HTTP_METHODS} />
                    </Form.Item>
                </div>

                {/* ── Section 2: Integration Parameters ── */}
                <div className="properties-drawer__divider" />
                <Title level={5} className="properties-drawer__section-subtitle">Integration Parameters</Title>
                
                <DynamicParamList name="path_params" title="Path Parameters" emptyMessage="No path parameters." />
                <DynamicParamList name="query_params" title="Query Parameters" emptyMessage="No query parameters." />
                <DynamicParamList name="header_params" title="Header Parameters" emptyMessage="No header parameters." />
                <DynamicParamList name="body_params" title="Body Parameters" emptyMessage="No body parameters." />

                {/* ── Section 3: Fallback Configuration ── */}
                <div className="properties-drawer__divider" />
                <Title level={5} className="properties-drawer__section-subtitle">Fallback Configuration</Title>
                <Form.Item name="fallback_message" label="Fallback Message">
                    <Input.TextArea placeholder="Enter a message to be used if the action fails..." rows={3} />
                </Form.Item>

                {/* ── Section 4: State Management ── */}
                <div className="properties-drawer__divider" />
                <Title level={5} className="properties-drawer__section-subtitle">State Management</Title>
                <div className="properties-drawer__state-row">
                    {/* Input Keys */}
                    <div className="properties-drawer__state-col">
                        <Text strong>Input</Text>
                        <Form.List name="input_keys">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.length === 0 && (
                                        <Text type="secondary" className="properties-drawer__empty-hint">
                                            No input keys.
                                        </Text>
                                    )}
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} className="properties-drawer__kv-row">
                                            <Form.Item {...restField} name={[name, 'key']} className="properties-drawer__kv-field">
                                                <Input placeholder="e.g. claim_id" />
                                            </Form.Item>
                                            <DeleteOutlined className="properties-drawer__delete-icon" onClick={() => remove(name)} />
                                        </div>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                                        Add Input Key
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </div>

                    <div className="properties-drawer__state-divider" />

                    {/* Output Key */}
                    <div className="properties-drawer__state-col">
                        <Text strong>Output</Text>
                        <Form.Item name="output_key">
                            <Input placeholder="e.g. result_key" />
                        </Form.Item>
                    </div>
                </div>
            </>
        );
    };


    // Drawer is open if exactly ONE node or exactly ONE edge is selected
    const isOpen = selectedNode !== null || selectedEdge !== null;
    const nodeData = selectedNode?.data as unknown as CanvasNodeData | undefined;
    const edgeData = selectedEdge?.data as unknown as CanvasEdgeData | undefined;

    // Render forms based on what is selected
    const renderContent = () => {
        if (selectedNode) {
            const isSubFlow = selectedNode.type === 'subflow';
            const isConnector = selectedNode.type === 'connector';

            if (isLoadingAction) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                        <Spin tip="Loading action details..." />
                    </div>
                );
            }

            return (
                <div className="properties-drawer__content">
                    {/* Node Metadata Card */}
                    <div className="properties-drawer__meta" style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }}>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Type</Text>
                            <Text strong>{isSubFlow ? 'Structure Group' : (nodeData?.categoryId ? (categoryMap[nodeData.categoryId] || 'Uncategorized') : (nodeData?.category || 'Uncategorized'))}</Text>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <Text type="secondary">Capability</Text>
                            <div className={`properties-drawer__capability-badge badge-${isSubFlow ? 'default' : nodeData?.capability}`}>
                                {isSubFlow ? 'GROUP' : (nodeData?.capability || 'DEFAULT').toUpperCase()}
                            </div>
                        </div>
                        {!isSubFlow && nodeData?.action_key && (
                            <div className="properties-drawer__meta-item">
                                <Text type="secondary">Action ID</Text>
                                <Text code>{nodeData.action_key}</Text>
                            </div>
                        )}
                        {!isSubFlow && nodeData?.action_version_id && (
                            <div className="properties-drawer__meta-item">
                                <Text type="secondary">Version ID</Text>
                                <Text code style={{ fontSize: 11 }}>{nodeData.action_version_id}</Text>
                            </div>
                        )}
                    </div>

                    <div className="properties-drawer__divider" />

                    {/* Node Configuration Form */}
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleValuesChange}
                        className="properties-drawer__form"
                    >
                        {!isConnector && (
                            <>
                                <Title level={5} className="properties-drawer__section-title">General</Title>
                                <Form.Item
                                    label="Node Label"
                                    name="label"
                                    rules={[{ required: true, message: 'Label is required' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </>
                        )}

                        {isSubFlow && (
                            <Form.Item
                                label="Description"
                                name="description"
                            >
                                <Input.TextArea rows={4} placeholder="What does this group do?" />
                            </Form.Item>
                        )}

                        {!isSubFlow && !isConnector && nodeData && (
                            <>
                                {/* ── Configurations Section ── */}
                                <div className="properties-drawer__divider" />
                                <Title level={5} className="properties-drawer__section-title">Configuration</Title>
                                {renderNodeConfig(nodeData as CanvasNodeData)}
                            </>
                        )}
                        {isConnector && nodeData && renderNodeConfig(nodeData)}
                    </Form>

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
                        {selectedNode ? <IconRenderer iconName={nodeData?.icon} size={18} fallback="⚙️" /> : selectedEdge ? '↪️' : ''}
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
            width={380}
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
