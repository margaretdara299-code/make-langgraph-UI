import { Tooltip } from 'antd';
import { LogoutOutlined, RightOutlined } from '@ant-design/icons';
import type { SidebarFooterProps } from '@/interfaces';

export default function SidebarFooter({
    collapsed,
    onToggleCollapse,
    onLogout,
}: SidebarFooterProps) {
    return (
        <div className="main-layout__sidebar-footer">
            <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
                <div
                    className="main-layout__sidebar-logout"
                    onClick={(e) => {
                        e.stopPropagation();
                        onLogout();
                    }}
                    id="sidebar-logout-btn"
                >
                    <LogoutOutlined />
                    {!collapsed && <span>Logout</span>}
                </div>
            </Tooltip>
            <div
                className="main-layout__sidebar-collapse"
                onClick={onToggleCollapse}
            >
                <RightOutlined
                    className={`main-layout__sidebar-collapse-icon ${collapsed ? '' : 'rotated'
                        }`}
                />
            </div>
        </div>
    );
}
