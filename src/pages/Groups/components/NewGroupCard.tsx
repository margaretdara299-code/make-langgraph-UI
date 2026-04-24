import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { createGroup } from '@/services/groups.service';

import { GROUP_VALIDATION } from '@/constants';

interface NewGroupCardProps {
    onAdded: () => void;
    onCancel: () => void;
}

/**
 * Inline card for creating a new Variable Group.
 * Part of the "Postman-like" high-density configuration UI.
 */
export const NewGroupCard = ({ onAdded, onCancel }: NewGroupCardProps) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreate = async () => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim() || trimmedName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        
        const newErrors: Record<string, string> = {};
        if (!trimmedName) newErrors.name = GROUP_VALIDATION.NAME_REQUIRED;
        if (!trimmedKey) newErrors.key = GROUP_VALIDATION.KEY_REQUIRED;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        setErrors({});
        setLoading(true);
        const res = await createGroup({ 
            groupName: trimmedName, 
            groupKey: trimmedKey,
            description: description.trim() || null
        });
        setLoading(false);
        
        if (res.success) {
            message.success('Group created successfully');
            onAdded();
        } else {
            message.error(res.error || 'Failed to create group');
        }
    };

    return (
        <div className="group-card new-group-card reveal-up" style={{ padding: '0', border: '1px solid var(--accent-light)', boxSizing: 'border-box' }}>
            <div className="group-card-header" style={{ padding: '12px 16px', background: 'var(--bg-main)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="group-card-icon" style={{ width: '32px', height: '32px' }}>
                        <FolderPlus size={16} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>Create New Group</span>
                </div>
                <Space size={8}>
                    <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckOutlined />} 
                        onClick={handleCreate} 
                        loading={loading} 
                        style={{ borderRadius: '6px', width: '36px', height: '30px' }}
                    />
                    <Button 
                        size="small"
                        icon={<CloseOutlined />} 
                        onClick={onCancel} 
                        style={{ borderRadius: '6px', width: '36px', height: '30px' }}
                    />
                </Space>
            </div>
            
            <div className="group-card-body" style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1.5 }}>
                        <Input 
                            variant="filled"
                            placeholder="Group Name" 
                            size="small"
                            style={{ width: '100%', fontWeight: 600, height: '32px' }} 
                            status={errors.name ? 'error' : ''}
                            value={name}
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
                            autoFocus
                        />
                        {errors.name && <div className="validation-msg-tiny">{errors.name}</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input 
                            variant="filled"
                            placeholder="KEY" 
                            size="small"
                            style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '11px', height: '32px' }} 
                            status={errors.key ? 'error' : ''}
                            value={key}
                            onChange={e => { setKey(e.target.value); if (errors.key) setErrors(prev => ({ ...prev, key: '' })); }}
                        />
                        {errors.key && <div className="validation-msg-tiny">{errors.key}</div>}
                    </div>
                </div>
                
                <div style={{ marginTop: '8px' }}>
                    <Input.TextArea 
                        variant="filled"
                        size="small"
                        placeholder="Brief description..." 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        style={{ borderRadius: '6px', fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--text-main)', padding: '8px 12px' }}
                    />
                </div>
            </div>
        </div>
    );
};
