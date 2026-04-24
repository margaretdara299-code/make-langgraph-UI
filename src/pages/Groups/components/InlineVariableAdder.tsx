import { useState } from 'react';
import { Input, Select, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { createVariable } from '@/services/variables.service';

interface InlineVariableAdderProps {
    groupName: string;
    groupKey: string;
    onAdded: () => void;
    onCancel: () => void;
}

/**
 * Inline footer row for group cards to quickly add new variables.
 */
export const InlineVariableAdder = ({ groupName, groupKey, onAdded, onCancel }: InlineVariableAdderProps) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [type, setType] = useState('string');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleAdd = async () => {
        // Basic Validation
        const trimmedName = name.trim();
        const trimmedValue = value.trim();
        const finalKey = (key.trim() || trimmedName.toUpperCase().replace(/[^A-Z0-9_]/g, '_'));

        const newErrors: Record<string, string> = {};
        if (!trimmedName) newErrors.name = 'Required';
        if (!trimmedValue) newErrors.value = 'Required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        const res = await createVariable({
            variableName: trimmedName,
            variableKey: finalKey,
            dataType: type,
            variableValue: trimmedValue,
            groupName,
            groupKey
        });
        setLoading(false);
        
        if (res.success) {
            setName('');
            setKey('');
            setValue('');
            onAdded();
            message.success('Variable created successfully');
        } else {
            message.error(res.error || 'Failed to create variable');
        }
    };

    return (
        <div className="variable-list-item postman-add-row adder-row">
            <div className="var-metadata-row-table">
                <div className="var-meta-column">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Input 
                            variant="filled" 
                            size="small" 
                            placeholder="Variable Name" 
                            value={name} 
                            status={errors.name ? 'error' : ''}
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }} 
                            style={{ fontSize: '11px' }}
                        />
                        {errors.name && <div className="validation-msg-tiny" style={{ marginTop: '-2px', marginBottom: '4px' }}>{errors.name}</div>}
                        <Input 
                            variant="filled" 
                            size="small" 
                            placeholder="KEY" 
                            value={key} 
                            onChange={e => setKey(e.target.value)} 
                            style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                        />
                    </div>
                </div>
                <div className="var-meta-column">
                    <Select 
                        variant="filled" 
                        size="small" 
                        value={type} 
                        onChange={setType} 
                        style={{ width: '100%', fontSize: '10px' }} 
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
                        variant="filled" 
                        size="small" 
                        placeholder="Variable Value"
                        value={value} 
                        status={errors.value ? 'error' : ''}
                        onChange={e => { setValue(e.target.value); if (errors.value) setErrors(prev => ({ ...prev, value: '' })); }} 
                        onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleAdd(); } }} 
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        style={{ width: '100%', fontSize: '12px', fontFamily: 'var(--font-mono)' }} 
                    />
                    {errors.value && <div className="validation-msg-tiny">{errors.value}</div>}
                </div>
            </div>
            
            <div className="variable-item-actions" style={{ marginLeft: '12px', opacity: 1 }}>
                <Space size={4}>
                    <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckOutlined style={{ fontSize: '12px' }} />} 
                        onClick={handleAdd} 
                        loading={loading} 
                        className="inline-save-btn"
                    />
                    <Button 
                        size="small"
                        icon={<CloseOutlined style={{ fontSize: '12px' }} />} 
                        onClick={onCancel} 
                        className="inline-cancel-btn"
                    />
                </Space>
            </div>
        </div>
    );
};
