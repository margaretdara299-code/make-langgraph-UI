import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { createGroup } from '@/services/groups.service';
import { LucideIconPicker, DynamicLucideIcon } from '@/components/LucideIconPicker/LucideIconPicker';
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
    const [icon, setIcon] = useState('');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const handleCreate = async () => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim() || trimmedName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        
        const newErrors: Record<string, string> = {};
        if (!trimmedName) newErrors.name = GROUP_VALIDATION.NAME_REQUIRED;
        if (!trimmedKey) newErrors.key = GROUP_VALIDATION.KEY_REQUIRED;
        if (!icon) newErrors.icon = GROUP_VALIDATION.ICON_REQUIRED;


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
            description: description.trim() || null,
            icon: icon
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
        <div className="group-card new-group-card reveal-up ngc-root">
            <div className="group-card-header ngc-header">
                <div className="ngc-header-left">
                    <div className="group-card-icon ngc-icon">
                        <DynamicLucideIcon name={icon || 'Plus'} size={16} />
                    </div>

                    <span className="ngc-title">Create New Group</span>
                </div>

                <Space size={8}>
                    <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckOutlined />} 
                        onClick={handleCreate} 
                        loading={loading} 
                        className="ngc-action-btn"
                    />
                    <Button 
                        size="small"
                        icon={<CloseOutlined />} 
                        onClick={onCancel} 
                        className="ngc-action-btn"
                    />
                </Space>
            </div>
            
            <div className="group-card-body ngc-body">
                <div className="ngc-fields-row">
                    <div className="group-icon-picker-inline ngc-picker-wrap">
                        <div className={`ngc-picker-border ${errors.icon ? 'ngc-picker-border--error' : ''}`}>
                            <LucideIconPicker value={icon} onChange={(val) => { setIcon(val); if (errors.icon) setErrors(prev => ({ ...prev, icon: '' })); }} />
                        </div>
                        {errors.icon && <div className="validation-msg-tiny ngc-validation-msg">Required</div>}
                    </div>

                    <div className="ngc-name-field">
                        <Input 
                            variant="filled"
                            placeholder="Group Name" 
                            size="small"
                            className="ngc-input-name"
                            status={errors.name ? 'error' : ''}
                            value={name}
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
                            autoFocus
                        />
                        {errors.name && <div className="validation-msg-tiny">{errors.name}</div>}
                    </div>
                    <div className="ngc-key-field">
                        <Input 
                            variant="filled"
                            placeholder="KEY" 
                            size="small"
                            className="ngc-input-key"
                            status={errors.key ? 'error' : ''}
                            value={key}
                            onChange={e => { setKey(e.target.value); if (errors.key) setErrors(prev => ({ ...prev, key: '' })); }}
                        />
                        {errors.key && <div className="validation-msg-tiny">{errors.key}</div>}
                    </div>
                </div>

                
                <div className="ngc-description-wrap">
                    <Input.TextArea 
                        variant="filled"
                        size="small"
                        placeholder="Brief description..." 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        className="ngc-textarea"
                    />
                </div>
            </div>
        </div>
    );
};
