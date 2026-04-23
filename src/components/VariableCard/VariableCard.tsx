import { Typography, Dropdown } from 'antd';
import { GlobalOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Variable } from '@/services/variables.service';
import './VariableCard.css';

const { Text, Paragraph } = Typography;

interface Props {
    variable: Variable;
    onAction: (key: string, variable: Variable) => void;
}

export default function VariableCard({ variable, onAction }: Props) {
    const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
        domEvent.stopPropagation();
        onAction(key, variable);
    };

    const menuItems: MenuProps['items'] = [
        { key: 'edit', icon: <EditOutlined />, label: 'Edit Variable' },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
    ];

    return (
        <div 
            className="capability-card-premium variable-card-enhanced" 
            onDoubleClick={() => onAction('edit', variable)}
        >
            <div className="cc-premium-header">
                <div className="cc-premium-icon-box">
                    <GlobalOutlined />
                </div>
                <Dropdown 
                    menu={{ items: menuItems, onClick: handleMenuClick }} 
                    trigger={['click']} 
                    placement="bottomRight"
                >
                    <button className="cc-menu-btn" onClick={e => e.stopPropagation()}>
                        <MoreOutlined />
                    </button>
                </Dropdown>
            </div>

            <div className="variable-card-content">
                <div className="variable-header-row">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text className="variable-group-name">
                            {variable.groupName || 'General'}
                        </Text>
                        <Text className="variable-key-mini">
                            {variable.variableKey}
                        </Text>
                    </div>
                    <div className="variable-type-tag">
                        {variable.dataType}
                    </div>
                </div>
                
                <Paragraph 
                    className="capability-desc" 
                    ellipsis={{ rows: 2, tooltip: true }}
                >
                    {variable.value}
                </Paragraph>
            </div>
        </div>
    );
}
