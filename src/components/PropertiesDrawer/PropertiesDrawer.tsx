/**
 * PropertiesDrawer — The right-hand panel in the Skill Designer.
 * Slides out to show the properties of the currently selected React Flow node.
 */

import { Input, Form, Typography, Select, Spin, Button, Tabs, Collapse } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Settings2, GitBranchPlus, X } from 'lucide-react';
import { HTTP_METHODS } from '@/constants';
import type { CanvasNodeData, CanvasEdgeData, PropertiesDrawerProps } from '@/interfaces';
import { useCapabilities } from '@/hooks';
import { useExecution } from '@/contexts';
import { loadGraphFromStorage, upsertNodeInStorage, upsertConnectionInStorage } from '@/services/skillGraphStorage.service';
import DecisionPropertiesPanel from './DecisionPropertiesPanel';
import SplitPropertiesPanel from './SplitPropertiesPanel';
import MergePropertiesPanel from './MergePropertiesPanel';
import './PropertiesDrawer.css';

const { Text } = Typography;

const isQueueDefaultRawTemplate = (rawBody: string | undefined, bodyParams: any) => {
    const normalizedRaw = (rawBody || '').replace(/\s+/g, '');
    const normalizedTemplate = '{"payload":"{{last_result}}","workflow_state":"{{workflow_state}}"}';
    const matchesLegacyObject =
        bodyParams &&
        typeof bodyParams === 'object' &&
        !Array.isArray(bodyParams) &&
        bodyParams.payload === '{{last_result}}' &&
        bodyParams.workflow_state === '{{workflow_state}}';
    return normalizedRaw === normalizedTemplate || matchesLegacyObject;
};

