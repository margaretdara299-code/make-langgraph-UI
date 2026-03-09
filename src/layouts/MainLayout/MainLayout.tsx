/**
 * Main application layout using AntD Layout, Menu, and Input.
 */

import { Layout, Menu, Input, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MainLayoutProps } from '@/interfaces';
import { ROUTES } from '@/routes';
import { SIDEBAR_MENU_ITEMS } from '@/constants';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active menu key
    const selectedKey = SIDEBAR_MENU_ITEMS.find((item) =>
        location.pathname.startsWith(item.key)
    )?.key ?? ROUTES.SKILLS_LIBRARY;

    return (
        <Layout className="main-layout">
            <Header className="main-layout__header">
                <div className="main-layout__logo" onClick={() => navigate(ROUTES.SKILLS_LIBRARY)}>
                    <span className="main-layout__logo-icon">⬡</span>
                    <Text strong className="main-layout__logo-brand">Tensaw</Text>
                    <Text className="main-layout__logo-sub">Skills Studio</Text>
                </div>

                <Input.Search
                    placeholder="Search Skills, Cases, Workflows..."
                    className="main-layout__search"
                    allowClear
                />

                <Space size="middle" className="main-layout__actions">
                    <span className="main-layout__env-badge">Dev</span>
                    <UserOutlined className="main-layout__user-icon" />
                </Space>
            </Header>

            <Layout>
                <Sider width={220} className="main-layout__sidebar">
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={SIDEBAR_MENU_ITEMS}
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
