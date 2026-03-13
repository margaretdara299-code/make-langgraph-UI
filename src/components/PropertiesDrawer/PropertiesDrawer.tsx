/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Drawer, Input, Form, Typography, Select, Switch, Button, Table, Spin, theme, message } from 'antd';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useEffect, useState, useRef } from 'react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { fetchActionById } from '@/services';
import type { CanvasNodeData, CanvasEdgeData, PropertiesDrawerProps } from '@/interfaces';
import type { ActionInputField, ActionOutputField, ActionExecutionConfig, ActionConfigField } from '@/interfaces';
import './PropertiesDrawer.css';

const { Title, Text } = Typography;

/** Columns for the Inputs / Outputs mini-tables */
const fieldColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '40%' },
    { title: 'Type', dataIndex: 'type', key: 'type', width: '30%' },
    {
        title: 'Required',
        dataIndex: 'required',
        key: 'required',
        width: '30%',
        render: (val: boolean) => (val ? '✓' : '—'),
    },
];

export default function PropertiesDrawer({ selectedNodeId, selectedEdgeId, onClose }: PropertiesDrawerProps) {
    const { token } = theme.useToken();
    const { setNodes, setEdges } = useReactFlow();
    const nodes = useNodes();
    const edges = useEdges();
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    // Fetched action data (enriched with JSON blobs from GET /api/actions/{id})
    const [fetchedInputs, setFetchedInputs] = useState<ActionInputField[]>([]);
    const [fetchedOutputs, setFetchedOutputs] = useState<ActionOutputField[]>([]);
    const [fetchedExecution, setFetchedExecution] = useState<ActionExecutionConfig | null>(null);
    const [fetchedConfigs, setFetchedConfigs] = useState<ActionConfigField[]>([]);
    const [fetchedVersionId, setFetchedVersionId] = useState<string>('');

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
            setFetchedInputs([]);
            setFetchedOutputs([]);
            setFetchedExecution(null);
            setFetchedConfigs([]);
            setFetchedVersionId('');
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
                const action = result.data;
                const versionId = (action as any).actionVersionId || nd.actionVersionId || '';

                // Parse inputs — handle both array and object-with-fields formats
                let inputs: ActionInputField[] = [];
                if (Array.isArray(action.inputsSchemaJson)) {
                    inputs = action.inputsSchemaJson;
                } else if (action.inputsSchemaJson && typeof action.inputsSchemaJson === 'object') {
                    const raw = action.inputsSchemaJson as any;
                    if (Array.isArray(raw.fields)) {
                        inputs = raw.fields;
                    }
                }

                // Parse outputs — same logic
                let outputs: ActionOutputField[] = [];
                if (Array.isArray(action.outputsSchemaJson)) {
                    outputs = action.outputsSchemaJson;
                } else if (action.outputsSchemaJson && typeof action.outputsSchemaJson === 'object') {
                    const raw = action.outputsSchemaJson as any;
                    if (Array.isArray(raw.fields)) {
                        outputs = raw.fields;
                    }
                }

                // Parse execution config
                let execution: ActionExecutionConfig | null = null;
                if (action.executionJson && typeof action.executionJson === 'object') {
                    const raw = action.executionJson as any;
                    execution = {
                        connectorType: raw.connectorType || raw.connector_type || 'rest',
                        endpointUrl: raw.endpointUrl || raw.endpoint_url || '',
                        httpMethod: raw.httpMethod || raw.http_method || 'POST',
                        timeoutMs: raw.timeoutMs || raw.timeout_ms || 30000,
                        retryCount: raw.retryCount || raw.retry_count || 0,
                        retryDelayMs: raw.retryDelayMs || raw.retry_delay_ms || 1000,
                    };
                }

                // Parse configurations
                let configs: ActionConfigField[] = [];
                if (Array.isArray(action.configurationsJson)) {
                    configs = action.configurationsJson;
                } else if (action.configurationsJson && typeof action.configurationsJson === 'object') {
                    const raw = action.configurationsJson as any;
                    if (Array.isArray(raw.fields)) {
                        configs = raw.fields;
                    }
                }

                setFetchedInputs(inputs);
                setFetchedOutputs(outputs);
                setFetchedExecution(execution);
                setFetchedConfigs(configs);
                setFetchedVersionId(versionId);

                // Also update the React Flow node data so it carries the full data
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === selectedNode.id) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    inputsSchemaJson: inputs,
                                    outputsSchemaJson: outputs,
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
            const nd = selectedNode.data as unknown as CanvasNodeData;
            const exec = fetchedExecution || nd.executionJson;
            form.setFieldsValue({
                label: nd.label,
                // Execution fields
                exec_connectorType: exec?.connectorType || 'rest',
                exec_endpointUrl: exec?.endpointUrl || '',
                exec_httpMethod: exec?.httpMethod || 'POST',
                exec_timeoutMs: exec?.timeoutMs ?? 30000,
                exec_retryCount: exec?.retryCount ?? 0,
                exec_retryDelayMs: exec?.retryDelayMs ?? 1000,
            });

            // Prefill configuration fields
            const configs = fetchedConfigs.length > 0 ? fetchedConfigs : (nd.configurationsJson || []);
            const configValues: Record<string, unknown> = {};
            configs.forEach((cfg) => {
                configValues[`config_${cfg.inputKey}`] = cfg.defaultValue;
            });
            form.setFieldsValue(configValues);
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
        const nd = selectedNode.data as unknown as CanvasNodeData;
        const allValues = form.getFieldsValue();

        // Build updated execution config from form
        const updatedExecution = {
            connectorType: allValues.exec_connectorType,
            endpointUrl: allValues.exec_endpointUrl,
            httpMethod: allValues.exec_httpMethod,
            timeoutMs: Number(allValues.exec_timeoutMs) || 30000,
            retryCount: Number(allValues.exec_retryCount) || 0,
            retryDelayMs: Number(allValues.exec_retryDelayMs) || 1000,
        };

        // Build updated configurations from form
        const currentConfigs = fetchedConfigs.length > 0 ? fetchedConfigs : (nd.configurationsJson || []);
        const updatedConfigs = currentConfigs.map((cfg) => ({
            ...cfg,
            defaultValue: allValues[`config_${cfg.inputKey}`] ?? cfg.defaultValue,
        }));

        // Update the React Flow node data in-place (local only)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: allValues.label,
                            executionJson: updatedExecution,
                            configurationsJson: updatedConfigs,
                        },
                    };
                }
                return node;
            })
        );

        message.success('Changes applied locally');
    };

    // Render configuration inputs dynamically from the action's configurationsJson
    const renderNodeConfig = (nodeData: CanvasNodeData) => {
        const configs = fetchedConfigs.length > 0 ? fetchedConfigs : nodeData.configurationsJson;

        if (!configs || configs.length === 0) {
            return (
                <div className="properties-drawer__empty-config">
                    <Text type="secondary">No configuration fields defined for this action.</Text>
                </div>
            );
        }

        return configs.map((cfg) => {
            switch (cfg.inputType) {
                case 'number':
                    return (
                        <Form.Item key={cfg.inputKey} label={cfg.label} name={`config_${cfg.inputKey}`} initialValue={cfg.defaultValue}>
                            <Input type="number" placeholder={`Enter ${cfg.label}`} />
                        </Form.Item>
                    );
                case 'boolean':
                    return (
                        <Form.Item key={cfg.inputKey} label={cfg.label} name={`config_${cfg.inputKey}`} valuePropName="checked" initialValue={!!cfg.defaultValue}>
                            <Switch />
                        </Form.Item>
                    );
                case 'select':
                    return (
                        <Form.Item key={cfg.inputKey} label={cfg.label} name={`config_${cfg.inputKey}`} initialValue={cfg.defaultValue}>
                            <Select
                                placeholder={`Select ${cfg.label}`}
                                options={(cfg.options || []).map(o => ({ value: o, label: o }))}
                                allowClear
                            />
                        </Form.Item>
                    );
                case 'textarea':
                    return (
                        <Form.Item key={cfg.inputKey} label={cfg.label} name={`config_${cfg.inputKey}`} initialValue={cfg.defaultValue}>
                            <Input.TextArea rows={3} placeholder={`Enter ${cfg.label}`} />
                        </Form.Item>
                    );
                default: // 'text'
                    return (
                        <Form.Item key={cfg.inputKey} label={cfg.label} name={`config_${cfg.inputKey}`} initialValue={cfg.defaultValue}>
                            <Input placeholder={`Enter ${cfg.label}`} />
                        </Form.Item>
                    );
            }
        });
    };

    /** Render the Inputs schema as a read-only mini-table */
    const renderInputsSection = (inputs: ActionInputField[]) => {
        if (!inputs || inputs.length === 0) {
            return (
                <div className="properties-drawer__empty-config">
                    <Text type="secondary">No input fields defined.</Text>
                </div>
            );
        }
        return (
            <Table
                dataSource={inputs.map((f, i) => ({ ...f, key: f.name || i }))}
                columns={fieldColumns}
                pagination={false}
                size="small"
                className="properties-drawer__schema-table"
            />
        );
    };

    /** Render the Outputs schema as a read-only mini-table */
    const renderOutputsSection = (outputs: ActionOutputField[]) => {
        if (!outputs || outputs.length === 0) {
            return (
                <div className="properties-drawer__empty-config">
                    <Text type="secondary">No output fields defined.</Text>
                </div>
            );
        }
        return (
            <Table
                dataSource={outputs.map((f, i) => ({ ...f, key: f.name || i }))}
                columns={fieldColumns}
                pagination={false}
                size="small"
                className="properties-drawer__schema-table"
            />
        );
    };

    /** Render the Execution config as editable form fields */
    const renderExecutionSection = () => {
        return (
            <>
                <Form.Item label="Connector Type" name="exec_connectorType">
                    <Select
                        options={[
                            { value: 'rest', label: 'REST' },
                            { value: 'graphql', label: 'GraphQL' },
                            { value: 'grpc', label: 'gRPC' },
                            { value: 'internal', label: 'Internal' },
                            { value: 'none', label: 'None' },
                        ]}
                    />
                </Form.Item>
                <Form.Item label="Endpoint URL" name="exec_endpointUrl">
                    <Input placeholder="https://api.example.com/v1/action" />
                </Form.Item>
                <Form.Item label="HTTP Method" name="exec_httpMethod">
                    <Select
                        options={[
                            { value: 'GET', label: 'GET' },
                            { value: 'POST', label: 'POST' },
                            { value: 'PUT', label: 'PUT' },
                            { value: 'PATCH', label: 'PATCH' },
                            { value: 'DELETE', label: 'DELETE' },
                        ]}
                    />
                </Form.Item>
                <Form.Item label="Timeout (ms)" name="exec_timeoutMs">
                    <Input type="number" placeholder="30000" />
                </Form.Item>
                <Form.Item label="Retry Count" name="exec_retryCount">
                    <Input type="number" placeholder="0" />
                </Form.Item>
                <Form.Item label="Retry Delay (ms)" name="exec_retryDelayMs">
                    <Input type="number" placeholder="1000" />
                </Form.Item>
            </>
        );
    };

    // Drawer is open if exactly ONE node or exactly ONE edge is selected
    const isOpen = selectedNode !== null || selectedEdge !== null;
    const nodeData = selectedNode?.data as unknown as CanvasNodeData | undefined;
    const edgeData = selectedEdge?.data as unknown as CanvasEdgeData | undefined;

    // Render forms based on what is selected
    const renderContent = () => {
        if (selectedNode && nodeData) {
            // Use fetched data if available, otherwise fall back to node data
            const displayInputs = fetchedInputs.length > 0 ? fetchedInputs : (nodeData.inputsSchemaJson || []);
            const displayOutputs = fetchedOutputs.length > 0 ? fetchedOutputs : (nodeData.outputsSchemaJson || []);

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
                        {nodeData.actionVersionId && (
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
                        <Title level={5} className="properties-drawer__section-title">General</Title>
                        <Form.Item
                            label="Node Label"
                            name="label"
                            rules={[{ required: true, message: 'Label is required' }]}
                        >
                            <Input />
                        </Form.Item>

                        {/* ── Inputs Section ── */}
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-title">Inputs</Title>
                        {renderInputsSection(displayInputs)}

                        {/* ── Outputs Section ── */}
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-title">Outputs</Title>
                        {renderOutputsSection(displayOutputs)}

                        {/* ── Execution Section ── */}
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-title">Execution</Title>
                        {renderExecutionSection()}

                        {/* ── Configurations Section ── */}
                        <div className="properties-drawer__divider" />
                        <Title level={5} className="properties-drawer__section-title">Configuration</Title>
                        {renderNodeConfig(nodeData)}
                    </Form>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                        <Button type="primary" block onClick={handleApply}>
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
