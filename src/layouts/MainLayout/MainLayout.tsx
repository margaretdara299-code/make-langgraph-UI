/**
 * Main application layout using AntD Layout, Menu, and Input.
 */

import { useState, useEffect } from 'react';
import { Layout, Menu, Input, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MainLayoutProps } from '@/interfaces';
import { ROUTES } from '@/routes';
import { SIDEBAR_MENU_ITEMS } from '@/constants';
import { setAuthPersistence } from '@/utils/auth.utils';
import SidebarFooter from './SidebarFooter';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState<string[]>([]);

    // Auto-collapse sidebar on design canvas, auto-expand on other pages
    useEffect(() => {
        if (location.pathname.includes('/design')) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [location.pathname]);

    // Determine active menu key
    const selectedKey = SIDEBAR_MENU_ITEMS.find((item) =>
        location.pathname.startsWith(item.key)
    )?.key ?? ROUTES.DASHBOARD;

    /** Ensure only one sub-menu is open at a time */
    const handleOpenChange = (keys: string[]) => {
        const latestOpenKey = keys.find(key => !openKeys.includes(key));
        if (latestOpenKey) {
            setOpenKeys([latestOpenKey]);
        } else {
            setOpenKeys([]);
        }
    };

    /** Clears auth state and redirects to the login page */
    const handleLogout = () => {
        setAuthPersistence(false);
        navigate(ROUTES.LOGIN, { replace: true });
    };

    return (
        <Layout className="main-layout">
            <Header className="main-layout__header">
                <div className="main-layout__logo" onClick={() => navigate(ROUTES.DASHBOARD)}>
                    <img src="/tensawLogo.jpg" alt="Tensaw Logo" className="main-layout__logo-image" />
                    <Text strong className="main-layout__logo-brand">Tensaw</Text>
                    <Text className="main-layout__logo-sub">Skills Studio</Text>
                </div>



                <Space size="middle" className="main-layout__actions">
                    <span className="main-layout__env-badge">Dev</span>
                    <UserOutlined className="main-layout__user-icon" />
                </Space>
            </Header>

            <Layout>
                <Sider
                    width={220}
                    className="main-layout__sidebar"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    trigger={
                        <SidebarFooter
                            collapsed={collapsed}
                            onToggleCollapse={() => setCollapsed(!collapsed)}
                            onLogout={handleLogout}
                        />
                    }
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        openKeys={openKeys}
                        onOpenChange={handleOpenChange}
                        items={SIDEBAR_MENU_ITEMS.map(item => ({
                            ...item,
                            icon: <item.icon />
                        }))}
                        onClick={({ key }) => navigate(key)}
                        style={{ borderRight: 'none', paddingTop: 8 }}
                    />
                </Sider>

                <Content className="main-layout__content">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
