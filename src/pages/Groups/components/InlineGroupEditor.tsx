import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updateGroup } from '@/services/groups.service';
import type { Group } from '@/services/groups.service';

interface InlineGroupEditorProps {
    group: Group;
    onUpdated: () => void;
    onCancel: () => void;
}

/**
 * Inline editor that replaces the Group Card display with a form.
 */
export const InlineGroupEditor = ({ group, onUpdated, onCancel }: InlineGroupEditorProps) => {
    const [name, setName] = useState(group.groupName);
    const [key, setKey] = useState(group.groupKey);
    const [description, setDescription] = useState(group.description || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name) return;
        setLoading(true);
        const res = await updateGroup(group.groupId, { 
            groupName: name, 
            groupKey: key,
            description: description || null
        });
        setLoading(false);
        
        if (res.success) {
            message.success('Group updated successfully');
            onUpdated();
        } else {
            message.error(res.error || 'Failed to update group');
        }
    };

    return (
        <div className="group-card editing-group-card reveal-up" style={{ padding: '0', border: '1.5px solid var(--accent, #6366f1)', boxSizing: 'border-box' }}>
            <div className="group-card-header" style={{ padding: '8px 12px', background: 'var(--bg-main)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="group-card-icon" style={{ background: 'var(--accent)', color: '#fff', width: '32px', height: '32px' }}>
                        <Edit2 size={16} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>Editing Group</span>
                </div>
                <Space size={4}>
                    <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckOutlined />} 
                        onClick={handleUpdate} 
                        loading={loading} 
                        disabled={!name}
                        style={{ borderRadius: '6px', width: '32px', height: '28px' }}
                    />
                    <Button 
                        size="small"
                        icon={<CloseOutlined />} 
                        onClick={onCancel} 
                        style={{ borderRadius: '6px', width: '32px', height: '28px' }}
                    />
                </Space>
            </div>
            
            <div className="group-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Input 
                        variant="filled"
                        placeholder="Group Name" 
                        size="small"
                        style={{ flex: 1.5, fontWeight: 600, height: '32px' }} 
                        value={name}
                        onChange={e => setName(e.target.value)}
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
