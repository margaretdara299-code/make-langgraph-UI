import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updateGroup } from '@/services/groups.service';
import { LucideIconPicker, DynamicLucideIcon } from '@/components/LucideIconPicker/LucideIconPicker';
import type { Group } from '@/services/groups.service';

import { GROUP_VALIDATION } from '@/constants';

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
    const [icon, setIcon] = useState(group.icon || 'Folder');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const handleUpdate = async () => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim() || trimmedName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        
        const newErrors: Record<string, string> = {};
        if (!trimmedName) newErrors.name = GROUP_VALIDATION.NAME_REQUIRED;
        if (!trimmedKey) newErrors.key = GROUP_VALIDATION.KEY_REQUIRED;
        if (!icon) newErrors.icon = GROUP_VALIDATION.ICON_REQUIRED;


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        const res = await updateGroup(group.groupId, { 
            groupName: trimmedName, 
            groupKey: trimmedKey,
            description: description.trim() || null,
            icon: icon
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
                        <DynamicLucideIcon name={icon} size={16} />
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
            
            <div className="group-card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div className="group-icon-picker-inline" style={{ padding: '0 4px', position: 'relative' }}>
                        <div style={{ border: errors.icon ? '1px solid #ef4444' : 'none', borderRadius: '8px', display: 'flex' }}>
                            <LucideIconPicker value={icon} onChange={(val) => { setIcon(val); if (errors.icon) setErrors(prev => ({ ...prev, icon: '' })); }} />
                        </div>
                        {errors.icon && <div className="validation-msg-tiny" style={{ position: 'absolute', top: '100%', left: 0, whiteSpace: 'nowrap' }}>Required</div>}
                    </div>
                    <div style={{ flex: 1.5 }}>

                        <Input 
                            variant="filled"
                            placeholder="Group Name" 
                            size="small"
                            style={{ width: '100%', fontWeight: 600, height: '32px' }} 
                            status={errors.name ? 'error' : ''}
                            value={name}
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
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
