/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Drawer, Input, Form, Typography, Select, Spin, theme, Button, Tabs, Collapse } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Settings2, GitBranchPlus, X } from 'lucide-react';
import { HTTP_METHODS } from '@/constants';
import type { CanvasNodeData, CanvasEdgeData, PropertiesDrawerProps } from '@/interfaces';
import { useCategories, useCapabilities } from '@/hooks';
import { loadGraphFromStorage, upsertNodeInStorage, upsertConnectionInStorage } from '@/services/skillGraphStorage.service';
import DecisionPropertiesPanel from './DecisionPropertiesPanel';
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

    // Track state for the header to prevent it from resetting during the closing animation
    const [headerInfo, setHeaderInfo] = useState<{ title: string; icon: React.ReactNode }>({
        title: 'Properties',
        icon: <Settings2 size={18} />
    });

    useEffect(() => {
        if (selectedNode) {
            const nodeData = selectedNode.data as any;
            setHeaderInfo({
                title: nodeData?.label || 'Node Properties',
                icon: <IconRenderer iconName={nodeData?.icon} size={18} fallback={<Settings2 size={18} />} />
            });
        } else if (selectedEdge) {
            setHeaderInfo({
                title: 'Edge Properties',
                icon: <GitBranchPlus size={18} />
            });
        }
    }, [selectedNodeId, selectedEdgeId, nodes, edges]); // Depend on IDs and collections

    // When a node is selected, populate the form from localStorage
    useEffect(() => {
        if (!selectedNode) {
            form.resetFields();
            return;
        }

        // Always clear stale values from the previously selected node
        form.resetFields();

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

        // For start nodes: read initial_state key-value pairs
        if (selectedNode.type === 'start') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const sd = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            form.setFieldsValue({
                label: sd.label || 'Start',
                initial_state: Array.isArray(sd.initial_state) ? sd.initial_state : [],
            });
            return;
        }

        // For end nodes
        if (selectedNode.type === 'end') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const ed = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            form.setFieldsValue({
                label: ed.label || 'End',
                response_format: ed.response_format || 'auto',
                custom_message: ed.custom_message || '',
                fail_status_code: ed.fail_status_code || 500,
                fail_message: ed.fail_message || '',
            });
            return;
        }

        // For decision nodes: read from localStorage first, fallback to node.data
        if (selectedNode.type === 'decision') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const dd = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            form.setFieldsValue({
                label: dd.label || 'Decision',
                rules: Array.isArray(dd.rules) ? dd.rules : [],
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

            if (selectedNode.type === 'start') {
                // Start node — persist initial_state key-value pairs
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label || 'Start',
                        initial_state: newValues.initial_state || [],
                    },
                };
            } else if (selectedNode.type === 'end') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label || 'End',
                        response_format: newValues.response_format,
                        custom_message: newValues.custom_message,
                        fail_status_code: newValues.fail_status_code,
                        fail_message: newValues.fail_message,
                    },
                };
            } else if (selectedNode.type === 'subflow') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label,
                        description: newValues.description,
                    },
                };
            } else if (selectedNode.type === 'decision') {
                // Decision node — store condition config directly on node.data
                const finalRules = (newValues.rules || []).map((r: any, i: number) => ({
                    ...r,
                    id: r.id || (currentNode.data.rules?.[i]?.id) || `branch_${Date.now()}_${i}`
                }));

                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label || 'Decision',
                        rules: finalRules,
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
                    sourceHandle: updatedEdge.sourceHandle,
                    target: updatedEdge.target,
                    targetHandle: updatedEdge.targetHandle,
                    ...updatedEdge.data, // store routeType and conditionLabel
                });
            }
        }
    };

    const DynamicParamList = ({ name, title, emptyMessage, hideTitle = false }: { name: string, title: string, emptyMessage: string, hideTitle?: boolean }) => (
        <div className="properties-drawer__param-group" style={{ marginBottom: hideTitle ? 0 : 16 }}>
            {!hideTitle && <Text strong className="properties-drawer__subsection-label" style={{ display: 'block', marginBottom: 8 }}>{title}</Text>}
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

    const AccordionLabel = ({ name, title, formInstance }: { name: string, title: string, formInstance: any }) => {
        const data = Form.useWatch(name, formInstance);
        const count = Array.isArray(data) ? data.filter((d: any) => d && d.key).length : 0;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>{title}</span>
                <AnimatePresence>
                    {count > 0 && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 20,
                                height: 20,
                                background: '#ecfdf5', 
                                color: '#059669', 
                                border: '1px solid #6ee7b7',
                                fontSize: 11, 
                                fontWeight: 700, 
                                padding: '0 6px', 
                                borderRadius: '10px',
                                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.1)',
                            }}
                        >
                            {count}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    /** Render the Connector-specific fields */
    const renderNodeConfig = (nodeData: CanvasNodeData) => {
        return (
            <>
                {/* ── Section 1: Endpoint ── */}
                <div className="properties-drawer__section-title" style={{ marginTop: 0 }}>Endpoint</div>
                <div className="properties-drawer__flex-row">
                    <Form.Item label="URL" name="url" className="properties-drawer__flex-item">
                        <Input placeholder="https://api.example.com/v1/resource" />
                    </Form.Item>
                </div>
                <div style={{ marginTop: 12 }}>
                    <Form.Item label="HTTP Method" name="method">
                        <Select options={HTTP_METHODS} />
                    </Form.Item>
                </div>

                {/* ── Section 2: Integration Parameters ── */}
                <div className="properties-drawer__section-title">Integration Parameters</div>

                <Collapse
                    accordion
                    defaultActiveKey={['path_params']}
                    ghost
                    expandIconPosition="end"
                    items={[
                        { key: 'path_params', label: <AccordionLabel name="path_params" title="Path Parameters" formInstance={form} />, children: <DynamicParamList name="path_params" title="Path Parameters" emptyMessage="No path parameters." hideTitle /> },
                        { key: 'query_params', label: <AccordionLabel name="query_params" title="Query Parameters" formInstance={form} />, children: <DynamicParamList name="query_params" title="Query Parameters" emptyMessage="No query parameters." hideTitle /> },
                        { key: 'header_params', label: <AccordionLabel name="header_params" title="Header Parameters" formInstance={form} />, children: <DynamicParamList name="header_params" title="Header Parameters" emptyMessage="No header parameters." hideTitle /> },
                        { key: 'body_params', label: <AccordionLabel name="body_params" title="Body Parameters" formInstance={form} />, children: <DynamicParamList name="body_params" title="Body Parameters" emptyMessage="No body parameters." hideTitle /> }
                    ]}
                />
            </>
        );
    };

    const renderStateManagement = () => (
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
    );


    // Drawer is open if exactly ONE node or exactly ONE edge is selected
    const isOpen = selectedNode !== null || selectedEdge !== null;
    const nodeData = selectedNode?.data as unknown as CanvasNodeData | undefined;
    const edgeData = selectedEdge?.data as unknown as CanvasEdgeData | undefined;

    // Render forms based on what is selected
    const renderContent = () => {
        if (selectedNode) {
            const isSubFlow   = selectedNode.type === 'subflow';
            const isConnector = selectedNode.type === 'connector';
            const isStart     = selectedNode.type === 'start';
            const isDecision  = selectedNode.type === 'decision';
            const isEnd       = selectedNode.type === 'end';

            const activeColor = isDecision ? '#f59e0b' : ((isStart || isEnd) ? '#10b981' : 'var(--accent)');

            if (isLoadingAction) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                        <Spin tip="Loading action details..." />
                    </div>
                );
            }

            return (
                <motion.div 
                    className="properties-drawer__content"
                    key={selectedNode.id}
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { 
                                staggerChildren: 0.12,
                                delayChildren: 0.35 
                            }
                        }
                    }}
                >
                    <Tabs
                        defaultActiveKey="1"
                        className="properties-drawer__tabs"
                        items={[
                            {
                                key: '1',
                                label: 'Overview',
                                children: (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: 16 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        style={{ padding: '0 4px' }}
                                    >
                                        {/* Node Metadata Card */}
                                        <div className="properties-drawer__meta">
                                            <div className="properties-drawer__meta-item">
                                                <span className="properties-drawer__meta-label">Type</span>
                                                <span className="properties-drawer__meta-value">
                                                    {isStart    ? 'Workflow Entry'
                                                    : isDecision ? 'Router'
                                                    : isEnd      ? 'Workflow Exit'
                                                    : isSubFlow  ? 'Group'
                                                    : (nodeData?.category || 'Action')}
                                                </span>
                                            </div>
                                            <div className="properties-drawer__meta-item">
                                                <span className="properties-drawer__meta-label">Key</span>
                                                <span className="properties-drawer__meta-value" style={{ fontFamily: 'monospace' }}>
                                                    {selectedNode.id} 
                                                   {/* <pre>{JSON.stringify(nodeData,null)}</pre> */}
                                                </span>
                                            </div>
                                            <div className="properties-drawer__meta-item">
                                                <span className="properties-drawer__meta-label">Capability</span>
                                                <div className={`properties-drawer__capability-badge badge-${isDecision ? 'decision' : nodeData?.capability}`}>
                                                    {isStart    ? 'START'
                                                    : isDecision ? 'DECISION'
                                                    : isEnd      ? 'END'
                                                    : isSubFlow  ? 'STRUCTURE'
                                                    : (nodeData?.capability || 'API').toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onValuesChange={handleValuesChange}
                                            className="properties-drawer__form"
                                        >
                                            {!isConnector && (
                                                <>
                                                    <div className="properties-drawer__section-title" style={{ marginTop: 0 }}>Identity</div>
                                                    <Form.Item
                                                        label="Node Label"
                                                        name="label"
                                                        rules={[{ required: true, message: 'Label is required' }]}
                                                    >
                                                        <Input placeholder="e.g. Process Claim" />
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

                                            {isStart && (
                                                <>
                                                    <div className="properties-drawer__divider" />
                                                    <div className="properties-drawer__section-title">Initial State Variables</div>
                                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16, lineHeight: 1.5 }}>
                                                        State is used to store and pass data between all nodes in a workflow so 
                                                        they can share and update information.
                                                    </Text>
                                                    <Form.List name="initial_state">
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map(({ key, name: fieldName, ...restField }) => (
                                                                    <div key={key} className="properties-drawer__kv-row">
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[fieldName, 'key']}
                                                                            className="properties-drawer__kv-field"
                                                                            rules={[{ required: true, message: 'Key required' }]}
                                                                        >
                                                                            <Input placeholder="key" style={{ fontFamily: 'monospace' }} />
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[fieldName, 'value']}
                                                                            className="properties-drawer__kv-field"
                                                                        >
                                                                            <Input placeholder="value" />
                                                                        </Form.Item>
                                                                        <DeleteOutlined
                                                                            className="properties-drawer__delete-icon"
                                                                            onClick={() => remove(fieldName)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    type="dashed"
                                                                    onClick={() => add({ key: '', value: '' })}
                                                                    icon={<PlusOutlined />}
                                                                    block
                                                                >
                                                                    Add Variable
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </>
                                            )}
                                        </Form>
                                    </motion.div>
                                ),
                            },
                            ...((!isSubFlow && !isStart) ? [{
                                key: '2',
                                label: 'Configuration',
                                children: (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: 16 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        style={{ padding: '0 4px' }}
                                    >
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onValuesChange={handleValuesChange}
                                            className="properties-drawer__form"
                                        >
                                            {isDecision ? (
                                                <DecisionPropertiesPanel form={form} nodes={nodes} />
                                            ) : isEnd ? (
                                                <>
                                                    <div className="properties-drawer__section-title" style={{ marginTop: 0 }}>Response Formatting</div>
                                                    <Form.Item label="Response Format" name="response_format">
                                                        <Select options={[
                                                            { label: 'Whatever provider node returned (auto)', value: 'auto' },
                                                            { label: 'Make response format (custom)', value: 'custom' },
                                                        ]} />
                                                    </Form.Item>
                                                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.response_format !== currentValues.response_format}>
                                                        {({ getFieldValue }) => {
                                                            return getFieldValue('response_format') === 'custom' ? (
                                                                <Form.Item label="Message / Raw JSON" name="custom_message">
                                                                    <Input.TextArea rows={6} style={{ fontFamily: 'monospace' }} placeholder="{\n  &quot;status&quot;: &quot;success&quot;\n}" />
                                                                </Form.Item>
                                                            ) : null;
                                                        }}
                                                    </Form.Item>
                                                </>
                                            ) : (
                                                renderNodeConfig(nodeData as CanvasNodeData)
                                            )}
                                        </Form>
                                    </motion.div>
                                )
                            }] : []),
                            ...((!isSubFlow && !isStart && !isDecision && !isConnector) ? [{
                                key: '3',
                                label: 'Settings',
                                children: (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: 16 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        style={{ padding: '0 4px' }}
                                    >
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onValuesChange={handleValuesChange}
                                            className="properties-drawer__form"
                                        >
                                            {isEnd ? (
                                                <>
                                                    <div className="properties-drawer__section-title" style={{ marginTop: 0 }}>Failure Settings</div>
                                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                                                        If the workflow fails before naturally reaching an exit, define the error response mapping.
                                                    </Text>
                                                    <div className="properties-drawer__flex-row">
                                                        <Form.Item label="Status Code" name="fail_status_code" className="properties-drawer__flex-item">
                                                            <Input type="number" placeholder="500" />
                                                        </Form.Item>
                                                    </div>
                                                    <Form.Item label="Failure Message" name="fail_message">
                                                        <Input.TextArea rows={3} placeholder="Internal Server Error" />
                                                    </Form.Item>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="properties-drawer__section-title" style={{ marginTop: 0 }}>Fallback Settings</div>
                                                    <Form.Item name="fallback_message" label="Fallback Message">
                                                        <Input.TextArea placeholder="Used if action fails..." rows={4} />
                                                    </Form.Item>

                                                    <div className="properties-drawer__divider" />
                                                    <div className="properties-drawer__section-title">State Mapping</div>
                                                    {renderStateManagement()}
                                                </>
                                            )}
                                        </Form>
                                    </motion.div>
                                )
                            }] : []),
                        ]}
                    />
                </motion.div>
            );
        }

        if (selectedEdge) {
            return (
                <motion.div 
                    className="properties-drawer__content"
                    key={selectedEdge.id}
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { 
                                staggerChildren: 0.08,
                                delayChildren: 0.25 
                            }
                        }
                    }}
                >
                    <motion.div 
                        className="properties-drawer__meta" 
                        variants={{
                            hidden: { opacity: 0, x: 16 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.15, ease: 'linear' } }
                        }}
                    >
                        <div className="properties-drawer__meta-item">
                            <span className="properties-drawer__meta-label">Route</span>
                            <div className="properties-drawer__capability-badge badge-default" style={{ textTransform: 'capitalize' }}>
                                {edgeData?.routeType || 'unconditional'}
                            </div>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <span className="properties-drawer__meta-label">ID</span>
                            <span className="properties-drawer__meta-value" style={{ fontFamily: 'monospace' }}>
                                {selectedEdge.id}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={{
                            hidden: { opacity: 0, x: 12 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.12, ease: 'linear' } }
                        }}
                    >
                        <div className="properties-drawer__section-title">Routing Configuration</div>
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
                    </motion.div>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    className="properties-drawer-floating"
                    initial={{ x: 30, opacity: 0, scale: 0.98 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 30, opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                >
                    <div className="properties-drawer__drawer-header">
                        <div className="properties-drawer__header-left">
                            <span className="properties-drawer__icon">
                                {headerInfo.icon}
                            </span>
                            <span className="properties-drawer__title-text">
                                {headerInfo.title}
                            </span>
                        </div>
                        <button className="properties-drawer__close-btn" onClick={onClose}>
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                    
                    <div className="properties-drawer__drawer-body">
                        {renderContent()}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
