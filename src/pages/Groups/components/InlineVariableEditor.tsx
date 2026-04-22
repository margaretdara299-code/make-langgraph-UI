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

    const handleUpdate = async () => {
        setLoading(true);
        const res = await updateVariable(variable.variableId, {
            variableName: name,
            variableKey: key,
            dataType: type,
            variableValue: value
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
        <div className="variable-list-item postman-add-row editing-row" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Input variant="filled" size="small" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1 }} />
                <Input variant="filled" size="small" value={key} onChange={e => setKey(e.target.value)} style={{ flex: 1, textTransform: 'uppercase' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Select 
                    variant="filled" 
                    size="small" 
                    value={type} 
                    onChange={setType} 
                    style={{ width: '100px' }} 
                    options={[
                        { label: 'string', value: 'string' },
                        { label: 'number', value: 'number' },
                        { label: 'boolean', value: 'boolean' },
                        { label: 'object', value: 'object' }
                    ]} 
                />
                <Input.TextArea 
                    variant="filled" 
                    size="small" 
                    value={value} 
                    onChange={e => setValue(e.target.value)} 
                    onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleUpdate(); } }} 
                    autoSize={{ minRows: 1, maxRows: 8 }}
                    style={{ flex: 1 }} 
                />
                <Space size={4}>
                    <Button 
                        type="primary" 
                        icon={<CheckOutlined />} 
                        onClick={handleUpdate} 
                        loading={loading} 
                        style={{ borderRadius: '6px', height: '32px' }}
                    />
                    <Button 
                        icon={<CloseOutlined />} 
                        onClick={onCancel} 
                        style={{ borderRadius: '6px', height: '32px' }}
                    />
                </Space>
            </div>
        </div>
    );
};
