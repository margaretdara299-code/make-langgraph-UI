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
                <div className="variable-header-row-enhanced">
                    <Text className="var-name-premium">
                        {variable.variableName}
                    </Text>
                </div>
                
                <div className="var-metadata-row-table">
                    <div className="var-meta-column">
                        <span className="var-column-header">Key</span>
                        <span className="var-key-code">{variable.variableKey}</span>
                    </div>
                    <div className="var-meta-column">
                        <span className="var-column-header">Type</span>
                        <span className="variable-type-mini">{variable.dataType}</span>
                    </div>
                    <div className="var-meta-column var-meta-value-col">
                        <span className="var-column-header">Value</span>
                        <Paragraph 
                            className="var-value-text-enhanced" 
                            ellipsis={{ rows: 1, tooltip: true }}
                        >
                            {variable.variableValue}
                        </Paragraph>
                    </div>
                </div>
                
                {variable.groupName && (
                    <div className="variable-card-footer-group">
                        <Text className="variable-group-pill">
                            {variable.groupName}
                        </Text>
                    </div>
                )}
            </div>
        </div>
    );
}
