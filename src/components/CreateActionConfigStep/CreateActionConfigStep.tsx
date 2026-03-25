import { useEffect } from 'react';
import { Form, Input, Select, Typography, Divider } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionConfigStep.css';

const { Title, Text } = Typography;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Title level={5} className="action-config-step__section-title">{children}</Title>
);

const InputOutputMapping = ({ outputKeyName = 'output_key', showInput = true }) => (
    <>
        {showInput && (
            <>
                <Divider />
                <SectionTitle>Input Mapping</SectionTitle>
                <Form.Item label="Input Variables (JSON)" name="input_mapping" tooltip="Automatically bind state variables to action inputs before execution">
                    <Input.TextArea rows={4} className="action-config-step__monospace-textarea"
                        placeholder={'{\n  "input_arg": "{{state.my_variable}}"\n}'}
                    />
                </Form.Item>
            </>
        )}
        <Divider />
        <SectionTitle>Output Mapping</SectionTitle>
        <Form.Item label="Save output to state variable" name={outputKeyName} tooltip="The JSON key in the global state where this node's result will be merged">
            <Input placeholder="e.g. my_result_key" className="action-config-step__monospace-input" />
        </Form.Item>
    </>
);

export default function CreateActionConfigStep({ draft, setDraft }: CreateActionStepProps) {
    const [form] = Form.useForm();
    const capability = draft.capability || 'api'; // Default to api if undefined

    useEffect(() => {
        form.setFieldsValue(draft.configurationsJson || {});
    }, [draft.configurationsJson, form]);

    const handleValuesChange = (_: any, allValues: any) => {
        setDraft(prev => ({ ...prev, configurationsJson: allValues }));
    };

    const renderCapabilityForm = () => {
        // Use the capability name as the primary key (lowercased)
        const capName = (draft.capability || capability).toLowerCase();

        switch (capName) {
            case 'condition':
            case 'rules':
                return (
                    <>
                        <SectionTitle>Condition Settings</SectionTitle>
                        <Form.Item label="Branch Expression" name="condition_expression">
                            <Input.TextArea rows={3} placeholder="state['status'] == 'denied'" className="action-config-step__monospace-textarea" />
                        </Form.Item>
                        <Divider />
                        <SectionTitle>Branch Labels</SectionTitle>
                        <Form.Item label="✅ True Branch Label" name="condition_true_label">
                            <Input placeholder="e.g. Is Denied" />
                        </Form.Item>
                        <Form.Item label="❌ False Branch Label" name="condition_false_label">
                            <Input placeholder="e.g. Not Denied" />
                        </Form.Item>
                    </>
                );

            case 'human input':
            case 'human':
                return (
                    <>
                        <SectionTitle>Human Input Settings</SectionTitle>
                        <Form.Item label="Prompt / Question" name="human_prompt">
                            <Input.TextArea rows={4} placeholder="Please review and approve the following: {{state.summary}}" />
                        </Form.Item>
                        <Form.Item label="Assignee / Queue" name="human_assignee">
                            <Input placeholder="e.g. rcm-review-team" />
                        </Form.Item>
                        <Form.Item label="Timeout (minutes)" name="human_timeout_min">
                            <Input type="number" placeholder="60" />
                        </Form.Item>
                        <Form.Item label="Required Action" name="human_action">
                            <Select options={[
                                { value: 'approve_reject', label: 'Approve / Reject' },
                                { value: 'input_form',     label: 'Fill in a Form' },
                                { value: 'free_text',      label: 'Free Text Response' },
                            ]} />
                        </Form.Item>
                    </>
                );

            case 'agent':
            case 'ai':
                return (
                    <>
                        <SectionTitle>Agent Settings</SectionTitle>
                        <div className="action-config-step__flex-row">
                            <Form.Item label="AI Model" name="ai_model" className="action-config-step__flex-item">
                                <Select options={[
                                    { value: 'gpt-4o',             label: '🤖 GPT-4o' },
                                    { value: 'gpt-4o-mini',        label: '🤖 GPT-4o Mini' },
                                    { value: 'claude-3-5-sonnet',  label: '🤖 Claude 3.5' },
                                    { value: 'gemini-1.5-pro',     label: '🤖 Gemini 1.5 Pro' },
                                    { value: 'llama-3-70b',        label: '🤖 LLaMA 3 70B' },
                                ]} />
                            </Form.Item>
                            <Form.Item label="Temp" name="ai_temperature" className="action-config-step__width-100">
                                <Input type="number" step={0.1} min={0} max={2} />
                            </Form.Item>
                        </div>
                        <Divider />
                        <SectionTitle>Prompts</SectionTitle>
                        <Form.Item label="System Prompt" name="ai_system_prompt">
                            <Input.TextArea rows={4} placeholder="You are an expert specialist..." />
                        </Form.Item>
                        <Form.Item label="User Prompt Template" name="ai_user_prompt" tooltip="Use {{state.variableName}} to dynamically inject values from the global state into your prompt.">
                            <Input.TextArea rows={6} placeholder="Summarize the input: {{state.details}}" />
                        </Form.Item>
                        <Form.Item label="Max Tokens" name="ai_max_tokens">
                            <Input type="number" placeholder="1024" />
                        </Form.Item>
                        <InputOutputMapping outputKeyName="ai_output_key" />
                    </>
                );

            case 'http request':
            case 'http':
            case 'api':
                return (
                    <>
                        <SectionTitle>HTTP Request Settings</SectionTitle>
                        <Form.Item label="URL" name="http_url">
                            <Input placeholder="https://api.example.com/v1/resource/{{state.id}}" />
                        </Form.Item>
                        <div className="action-config-step__flex-row">
                            <Form.Item label="Method" name="http_method" className="action-config-step__flex-item">
                                <Select options={[
                                    { value: 'GET',    label: 'GET' },
                                    { value: 'POST',   label: 'POST' },
                                    { value: 'PUT',    label: 'PUT' },
                                    { value: 'PATCH',  label: 'PATCH' },
                                    { value: 'DELETE', label: 'DELETE' },
                                ]} />
                            </Form.Item>
                            <Form.Item label="Timeout (ms)" name="http_timeout" className="action-config-step__width-120">
                                <Input type="number" placeholder="30000" />
                            </Form.Item>
                        </div>
                        <Divider />
                        <SectionTitle>Request</SectionTitle>
                        <Form.Item label="Headers (JSON)" name="http_headers">
                            <Input.TextArea rows={3} className="action-config-step__monospace-textarea" placeholder={'{\n  "Authorization": "Bearer {{env.API_TOKEN}}"\n}'} />
                        </Form.Item>
                        <Form.Item label="Body (JSON)" name="http_body">
                            <Input.TextArea rows={4} className="action-config-step__monospace-textarea" placeholder={'{\n  "id": "{{state.id}}"\n}'} />
                        </Form.Item>
                        <InputOutputMapping outputKeyName="http_output_key" showInput={false} />
                    </>
                );

            case 'custom function':
            case 'function':
            case 'rpa':
                return (
                    <>
                        <SectionTitle>Custom Function Settings</SectionTitle>
                        <Form.Item label="Function Name" name="func_name">
                            <Input placeholder="e.g. process_data" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <Divider />
                        <SectionTitle>Implementation</SectionTitle>
                        <Form.Item label="Python Code" name="func_code">
                            <Input.TextArea rows={10} className="action-config-step__monospace-textarea"
                                placeholder={`def process_data(state):\n    state['status'] = 'PROCESSED'\n    return state`}
                            />
                        </Form.Item>
                        <InputOutputMapping outputKeyName="func_output_key" />
                    </>
                );

            case 'loop':
                return (
                    <>
                        <SectionTitle>Loop Settings</SectionTitle>
                        <Form.Item label="Loop Type" name="loop_type">
                            <Select options={[
                                { value: 'for_each', label: '🔁 For Each (Iterates a list)' },
                                { value: 'while',    label: '🔄 While (Condition-based)' },
                                { value: 'times',    label: '🔢 N Times (Fixed count)' },
                            ]} />
                        </Form.Item>
                        <Form.Item label="Iterate Over (State Key)" name="loop_iterate_over">
                            <Input placeholder="e.g. state.items_list" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <Form.Item label="Item Alias" name="loop_item_alias">
                            <Input placeholder="e.g. item (accessed as state.item)" />
                        </Form.Item>
                        <Form.Item label="Max Iterations" name="loop_max_iterations">
                            <Input type="number" placeholder="100" />
                        </Form.Item>
                        <Form.Item label="Break Condition" name="loop_break_condition">
                            <Input placeholder="e.g. state.is_done == True" className="action-config-step__monospace-input" />
                        </Form.Item>
                    </>
                );

            case 'tool':
                return (
                    <>
                        <SectionTitle>Tool Settings</SectionTitle>
                        <Form.Item label="Tool Name (LangGraph)" name="tool_name">
                            <Input placeholder="e.g. run_calculation" style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                        <Form.Item label="Description (for AI planner)" name="tool_description">
                            <Input.TextArea rows={3} placeholder="Describes what this tool does to the AI agent." />
                        </Form.Item>
                        <Divider />
                        <SectionTitle>Parameters Schema definition</SectionTitle>
                        <Form.Item label="Parameters Schema (JSON)" name="tool_params" tooltip="The JSON Schema describing what arguments the AI should pass to this tool">
                            <Input.TextArea rows={5} className="action-config-step__monospace-textarea"
                                placeholder={'{\n  "query": {"type": "string"}\n}'}
                            />
                        </Form.Item>
                        <InputOutputMapping outputKeyName="tool_return_key" showInput={false} />
                    </>
                );

            case 'direct reply':
            case 'reply':
            case 'message':
                return (
                    <>
                        <SectionTitle>Direct Reply Settings</SectionTitle>
                        <Form.Item label="Message Template" name="reply_message">
                            <Input.TextArea rows={6} placeholder="Your request has been processed.\n\n{{state.summary}}" />
                        </Form.Item>
                        <Form.Item label="Format" name="reply_format">
                            <Select options={[
                                { value: 'text',     label: '📝 Plain Text' },
                                { value: 'markdown', label: '📋 Markdown' },
                                { value: 'html',     label: '🌐 HTML' },
                                { value: 'json',     label: '{ } JSON' },
                            ]} />
                        </Form.Item>
                        <Form.Item label="Channel" name="reply_channel">
                            <Select options={[
                                { value: 'api',    label: '🔌 API Response' },
                                { value: 'email',  label: '📧 Email' },
                                { value: 'slack',  label: '💬 Slack' },
                                { value: 'teams',  label: '💬 MS Teams' },
                            ]} />
                        </Form.Item>
                    </>
                );

            case 'database operation':
            case 'database':
                return (
                    <>
                        <SectionTitle>Database Query Settings</SectionTitle>
                        <Form.Item label="Connection" name="db_connection_id">
                            <Select placeholder="Select a connection..." options={[
                                { value: 'primary-db',          label: '🗄️ Primary SQLite' },
                                { value: 'postgres-rcm',         label: '🐘 RCM Postgres' },
                                { value: 'snowflake-analytics',  label: '❄️ Snowflake Analytics' },
                                { value: 'mysql-emr',            label: '🐬 MySQL EMR' },
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
                        <Divider />
                        <SectionTitle>Query</SectionTitle>
                        <Form.Item label="SQL Query" name="db_sql" tooltip="Use :param_name for bindings">
                            <Input.TextArea rows={6} className="action-config-step__monospace-textarea"
                                placeholder="SELECT * FROM table WHERE id = :id;"
                            />
                        </Form.Item>
                        <Form.Item label="Parameter Bindings (JSON)" name="db_params" tooltip="Map SQL variables to state values">
                            <Input.TextArea rows={4} className="action-config-step__monospace-textarea"
                                placeholder={'{\n  "id": "{{state.id}}"\n}'}
                            />
                        </Form.Item>
                        <Form.Item label="Return Mode" name="db_return_mode">
                            <Select options={[
                                { value: 'first', label: 'First Row Only' },
                                { value: 'all',   label: 'All Rows (List)' },
                            ]} />
                        </Form.Item>
                        <InputOutputMapping outputKeyName="db_output_key" showInput={false} />
                    </>
                );

            default:
                return (
                    <div className="action-config-step__empty-state">
                        <Text type="secondary">Select a valid capability in the Overview step to see configuration options.</Text>
                    </div>
                );
        }
    };

    return (
        <div className="action-config-step">
            <div className="action-config-step__header">
                <Title level={5} className="action-config-step__header-title">Action Configuration</Title>
                <Text type="secondary">
                    Provide the default behavioral parameters for this <strong>{capability.toUpperCase()}</strong> action.
                </Text>
            </div>
            
            <Form 
                form={form} 
                layout="vertical" 
                onValuesChange={handleValuesChange}
                className="action-config-step__form"
            >
                {renderCapabilityForm()}
            </Form>
        </div>
    );
}
