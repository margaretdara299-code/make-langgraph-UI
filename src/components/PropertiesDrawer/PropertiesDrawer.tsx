/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Drawer, Input, Form, Typography, Select, Button, Spin, theme, message } from 'antd';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useEffect, useState, useRef } from 'react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import ApiConnectorFields from '@/components/CreateConnectorModal/ApiConnectorFields';
import DatabaseConnectorFields from '@/components/CreateConnectorModal/DatabaseConnectorFields';
import { fetchActionById } from '@/services';
import type { CanvasNodeData, CanvasEdgeData, PropertiesDrawerProps, ActionExecutionConfig, ActionDefinition, ActionCapability } from '@/interfaces';
import { useCategories, useCapabilities } from '@/hooks';
import './PropertiesDrawer.css';

const { Title, Text } = Typography;


export default function PropertiesDrawer({ selectedNodeId, selectedEdgeId, onClose }: PropertiesDrawerProps) {
    const { token } = theme.useToken();
    const { setNodes, setEdges } = useReactFlow();
    const nodes = useNodes();
    const edges = useEdges();
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const { categories } = useCategories();
    const categoryMap: Record<number, string> = Object.fromEntries(
        categories.map((category: any) => [category.categoryId ?? category.id ?? category.category_id, category.name])
    );

    const { capabilities } = useCapabilities();
    const capabilitiesMap: Record<number, string> = Object.fromEntries(
        capabilities.map((capability: any) => [capability.capabilityId ?? capability.capability_id, (capability.name || '').toLowerCase()])
    );

    // Fetched action data (enriched with JSON blobs from GET /api/actions/{id})
    const [fetchedExecution, setFetchedExecution] = useState<ActionExecutionConfig | null>(null);
    const [fetchedConfigs, setFetchedConfigs] = useState<any>({});

    // Track which actionId we last fetched to avoid re-fetching
    const lastFetchedActionId = useRef<string | null>(null);

    // Find the reactive node or edge instance based on the explicit click ID
    const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
    const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) || null : null;
    const [form] = Form.useForm();

    // When a node is selected, fetch full action data from the backend
    useEffect(() => {
        if (!selectedNode) {
            lastFetchedActionId.current = null;
            setFetchedExecution(null);
            setFetchedConfigs([]);
            return;
        }

        // ── Skip fetching for non-action nodes (e.g. subflow, connector) ──
        if (selectedNode.type !== 'action' && selectedNode.type !== 'trigger') {
            lastFetchedActionId.current = null;

            // For connectors, we already have configJson in node.data
            if (selectedNode.type === 'connector') {
                const nd = selectedNode.data as any;
                form.setFieldsValue({
                    name: nd.label,
                    description: nd.description || '',
                    configJson: nd.configJson || {},
                });
            }
            return;
        }

        const nd = selectedNode.data as unknown as CanvasNodeData;
        const actionId = nd.actionId;

        if (!actionId || actionId === lastFetchedActionId.current) {
            return;
        }

        lastFetchedActionId.current = actionId;
        setIsLoadingAction(true);

        fetchActionById(actionId).then((result) => {
            if (result.success && result.data) {
                const rawAction = result.data as any; // cast to any to access both snake_case and camelCase fields
                const versionId = rawAction.action_version_id || rawAction.actionVersionId || nd.actionVersionId || '';

                // Map backend fields to frontend interface
                const action: ActionDefinition = {
                    ...rawAction,
                    capability: capabilitiesMap[rawAction.capabilityId ?? rawAction.capability_id] || rawAction.capability || 'api', // ID → name
                    category: rawAction.category || 'Uncategorized',
                    configurationsJson: rawAction.configurations_json || rawAction.configurationsJson || {},
                };

                // Parse execution config
                let execution: ActionExecutionConfig | null = null;
                if (rawAction.execution_json || rawAction.executionJson) {
                    const raw = rawAction.execution_json || rawAction.executionJson;
                    execution = {
                        connectorType: raw.connectorType || raw.connector_type || 'rest',
                        endpointUrl: raw.endpointUrl || raw.endpoint_url || '',
                        httpMethod: raw.httpMethod || raw.http_method || 'POST',
                        timeoutMs: Number(raw.timeoutMs) || Number(raw.timeout_ms) || 30000,
                        retryCount: Number(raw.retryCount) || Number(raw.retry_count) || 0,
                        retryDelayMs: Number(raw.retryDelayMs) || Number(raw.retry_delay_ms) || 1000,
                    };
                }

                // Parse configurations - handle both array (legacy) and flat object (new)
                let configs: Record<string, any> = {};
                const configJson = rawAction.configurations_json || rawAction.configurationsJson;
                if (configJson && typeof configJson === 'object' && !Array.isArray(configJson)) {
                    configs = configJson;
                } else if (Array.isArray(configJson)) {
                    configJson.forEach((c: any) => {
                        configs[c.inputKey || c.key] = c.defaultValue;
                    });
                }

                setFetchedExecution(execution);
                setFetchedConfigs(configs);

                // Update React Flow node with full data + capability
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === selectedNode.id) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    capability: action.capability.toLowerCase() as ActionCapability,
                                    categoryId: rawAction.category_id || rawAction.categoryId,
                                    category: categoryMap[rawAction.category_id || rawAction.categoryId] || (node.data as any).category || action.category,
                                    executionJson: execution,
                                    configurationsJson: configs,
                                    actionVersionId: versionId,
                                },
                            };
                        }
                        return node;
                    })
                );
            }
        }).catch((err) => {
            console.error('Failed to fetch action details:', err);
        }).finally(() => {
            setIsLoadingAction(false);
        });
    }, [selectedNodeId, selectedNode?.data]);

    // Re-surface the correct node/edge title onto the form fields when data is ready
    useEffect(() => {
        if (selectedNode) {
            const isSubFlow = selectedNode.type === 'subflow';
            const nodeLabel = selectedNode.data.label;

            if (isSubFlow) {
                const sd = selectedNode.data as any; // SubFlowNodeData
                form.setFieldsValue({
                    label: nodeLabel,
                    description: sd.description || '',
                });
                return;
            }


            form.setFieldsValue({
                label: nodeLabel,
                ...fetchedConfigs, // fetchedConfigs is now an object
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
    }, [selectedNodeId, selectedEdgeId, fetchedExecution, fetchedConfigs, form]);

    // When the form values change we instantly update the React Flow instance
    const handleValuesChange = (changedValues: any) => {
        if (selectedNode && (changedValues.label !== undefined || changedValues.name !== undefined || changedValues.description !== undefined)) {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === selectedNode.id) {
                        const nextData = { ...node.data, ...changedValues };
                        // Sync 'name' to 'label' if it was the one that changed
                        if (changedValues.name !== undefined) {
                            nextData.label = changedValues.name;
                        }
                        return {
                            ...node,
                            data: nextData,
                        };
                    }
                    return node;
                })
            );
        } else if (selectedEdge) {
            const allValues = form.getFieldsValue();
            setEdges((edges) =>
                edges.map((edge) => {
                    if (edge.id === selectedEdge.id) {
                        const newRouteType = allValues.routeType;
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

    /** Collect form values and apply changes locally to the React Flow node */
    const handleApply = () => {
        if (!selectedNode) return;
        const allValues = form.getFieldsValue();

        if (selectedNode.type === 'subflow') {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: allValues.label,
                                description: allValues.description,
                            },
                        };
                    }
                    return node;
                })
            );
            message.success('Group properties applied');
            return;
        }

        if (selectedNode.type === 'connector') {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: allValues.name || allValues.label,
                                description: allValues.description,
                                configJson: allValues.configJson,
                            },
                        };
                    }
                    return node;
                })
            );
            message.success('Connector properties applied locally');
            return;
        }



        // Extract configurations (all fields except native node properties)
        const { label, name, description, ...configurations } = allValues;

        // Update the React Flow node data in-place (local only)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: label || name || node.data.label,
                            description: description || node.data.description,
                            configurationsJson: configurations,
                        },
                    };
                }
                return node;
            })
        );

        message.success('Changes applied locally');
    };

    /** Render the Connector-specific fields */
    const renderNodeConfig = (nodeData: CanvasNodeData) => {
        const capability = (nodeData.capability || 'api').toLowerCase();

        switch (capability) {
            case 'condition':
            case 'rules':
                return (
                    <>
                        <Form.Item label="Branch Expression" name="condition_expression">
                            <Input.TextArea rows={3} placeholder="state['status'] == 'denied'" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <Title level={5} className="properties-drawer__section-subtitle">Branch Labels</Title>
                        <Form.Item label="✅ True Label" name="condition_true_label">
                            <Input />
                        </Form.Item>
                        <Form.Item label="❌ False Label" name="condition_false_label">
                            <Input />
                        </Form.Item>
                    </>
                );

            case 'human input':
            case 'human':
                return (
                    <>
                        <Form.Item label="Prompt / Question" name="human_prompt">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item label="Assignee / Queue" name="human_assignee">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Timeout (min)" name="human_timeout_min">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item label="Action" name="human_action">
                            <Select options={[
                                { value: 'approve_reject', label: 'Approve / Reject' },
                                { value: 'input_form', label: 'Fill in a Form' },
                                { value: 'free_text', label: 'Free Text' },
                            ]} />
                        </Form.Item>
                    </>
                );

            case 'agent':
            case 'ai':
                return (
                    <>
                        <Form.Item label="AI Model" name="ai_model">
                            <Select options={[
                                { value: 'gpt-4o', label: '🤖 GPT-4o' },
                                { value: 'gpt-4o-mini', label: '🤖 GPT-4o Mini' },
                                { value: 'claude-3-5-sonnet', label: '🤖 Claude 3.5' },
                                { value: 'gemini-1.5-pro', label: '🤖 Gemini 1.5 Pro' },
                                { value: 'llama-3-70b', label: '🤖 LLaMA 3 70B' },
                            ]} />
                        </Form.Item>
                        <Form.Item label="Temp" name="ai_temperature">
                            <Input type="number" step={0.1} min={0} max={2} />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Prompts</Title>
                        <Form.Item label="System Prompt" name="ai_system_prompt">
                            <Input.TextArea rows={4} placeholder="You are an expert specialist..." />
                        </Form.Item>
                        <Form.Item label="User Prompt Template" name="ai_user_prompt">
                            <Input.TextArea rows={6} placeholder="Summarize the input: {{state.details}}" />
                        </Form.Item>
                        <Form.Item label="Max Tokens" name="ai_max_tokens">
                            <Input type="number" placeholder="1024" />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Output Mapping</Title>
                        <Form.Item label="Save output to state variable" name="ai_output_key">
                            <Input placeholder="e.g. analysis_result" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                    </>
                );

            case 'http request':
            case 'http':
            case 'api':
                return (
                    <>
                        <Form.Item label="URL" name="http_url">
                            <Input placeholder="https://api.example.com/v1/resource/{{state.id}}" />
                        </Form.Item>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Form.Item label="Method" name="http_method" style={{ flex: 1 }}>
                                <Select options={[
                                    { value: 'GET', label: 'GET' },
                                    { value: 'POST', label: 'POST' },
                                    { value: 'PUT', label: 'PUT' },
                                    { value: 'PATCH', label: 'PATCH' },
                                    { value: 'DELETE', label: 'DELETE' },
                                ]} />
                            </Form.Item>
                            <Form.Item label="Timeout (ms)" name="http_timeout" style={{ width: '120px' }}>
                                <Input type="number" placeholder="30000" />
                            </Form.Item>
                        </div>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Request</Title>
                        <Form.Item label="Headers (JSON)" name="http_headers">
                            <Input.TextArea rows={3} style={{ fontFamily: 'monospace' }} placeholder={'{\n  "Authorization": "Bearer {{env.API_TOKEN}}"\n}'} />
                        </Form.Item>
                        <Form.Item label="Body (JSON)" name="http_body">
                            <Input.TextArea rows={4} style={{ fontFamily: 'monospace' }} placeholder={'{\n  "id": "{{state.id}}"\n}'} />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Output Mapping</Title>
                        <Form.Item label="Save output to state variable" name="http_output_key">
                            <Input placeholder="e.g. api_result" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                    </>
                );

            case 'database':
            case 'database operation':
                return (
                    <>
                        <Form.Item label="Connection" name="db_connection_id">
                            <Select placeholder="Select a connection..." options={[
                                { value: 'primary-db', label: '🗄️ Primary SQLite' },
                                { value: 'postgres-rcm', label: '🐘 RCM Postgres' },
                                { value: 'snowflake-analytics', label: '❄️ Snowflake Analytics' },
                                { value: 'mysql-emr', label: '🐬 MySQL EMR' },
                            ]} />
                        </Form.Item>
                        <Form.Item label="Operation Type" name="db_operation">
                            <Select options={[
                                { value: 'select', label: '🔍 Select (Read)' },
                                { value: 'insert', label: '➕ Insert (Create)' },
                                { value: 'update', label: '✏️ Update' },
                                { value: 'delete', label: '🗑️ Delete' },
                            ]} />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Query</Title>
                        <Form.Item label="SQL Query" name="db_sql">
                            <Input.TextArea rows={6} style={{ fontFamily: 'monospace' }} placeholder="SELECT * FROM table WHERE id = :id;" />
                        </Form.Item>
                        <Form.Item label="Parameter Bindings (JSON)" name="db_params">
                            <Input.TextArea rows={4} style={{ fontFamily: 'monospace' }} placeholder={'{\n  "id": "{{state.id}}"\n}'} />
                        </Form.Item>
                        <Form.Item label="Return Mode" name="db_return_mode">
                            <Select options={[
                                { value: 'first', label: 'First Row Only' },
                                { value: 'all', label: 'All Rows (List)' },
                            ]} />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Output Mapping</Title>
                        <Form.Item label="Save output to state variable" name="db_output_key">
                            <Input placeholder="e.g. db_result" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                    </>
                );

            case 'custom function':
            case 'function':
            case 'rpa':
                return (
                    <>
                        <Form.Item label="Function Name" name="func_name">
                            <Input placeholder="e.g. process_data" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Implementation</Title>
                        <Form.Item label="Python Code" name="func_code">
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace' }}
                                placeholder={`def process_data(state):\n    state['status'] = 'PROCESSED'\n    return state`}
                            />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Output Mapping</Title>
                        <Form.Item label="Save output to state variable" name="func_output_key">
                            <Input placeholder="e.g. func_result" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                    </>
                );

            case 'loop':
                return (
                    <>
                        <Form.Item label="Loop Type" name="loop_type">
                            <Select options={[
                                { value: 'for_each', label: '🔁 For Each (Iterates a list)' },
                                { value: 'while', label: '🔄 While (Condition-based)' },
                                { value: 'times', label: '🔢 N Times (Fixed count)' },
                            ]} />
                        </Form.Item>
                        <Form.Item label="Iterate Over (State Key)" name="loop_iterate_over">
                            <Input placeholder="e.g. state.items_list" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <Form.Item label="Item Alias" name="loop_item_alias">
                            <Input placeholder="e.g. item" />
                        </Form.Item>
                        <Form.Item label="Max Iterations" name="loop_max_iterations">
                            <Input type="number" placeholder="100" />
                        </Form.Item>
                        <Form.Item label="Break Condition" name="loop_break_condition">
                            <Input placeholder="e.g. state.is_done == True" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                    </>
                );

            case 'tool':
                return (
                    <>
                        <Form.Item label="Tool Name (LangGraph)" name="tool_name">
                            <Input placeholder="e.g. run_calculation" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <Form.Item label="Description (for AI planner)" name="tool_description">
                            <Input.TextArea rows={3} placeholder="Describes what this tool does to the AI agent." />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Parameters Schema</Title>
                        <Form.Item label="Parameters Schema (JSON)" name="tool_params">
                            <Input.TextArea rows={5} style={{ fontFamily: 'monospace' }}
                                placeholder={'{\n  "query": {"type": "string"}\n}'}
                            />
                        </Form.Item>
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-subtitle">Output Mapping</Title>
                        <Form.Item label="Save output to state variable" name="tool_return_key">
                            <Input placeholder="e.g. tool_result" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                    </>
                );

            case 'direct reply':
            case 'reply':
            case 'message':
                return (
                    <>
                        <Form.Item label="Message Template" name="reply_message">
                            <Input.TextArea rows={6} placeholder="Your request has been processed.\n\n{{state.summary}}" />
                        </Form.Item>
                        <Form.Item label="Format" name="reply_format">
                            <Select options={[
                                { value: 'text', label: '📝 Plain Text' },
                                { value: 'markdown', label: '📋 Markdown' },
                                { value: 'html', label: '🌐 HTML' },
                                { value: 'json', label: '{ } JSON' },
                            ]} />
                        </Form.Item>
                        <Form.Item label="Channel" name="reply_channel">
                            <Select options={[
                                { value: 'api', label: '🔌 API Response' },
                                { value: 'email', label: '📧 Email' },
                                { value: 'slack', label: '💬 Slack' },
                                { value: 'teams', label: '💬 MS Teams' },
                            ]} />
                        </Form.Item>
                    </>
                );

            case 'connector':
                const type = nodeData.connectorType || 'api';
                const isApi = type === 'api';
                return (
                    <div className="properties-drawer__connector-fields">
                        <Title level={5} className="properties-drawer__section-title">
                            {isApi ? 'API Configuration' : 'Database Configuration'}
                        </Title>
                        {isApi ? <ApiConnectorFields /> : <DatabaseConnectorFields />}
                    </div>
                );

            default:
                return (
                    <div className="properties-drawer__empty-config">
                        <Text type="secondary">Configuration fields for '{capability}' are coming soon.</Text>
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
                        {!isSubFlow && nodeData?.actionKey && (
                            <div className="properties-drawer__meta-item">
                                <Text type="secondary">Action ID</Text>
                                <Text code>{nodeData.actionKey}</Text>
                            </div>
                        )}
                        {!isSubFlow && nodeData?.actionVersionId && (
                            <div className="properties-drawer__meta-item">
                                <Text type="secondary">Version ID</Text>
                                <Text code style={{ fontSize: 11 }}>{nodeData.actionVersionId}</Text>
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

                    <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                        <Button type="primary" block onClick={handleApply}>
                            Apply
                        </Button>
                        <Button danger variant="outlined" block onClick={() => {
                            setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
                            onClose();
                        }}>
                            Delete {isSubFlow ? 'Group' : isConnector ? 'Connector' : 'Node'}
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
