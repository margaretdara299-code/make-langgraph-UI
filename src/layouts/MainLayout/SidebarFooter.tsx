import { Tooltip } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import type { SidebarFooterProps } from '@/interfaces';

export default function SidebarFooter({
    collapsed,
    onLogout,
}: SidebarFooterProps) {
    return (
        <div className="sidebar-user-section">
            <div className="user-info-row">
                <div className="user-avatar-small">
                    RO
                </div>
                {!collapsed && (
                    <div className="user-details">
                        <span className="user-name">Roshan</span>
                        <span className="user-badge">PRO</span>
                    </div>
                )}
                {!collapsed && (
                    <Tooltip title="Logout">
                        <button className="minimal-logout-btn" onClick={onLogout}>
                            <LogoutOutlined />
                        </button>
                    </Tooltip>
                )}
            </div>
            {collapsed && (
                <Tooltip title="Logout" placement="right">
                    <button 
                        className="minimal-logout-btn" 
                        onClick={onLogout}
                        style={{ margin: '8px auto', display: 'flex' }}
                    >
                        <LogoutOutlined />
                    </button>
                </Tooltip>
            )}
        </div>
    );
}
