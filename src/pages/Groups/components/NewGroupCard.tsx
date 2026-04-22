import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { createGroup } from '@/services/groups.service';

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

    const handleCreate = async () => {
        if (!name) return;
        setLoading(true);
        const res = await createGroup({ 
            groupName: name, 
            groupKey: key || name.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
            description: description || null
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
                        disabled={!name}
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
            
            <div className="group-card-body" style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Input 
                        variant="filled"
                        placeholder="Group Name" 
                        size="small"
                        style={{ flex: 1.5, fontWeight: 600, height: '32px' }} 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                    />
                    <Input 
                        variant="filled"
                        placeholder="KEY" 
                        size="small"
                        style={{ flex: 1, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '11px', height: '32px' }} 
                        value={key}
                        onChange={e => setKey(e.target.value)}
                    />
                </div>
                
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
    );
};
