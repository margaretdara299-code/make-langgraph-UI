import React, { useState } from 'react';
import { Layout, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_MENU_ITEMS } from '@/constants/layout.constants';
import { setAuthPersistence } from '@/utils/auth.utils';
import { ROUTES } from '@/routes';
import Sidebar from './Sidebar';
import './MainLayout.css';

const { Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine current page for breadcrumbs
    const currentPath = location.pathname;
    const currentMenuItem = SIDEBAR_MENU_ITEMS.find(item => item.key === currentPath);
    const pageLabel = currentMenuItem ? currentMenuItem.label : 'Dashboard';

    const handleLogout = () => {
        setAuthPersistence(false);
        navigate(ROUTES.LOGIN, { replace: true });
    };

    // Auto-collapse sidebar when entering the Designer route
    React.useEffect(() => {
        const isDesigner = location.pathname.includes('/design');
        if (isDesigner) {
            setCollapsed(true);
        } else {
            // Optional: Expand when leaving designer? 
            // The user only asked to collapse when clicking build.
            // setCollapsed(false); 
        }
    }, [location.pathname]);

    const isDesigner = location.pathname.includes('/design');

    return (
        <div className="main-layout">
            <Sidebar 
                collapsed={collapsed} 
                onToggle={() => setCollapsed(!collapsed)} 
                onLogout={handleLogout} 
            />

            <main className={`main-layout__main ${isDesigner ? 'is-designer' : ''}`}>
                {!isDesigner && (
                    <header className="main-layout__header">
                        <div className="header-meta">
                            <Breadcrumb
                                items={[
                                    {
                                        href: '/',
                                        title: (
                                            <>
                                                <HomeOutlined />
                                                <span>Home</span>
                                            </>
                                        ),
                                    },
                                    {
                                        title: pageLabel,
                                    },
                                ]}
                            />
                        </div>
                    </header>
                )}
                
                <Content className="main-layout__content">
                    {children}
                </Content>
            </main>
        </div>
    );
}
