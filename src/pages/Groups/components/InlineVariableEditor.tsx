import { useState } from 'react';
import { Input, Select, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updateVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';

interface InlineVariableEditorProps {
    variable: Variable;
    onUpdated: () => void;
    onCancel: () => void;
}

/**
 * Replaces a variable row with an inline edit form.
 */
export const InlineVariableEditor = ({ variable, onUpdated, onCancel }: InlineVariableEditorProps) => {
    const [name, setName] = useState(variable.variableName);
    const [key, setKey] = useState(variable.variableKey);
    const [type, setType] = useState(variable.dataType);
    const [value, setValue] = useState(variable.variableValue);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleUpdate = async () => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();

        const newErrors: Record<string, string> = {};
        if (!trimmedName) newErrors.name = 'Name required';
        if (!trimmedKey) newErrors.key = 'Key required';
        if (!trimmedValue) newErrors.value = 'Value required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        const res = await updateVariable(variable.groupKey, variable.variableKey, {
            variableName: trimmedName,
            variableKey: trimmedKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
            dataType: type,
            variableValue: trimmedValue
        });
        setLoading(false);
        
        if (res.success) {
            onUpdated();
            message.success('Variable updated successfully');
        } else {
            message.error(res.error || 'Failed to update variable');
        }
    };

    return (
        <div className="variable-list-item editing-row-perfect">
            <div className="var-metadata-row-table">
                <div className="var-meta-column">
                    <div className="inline-meta-stack">
                        <Input 
                            variant="borderless" 
                            size="small" 
                            placeholder="Display Name" 
                            value={name} 
                            status={errors.name ? 'error' : ''}
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }} 
                            className="inline-input-name"
                        />
                        {errors.name && <div className="validation-msg-tiny validation-msg-ive">{errors.name}</div>}
                        <Input 
                            variant="borderless" 
                            size="small" 
                            placeholder="KEY" 
                            value={key} 
                            status={errors.key ? 'error' : ''}
                            onChange={e => { setKey(e.target.value); if (errors.key) setErrors(prev => ({ ...prev, key: '' })); }} 
                            className="inline-input-key"
                        />
                        {errors.key && <div className="validation-msg-tiny validation-msg-ive">{errors.key}</div>}
                    </div>
                </div>
                <div className="var-meta-column">
                    <Select 
                        variant="borderless" 
                        size="small" 
                        value={type} 
                        onChange={setType} 
                        className="inline-select-type"
                        popupClassName="premium-select-dropdown"
                        options={[
                            { label: 'String', value: 'string' },
                            { label: 'Number', value: 'number' },
                            { label: 'Boolean', value: 'boolean' },
                            { label: 'JSON', value: 'json' }
                        ]} 
                    />
                </div>
                <div className="var-meta-column var-meta-value-col">
                    <Input.TextArea 
                        variant="borderless" 
                        size="small" 
                        placeholder="Value"
                        value={value} 
                        status={errors.value ? 'error' : ''}
                        onChange={e => { setValue(e.target.value); if (errors.value) setErrors(prev => ({ ...prev, value: '' })); }} 
                        onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleUpdate(); } }} 
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        className="inline-input-value"
                    />
                    {errors.value && <div className="validation-msg-tiny">{errors.value}</div>}
                </div>
            </div>
            
            <div className="variable-item-actions visible">
                <Space size={8}>
                    <Button 
                        type="text" 
                        size="small"
                        icon={<CheckOutlined />} 
                        onClick={handleUpdate} 
                        loading={loading} 
                        className="btn-action-save"
                    />
                    <Button 
                        type="text"
                        size="small"
                        icon={<CloseOutlined />} 
                        onClick={onCancel} 
                        className="btn-action-cancel"
                    />
                </Space>
            </div>
        </div>
    );
};
