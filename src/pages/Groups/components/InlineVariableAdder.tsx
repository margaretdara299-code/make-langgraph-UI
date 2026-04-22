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

    const handleAdd = async () => {
        if (!name || !value) return;
        setLoading(true);
        const res = await createVariable({
            variableName: name,
            variableKey: key || name.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
            dataType: type,
            variableValue: value,
            groupName,
            groupKey
        });
        setLoading(false);
        
        if (res.success) {
            setName('');
            setKey('');
            setValue('');
            onAdded();
            message.success('Variable created');
        } else {
            message.error(res.error || 'Failed to create variable');
        }
    };

    return (
        <div className="variable-list-item postman-add-row" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Input 
                    variant="filled"
                    size="small" 
                    placeholder="Variable Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    style={{ flex: 1 }} 
                />
                <Input 
                    variant="filled"
                    size="small" 
                    placeholder="VARIABLE_KEY" 
                    value={key} 
                    onChange={e => setKey(e.target.value)} 
                    style={{ flex: 1, textTransform: 'uppercase' }} 
                />
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
                    placeholder="Enter variable value..." 
                    value={value} 
                    onChange={e => setValue(e.target.value)} 
                    onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleAdd(); } }} 
                    autoSize={{ minRows: 1, maxRows: 8 }}
                    style={{ flex: 1 }} 
                />
                <Space size={4}>
                    <Button 
                        type="primary" 
                        icon={<CheckOutlined />} 
                        onClick={handleAdd} 
                        loading={loading} 
                        disabled={!name || !value} 
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
