/**
 * CreateActionUiFormStep — Step 5: Configure how the action renders on the canvas.
 */

import { Form, Input, Select, Switch, Typography } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import type { ActionUiFormConfig } from '@/interfaces';
import { DEFAULT_UI_FORM_CONFIG } from '@/constants';
import './CreateActionUiFormStep.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateActionUiFormStep({ draft, setDraft }: CreateActionStepProps) {
    const config: ActionUiFormConfig = draft.uiFormJson ?? DEFAULT_UI_FORM_CONFIG;

    const updateConfig = (field: keyof ActionUiFormConfig, value: unknown) => {
        setDraft(prev => ({
            ...prev,
            uiFormJson: { ...config, [field]: value },
        }));
    };

    return (
        <div className="action-ui-form-step">
            <div className="action-ui-form-step__header">
                <Title level={5} style={{ margin: 0 }}>Canvas Node UI</Title>
                <Text type="secondary">
                    Configure how this action&apos;s properties panel appears when selected on the canvas.
                </Text>
            </div>

            <Form layout="vertical" className="action-ui-form-step__form">
                <Form.Item label="Display Mode">
                    <Select
                        value={config.displayMode}
                        onChange={(val) => updateConfig('displayMode', val)}
                        options={[
                            { label: 'Auto-generate from Inputs', value: 'auto' },
                            { label: 'Custom Layout', value: 'custom' },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Group Label" tooltip="A label to group related fields in the properties panel">
                    <Input
                        placeholder="e.g. Connection Settings"
                        value={config.groupLabel}
                        onChange={(e) => updateConfig('groupLabel', e.target.value)}
                    />
                </Form.Item>

                <Form.Item label="Help Text" tooltip="Tooltip shown on the canvas node when hovered">
                    <TextArea
                        placeholder="Describe what this action does..."
                        value={config.helpText}
                        onChange={(e) => updateConfig('helpText', e.target.value)}
                        rows={3}
                        maxLength={300}
                        showCount
                    />
                </Form.Item>

                <Form.Item label="Show Advanced Settings" tooltip="Toggle whether advanced options are visible by default">
                    <Switch
                        checked={config.showAdvanced}
                        onChange={(val) => updateConfig('showAdvanced', val)}
                        checkedChildren="Visible"
                        unCheckedChildren="Hidden"
                    />
                </Form.Item>
            </Form>
        </div>
    );
}