export default function PropertiesDrawer({ selectedNodeId, selectedEdgeId, onClose }: PropertiesDrawerProps) {
    const { setNodes, setEdges } = useReactFlow();
    const nodes = useNodes();
    const edges = useEdges();
    const { versionId } = useParams<{ versionId: string }>();
    const [isLoadingAction] = useState(false);

    const { capabilities: _capabilities } = useCapabilities();

    // Find the reactive node or edge instance based on the explicit click ID
    const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
    const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) || null : null;
    const [form] = Form.useForm();

    // Check if the current node has been executed in the active stepper session
    const { steps } = useExecution();
    const executionStep = selectedNodeId ? steps.find(s => s.node.id === selectedNodeId) : null;

    const availableStateKeys = useMemo(() => {
        const keys = new Set<string>();
        nodes.forEach(n => {
            const data = n.data as any;
            if (n.type === 'start' && Array.isArray(data.initial_state)) {
                data.initial_state.forEach((st: any) => { if (st?.key) keys.add(st.key); });
            } else if (n.type === 'action' || n.type === 'queue') {
                if (data.action_key) keys.add(data.action_key);

                // Gather existing mapped state keys so they auto-suggest cleanly
                const mappings = data.configurations_json?.response_to_state_mapping;
                if (Array.isArray(mappings)) {
                    mappings.forEach((m: any) => { if (m?.state_key) keys.add(m.state_key); });
                }
            }
        });
        return Array.from(keys).map(k => ({ value: k }));
    }, [nodes]);

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
            ['path_params', 'query_params', 'header_params'].forEach(paramKey => {
                if (prepared[paramKey] && !Array.isArray(prepared[paramKey]) && typeof prepared[paramKey] === 'object') {
                    prepared[paramKey] = Object.entries(prepared[paramKey]).map(([key, value]) => ({ key, value }));
                }
            });

            const bodyType = prepared.body_params_type || 'form-data';
            const bodyParams = prepared.body_params;
            const hasNestedBodyObject =
                bodyParams &&
                typeof bodyParams === 'object' &&
                !Array.isArray(bodyParams) &&
                Object.values(bodyParams).some((value) => value && typeof value === 'object');

            if (bodyType === 'raw' || hasNestedBodyObject) {
                prepared.body_params_type = 'raw';
                if (!prepared.body_params_raw && bodyParams !== undefined) {
                    prepared.body_params_raw = JSON.stringify(bodyParams, null, 2);
                }
            } else if (bodyParams && !Array.isArray(bodyParams) && typeof bodyParams === 'object') {
                prepared.body_params = Object.entries(bodyParams).map(([key, value]) => ({ key, value }));
            }
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

        // For error nodes
        if (selectedNode.type === 'error') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const err = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            const cfg = err.configurations || {};
            form.setFieldsValue({
                label: err.label || 'Error Handler',
                error_api_url: cfg.error_api_url || '',
            });
            return;
        }

        // For queue nodes
        if (selectedNode.type === 'queue') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const qd = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            const configs = prepareConfigsForForm(qd.configurations_json);
            const shouldClearLegacyQueueTemplate = isQueueDefaultRawTemplate(configs.body_params_raw, qd.configurations_json?.body_params);
            const queueBodyParams = shouldClearLegacyQueueTemplate
                ? []
                : (Array.isArray(configs.body_params) ? configs.body_params : []);
            form.setFieldsValue({
                label:            qd.label || 'Queue',
                description:      qd.description || '',
                queue_name:       qd.queue_name || '',
                queue_type:       qd.queue_type || 'human',
                priority:         qd.priority || 'normal',
                ttl_seconds:      qd.ttl_seconds ?? 0,
                auto_closeout:    qd.auto_closeout !== false,
                payload_mappings: Array.isArray(qd.payload_mappings) ? qd.payload_mappings : [],
            });
            return;
        }

        // For parallel split (new branch-array model)
        if (selectedNode.type === 'parallel_split') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const pd = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            form.setFieldsValue({
                label:                   pd.label || 'Split',
                description:             pd.description || '',
                split_mode:              pd.split_mode || 'parallel_all',
                source_scope:            pd.source_scope || 'state',
                source_node_id:          pd.source_node_id || '',
                source_output_key:       pd.source_output_key || '',
                source_path:             pd.source_path || '',
                branches:                Array.isArray(pd.branches) ? pd.branches : [],
                timeout_seconds:         pd.timeout_seconds ?? 60,
                on_required_error:       pd.on_required_error || 'route_to_error',
                on_optional_error:       pd.on_optional_error || 'continue_with_error',
                output_key:              pd.output_key || 'parallel_results',
                error_output_key:        pd.error_output_key || 'parallel_errors',
                include_branch_metadata: pd.include_branch_metadata !== false,
            });
            return;
        }

        // For parallel join (new merge data model)
        if (selectedNode.type === 'parallel_join') {
            const stored = versionId ? loadGraphFromStorage(versionId) : null;
            const pj = (stored?.nodes?.[selectedNode.id]?.data || selectedNode.data) as any;
            form.setFieldsValue({
                label:           pj.label || 'Merge',
                description:     pj.description || '',
                merge_strategy:  pj.merge_strategy || 'wait_selected',
                timeout_seconds: pj.timeout_seconds ?? null,
                on_branch_error: pj.on_branch_error || 'fail_merge',
                output_key:      pj.output_key || 'merged_parallel_results',
                output_format:   pj.output_format || 'object_by_branch',
                include_errors:  pj.include_errors !== false,
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
            } else if (selectedNode.type === 'error') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label || 'Error Handler',
                        configurations: {
                            error_api_url: newValues.error_api_url || '',
                            error_api_method: 'POST',
                        },
                    },
                };
            } else if (selectedNode.type === 'queue') {
                const { label, description, queue_name, name, ...configurations } = newValues;
                const currentConfigurations = currentNode.data.configurations_json;
                const currentConfigObject =
                    currentConfigurations && typeof currentConfigurations === 'object' && !Array.isArray(currentConfigurations)
                        ? currentConfigurations
                        : {};
                const nextConfigurations: Record<string, any> = {
                    ...currentConfigObject,
                    inherit_previous_response: configurations.inherit_previous_response !== false,
                    method: configurations.method || 'POST',
                    ...configurations,
                };
                nextConfigurations.body_params_type = 'form-data';
                delete nextConfigurations.body_params_raw;
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: label || 'Queue',
                        description: description || '',
                        queue_name: queue_name || name || '',
                        configurations_json: nextConfigurations,
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
            } else if (selectedNode.type === 'queue') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label: newValues.label,
                        description: newValues.description,
                        queue_name: newValues.queue_name,
                        priority: newValues.priority,
                        wait_for_completion: newValues.wait_for_completion,
                    },
                };
            } else if (selectedNode.type === 'parallel_split') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label:                   newValues.label || 'Split',
                        description:             newValues.description || '',
                        split_mode:              newValues.split_mode || 'parallel_all',
                        source_scope:            newValues.source_scope || 'state',
                        source_node_id:          newValues.source_node_id || '',
                        source_output_key:       newValues.source_output_key || '',
                        source_path:             newValues.source_path || '',
                        branches:                Array.isArray(newValues.branches) ? newValues.branches : [],
                        timeout_seconds:         newValues.timeout_seconds ?? 60,
                        on_required_error:       newValues.on_required_error || 'route_to_error',
                        on_optional_error:       newValues.on_optional_error || 'continue_with_error',
                        output_key:              newValues.output_key || 'parallel_results',
                        error_output_key:        newValues.error_output_key || 'parallel_errors',
                        include_branch_metadata: newValues.include_branch_metadata !== false,
                    },
                };
            } else if (selectedNode.type === 'parallel_join') {
                updatedNode = {
                    ...currentNode,
                    data: {
                        ...currentNode.data,
                        label:           newValues.label || 'Merge',
                        description:     newValues.description || '',
                        merge_strategy:  newValues.merge_strategy || 'wait_selected',
                        timeout_seconds: newValues.timeout_seconds ?? null,
                        on_branch_error: newValues.on_branch_error || 'fail_merge',
                        output_key:      newValues.output_key || 'merged_parallel_results',
                        output_format:   newValues.output_format || 'object_by_branch',
                        include_errors:  newValues.include_errors !== false,
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
        <div className="properties-drawer__param-group">
            {!hideTitle && <Text strong className="properties-drawer__subsection-label pd-subsection-label">{title}</Text>}
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.length === 0 && (
                            <Text type="secondary" className="properties-drawer__empty-hint pd-empty-hint">
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

    const renderBodyConfigPanel = (isQueueNode: boolean) => (
        <div className="properties-drawer__param-group">
            {isQueueNode ? (
                <>
                    <Text type="secondary" className="pd-body-helper-text">
                        The Queue request body starts with the previous node response automatically. Add any extra key/value fields below and they will be merged into the same outbound JSON.
                    </Text>
                    <Form.Item label="Base Payload (Auto)">
                        <Input.TextArea
                            value="{{last_result}}"
                            rows={4}
                            disabled
                            className="pd-font-mono pd-body-raw-input"
                        />
                    </Form.Item>
                    <DynamicParamList name="body_params" title="Additional Body Fields" emptyMessage="No additional fields." hideTitle />
                </>
            ) : (
                <>
                    <Form.Item label="Body Mode" name="body_params_type" initialValue="form-data">
                        <Select
                            options={[
                                { label: 'No Body', value: 'none' },
                                { label: 'Form Fields', value: 'form-data' },
                                { label: 'Raw JSON', value: 'raw' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.body_params_type !== currentValues.body_params_type}>
                        {({ getFieldValue }) => {
                            const bodyMode = getFieldValue('body_params_type') || 'form-data';
                            if (bodyMode === 'none') {
                                return (
                                    <Text type="secondary" className="properties-drawer__empty-hint pd-empty-hint">
                                        This request will be sent without a body.
                                    </Text>
                                );
                            }
                            if (bodyMode === 'raw') {
                                return (
                                    <Form.Item
                                        name="body_params_raw"
                                        initialValue={'{\n  \n}'}
                                        className="pd-body-raw-item"
                                    >
                                        <Input.TextArea
                                            rows={10}
                                            className="pd-font-mono pd-body-raw-input"
                                            placeholder={'{\n  \n}'}
                                        />
                                    </Form.Item>
                                );
                            }
                            return <DynamicParamList name="body_params" title="Body Parameters" emptyMessage="No body parameters." hideTitle />;
                        }}
                    </Form.Item>
                </>
            )}
        </div>
    );

    const AccordionLabel = ({ name, title, formInstance }: { name: string, title: string, formInstance: any }) => {
        const data = Form.useWatch(name, formInstance);
        const bodyType = Form.useWatch('body_params_type', formInstance);
        const bodyRaw = Form.useWatch('body_params_raw', formInstance);
        const count = name === 'body_params'
            ? (bodyType === 'raw'
                ? (String(bodyRaw || '').trim() ? 1 : 0)
                : Array.isArray(data)
                    ? data.filter((d: any) => d && d.key).length
                    : 0)
            : Array.isArray(data)
                ? data.filter((d: any) => d && d.key).length
                : 0;
        return (
            <div className="pd-accordion-label">
                <span className="pd-accordion-title">{title}</span>
                <AnimatePresence>
                    {count > 0 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="pd-count-badge"
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
                <div className="properties-drawer__section-title pd-section-title-no-margin">Endpoint</div>
                <div className="properties-drawer__flex-row">
                    <Form.Item label="URL" name="url" className="properties-drawer__flex-item">
                        <Input placeholder="https://api.example.com/v1/resource" />
                    </Form.Item>
                </div>
                <div className="pd-method-wrap">
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
                        { key: 'body_params', label: <AccordionLabel name="body_params" title="Body Parameters" formInstance={form} />, children: renderBodyConfigPanel(selectedNode?.type === 'queue') }
                    ]}
                />
            </>
        );
    };

    const renderStateManagement = () => (
        <div className="pd-state-management">
            <Text type="secondary" className="pd-state-description">
                Map values from the API response directly to global state variables. Use <strong>$</strong> to select the entire response payload, or use dot notation (e.g., <strong>data.id</strong>) to extract specific nested fields.
            </Text>
            <Form.List name="response_to_state_mapping">
                {(fields, { add, remove }) => (
                    <div className="pd-mapping-list">
                        {fields.length === 0 && (
                            <Text type="secondary" className="pd-empty-mapping">
                                No output mappings defined.
                            </Text>
                        )}
                        {fields.map(({ key, name: fieldName, ...restField }) => (
                            <div key={key} className="pd-mapping-row">
                                <div className="pd-mapping-fields">

                                    <div className="pd-mapping-top-row">
                                        <Form.Item
                                            {...restField}
                                            name={[fieldName, 'state_key']}
                                            className="pd-mapping-state-key"
                                            rules={[{ required: true, message: 'State Key required' }]}
                                        >
                                            <Select
                                                showSearch
                                                options={availableStateKeys}
                                                placeholder="Select state variable"
                                                optionFilterProp="value"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[fieldName, 'datatype']}
                                            className="pd-mapping-datatype"
                                            initialValue="string"
                                        >
                                            <Select
                                                options={[
                                                    { label: "String", value: "string" },
                                                    { label: "Integer", value: "integer" },
                                                    { label: "Float", value: "float" },
                                                    { label: "Boolean", value: "boolean" },
                                                    { label: "Object", value: "object" },
                                                    { label: "Array", value: "array" },
                                                    { label: "Any", value: "any" }
                                                ]}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        {...restField}
                                        name={[fieldName, 'source_path']}
                                        className="pd-mapping-source-path"
                                        rules={[{ required: true, message: 'Source Path required' }]}
                                    >
                                        <Input placeholder="Source Path (e.g. data.id or $)" />
                                    </Form.Item>

                                </div>
                                <DeleteOutlined
                                    className="pd-mapping-delete-btn"
                                    onClick={() => remove(fieldName)}
                                />
                            </div>
                        ))}
                        <Button
                            type="dashed"
                            onClick={() => add({ state_key: '', source_path: '$', datatype: 'string' })}
                            icon={<PlusOutlined />}
                            block
                        >
                            Add Mapping Row
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );


    // Drawer is open if exactly ONE node or exactly ONE edge is selected
    const isOpen = selectedNode !== null || selectedEdge !== null;
    const nodeData = selectedNode?.data as unknown as CanvasNodeData | undefined;
    const edgeData = selectedEdge?.data as unknown as CanvasEdgeData | undefined;

    // Render forms based on what is selected
    const renderContent = () => {
        if (selectedNode) {
            const isSubFlow = selectedNode.type === 'subflow';
            const isConnector = selectedNode.type === 'connector';
            const isStart = selectedNode.type === 'start';
            const isDecision = selectedNode.type === 'decision';
            const isEnd = selectedNode.type === 'end';
            const isAction = selectedNode.type === 'action';
            const isError = selectedNode.type === 'error';
            const isQueue = selectedNode.type === 'queue';
            const isParallelSplit = selectedNode.type === 'parallel_split';
            const isParallelJoin = selectedNode.type === 'parallel_join';

            const isStructural = isDecision || isQueue || isParallelSplit || isParallelJoin;
            const activeColor =
                (isDecision || isQueue) ? 'var(--color-warning)' :
                    isParallelSplit ? 'var(--color-node-split)' :
                        isParallelJoin ? 'var(--color-node-join)' :
                            isError ? 'var(--color-error)' :
                                ((isStart || isEnd) ? 'var(--color-success)' : 'var(--accent)');



            if (isLoadingAction) {
                return (
                    <div className="pd-empty-center">
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
                                        className="pd-overview-tab-inner"
                                    >
                                        {/* Node Metadata Card */}
                                        <div className="properties-drawer__meta">
                                            <div className="properties-drawer__meta-item">
                                                <span className="properties-drawer__meta-label">Type</span>
                                                <span className="properties-drawer__meta-value pd-meta-value-bold">
                                                    {isStart ? 'Workflow Entry'
                                                        : isEnd ? 'Workflow Exit'
                                                            : isError ? 'Error Handler'
                                                                : isDecision ? 'Router'
                                                                    : isSubFlow ? 'Group'
                                                                        : isParallelSplit ? 'Split'
                                                                            : isParallelJoin ? 'Merge'
                                                                                : isQueue ? 'External Queue API'
                                                                                    : (nodeData?.category || 'Action')}
                                                </span>
                                            </div>
                                            {isAction && (
                                                <div className="properties-drawer__meta-item">
                                                    <span className="properties-drawer__meta-label">Key</span>
                                                    <span className="properties-drawer__meta-value pd-meta-value-mono">
                                                        {nodeData?.action_key}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="properties-drawer__meta-item">
                                                <span className="properties-drawer__meta-label">Capability</span>
                                                <div className={`properties-drawer__capability-badge badge-${isDecision ? 'decision' : (isQueue ? 'queue' : nodeData?.capability)}`}>
                                                    {isStart ? 'START'
                                                        : isDecision ? 'DECISION'
                                                            : isEnd ? 'END'
                                                                : isError ? 'ERR'
                                                                    : isQueue ? 'QUEUE'
                                                                        : isSubFlow ? 'STRUCTURE'
                                                                            : isParallelSplit ? 'SPLIT'
                                                                                : isParallelJoin ? 'MERGE'
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
                                                    <div className="properties-drawer__section-title pd-section-title-no-margin">Identity</div>
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

                                            {isQueue && (
                                                <Form.Item
                                                    label="Description"
                                                    name="description"
                                                >
                                                    <Input placeholder="e.g. Update RCM task state" />
                                                </Form.Item>
                                            )}

                                            {(isParallelSplit || isParallelJoin) && (
                                                <Form.Item
                                                    label="Description"
                                                    name="description"
                                                >
                                                    <Input placeholder={isParallelSplit ? "e.g. Split execution for sub-tasks" : "e.g. Merge parallel results"} />
                                                </Form.Item>
                                            )}

                                            {isStart && (
                                                <>
                                                    <div className="properties-drawer__divider" />
                                                    <div className="properties-drawer__section-title">Initial State Variables</div>
                                                    <Text type="secondary" className="pd-state-description">
                                                        State is used to store and pass data between all nodes in a workflow so
                                                        they can share and update information.
                                                    </Text>
                                                    <Form.List name="initial_state">
                                                        {(fields, { add, remove }) => (
                                                            <div className="pd-mapping-list">
                                                                {fields.map(({ key, name: fieldName, ...restField }) => (
                                                                    <div key={key} className="pd-initial-state-row">
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[fieldName, 'key']}
                                                                            className="pd-form-item-key"
                                                                            rules={[{ required: true, message: 'Key required' }]}
                                                                        >
                                                                            <Input placeholder="Variable Name" className="pd-input-mono" />
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[fieldName, 'type']}
                                                                            className="pd-form-item-type"
                                                                            initialValue="string"
                                                                        >
                                                                            <Select
                                                                                options={[
                                                                                    { label: "String", value: "string" },
                                                                                    { label: "Integer", value: "integer" },
                                                                                    { label: "Float", value: "float" },
                                                                                    { label: "Boolean", value: "boolean" },
                                                                                    { label: "Object", value: "object" },
                                                                                    { label: "Array", value: "array" },
                                                                                    { label: "Date", value: "date" },
                                                                                    { label: "DateTime", value: "datetime" },
                                                                                    { label: "Any", value: "any" }
                                                                                ]}
                                                                            />
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[fieldName, 'value']}
                                                                            className="pd-form-item-value"
                                                                        >
                                                                            <Input placeholder="Default Value" />
                                                                        </Form.Item>
                                                                        <DeleteOutlined
                                                                            className="pd-delete-btn pd-delete-btn--offset"
                                                                            onClick={() => remove(fieldName)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    type="dashed"
                                                                    onClick={() => add({ key: '', type: 'str', value: '' })}
                                                                    icon={<PlusOutlined />}
                                                                    block
                                                                >
                                                                    Add Variable
                                                                </Button>
                                                            </div>
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
                                        className="pd-overview-tab-inner"
                                    >
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onValuesChange={handleValuesChange}
                                            className="properties-drawer__form"
                                        >
                                            {isDecision ? (
                                                <DecisionPropertiesPanel form={form} nodes={nodes} availableStateKeys={availableStateKeys} />
                                            ) : isQueue ? (
                                                <>
                                                    <div className="properties-drawer__section-title pd-section-title-first">Queue Target</div>
                                                    <Form.Item
                                                        label="Target Name"
                                                        name="queue_name"
                                                        extra="e.g. rcm_task_update, denial_task_queue"
                                                    >
                                                        <Input placeholder="rcm_task_update" className="pd-input-mono" />
                                                    </Form.Item>

                                                    <div className="properties-drawer__divider" />
                                                    <div className="properties-drawer__section-title">Queue API</div>
                                                    <Text type="secondary" className="pd-state-description pd-state-description--compact">
                                                        Configure the external workflow API that updates the current task payload and can mock creation of the next task.
                                                    </Text>
                                                    {renderNodeConfig(nodeData as CanvasNodeData)}
                                                </>
                                            ) : isEnd ? (
                                                <>
                                                    <div className="properties-drawer__section-title pd-section-title-no-margin">Response Formatting</div>
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
                                                                    <Input.TextArea rows={6} className="pd-font-mono" placeholder="{\n  &quot;status&quot;: &quot;success&quot;\n}" />
                                                                </Form.Item>
                                                            ) : null;
                                                        }}
                                                    </Form.Item>
                                                </>
                                            ) : isError ? (
                                                <>
                                                    {/* ── Error API Configuration ── */}
                                                    <div className="properties-drawer__section-title pd-section-title-no-margin">Error API</div>
                                                    <Form.Item
                                                        label="API Title"
                                                        name="label"
                                                    >
                                                        <Input placeholder="Error Handler" />
                                                    </Form.Item>

                                                    <div className="properties-drawer__flex-row pd-flex-row-end">
                                                        <Form.Item label="HTTP Method" className="pd-error-method-item">
                                                            <Input value="POST" disabled className="pd-error-method-input" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            label="Error API URL"
                                                            name="error_api_url"
                                                            className="pd-error-url-item"
                                                            rules={[{ type: 'url', message: 'Enter a valid URL' }]}
                                                        >
                                                    <Input placeholder="https://api.example.com/error-logs" />
                                                </Form.Item>
                                            </div>
                                        </>
                                    ) : isParallelSplit ? (
                                        <SplitPropertiesPanel
                                            form={form}
                                            nodes={nodes}
                                            edges={edges}
                                            selectedNodeId={selectedNode.id}
                                            availableStateKeys={availableStateKeys}
                                        />
                                    ) : isParallelJoin ? (
                                        <MergePropertiesPanel
                                            form={form}
                                            nodes={nodes}
                                            edges={edges}
                                            selectedNodeId={selectedNode.id}
                                        />
                                    ) : (
                                        renderNodeConfig(nodeData as CanvasNodeData)
                                    )}
                                        </Form>
                                    </motion.div>
                                )
                            }] : []),
                            ...((!isSubFlow && !isStart && !isDecision && !isConnector && !isError && !isParallelSplit && !isParallelJoin) ? [{
                                key: '3',
                                label: 'Settings',
                                children: (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: 16 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        className="pd-overview-tab-inner"
                                    >
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onValuesChange={handleValuesChange}
                                            className="properties-drawer__form"
                                        >
                                            {isQueue ? (
                                                <>
                                                    <div className="properties-drawer__section-title pd-section-title-no-margin">Response to State Mapping</div>
                                                    {renderStateManagement()}
                                                </>
                                            ) : isEnd ? (
                                                <>
                                                    <div className="properties-drawer__section-title pd-section-title-no-margin">Failure Settings</div>
                                                    <Text type="secondary" className="pd-state-description">
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
                                                    <div className="properties-drawer__section-title pd-section-title-no-margin">Fallback Settings</div>
                                                    <Form.Item name="fallback_message" label="Fallback Message">
                                                        <Input.TextArea placeholder="Used if action fails..." rows={4} />
                                                    </Form.Item>

                                                    <div className="properties-drawer__divider" />
                                                    <div className="properties-drawer__section-title">Response to State Mapping</div>
                                                    {renderStateManagement()}
                                                </>
                                            )}
                                        </Form>
                                    </motion.div>
                                )
                            }] : []),
                            ...(executionStep && (executionStep.status === 'success' || executionStep.status === 'error') ? [{
                                key: 'exec_logs',
                                label: (
                                    <div className="pd-flex-center pd-gap-6">
                                        <span className={`pd-status-dot ${executionStep.status === 'success' ? 'pd-status-success' : 'pd-status-error'}`} />
                                        Execution
                                    </div>
                                ),
                                children: (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: 16 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        className="pd-overview-tab-inner"
                                    >
                                        <div className="properties-drawer__section-title pd-section-title-no-margin">Step Inputs (Scope)</div>
                                        <div className="pd-code-block pd-code-block--inputs">
                                            <pre className="pd-code-pre">
                                                {JSON.stringify(executionStep.inputData, null, 2)}
                                            </pre>
                                        </div>

                                        <div className={`properties-drawer__section-title ${executionStep.status === 'error' ? 'pd-status-title--error' : ''}`}>
                                            Step Output {executionStep.status === 'error' && '(Error)'}
                                        </div>
                                        <div className={`pd-code-block pd-code-block--output ${executionStep.status === 'error' ? 'pd-code-block--error' : ''}`}>
                                            <pre className={`pd-code-pre ${executionStep.status === 'error' ? 'pd-code-pre--error' : ''}`}>
                                                {JSON.stringify(executionStep.data?.data, null, 2)}
                                            </pre>
                                        </div>
                                    </motion.div>
                                )
                            }] : [])
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
                            <div className="properties-drawer__capability-badge badge-default pd-badge-capitalize">
                                {edgeData?.routeType || 'unconditional'}
                            </div>
                        </div>
                        <div className="properties-drawer__meta-item">
                            <span className="properties-drawer__meta-label">ID</span>
                            <span className="properties-drawer__meta-value pd-meta-value-mono">
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
                    initial={{ x: 350, y: 350, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    exit={{ x: 350, y: 350, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 150 }}
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
