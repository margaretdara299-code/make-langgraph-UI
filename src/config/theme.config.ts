/**
 * Ant Design theme configuration.
 * Maps our brand design tokens to AntD's theme system.
 * This is the single source of truth for AntD theming.
 */

import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
    token: {
        // Brand colors
        colorPrimary: '#4f46e5',
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorInfo: '#4f46e5',

        // Text colors
        colorText: '#1e293b',
        colorTextSecondary: '#64748b',
        colorTextTertiary: '#94a3b8',

        // Surface colors
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f5f7fa',
        colorBorder: '#e2e8f0',
        colorBorderSecondary: '#f0f0f0',

        // Typography
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,

        // Borders
        borderRadius: 8,
        borderRadiusSM: 4,
        borderRadiusLG: 12,

        // Sizing
        controlHeight: 36,
    },
    components: {
        Layout: {
            siderBg: '#ffffff',
            headerBg: '#1a2332',
            headerHeight: 56,
            headerPadding: '0 24px',
            bodyBg: '#f5f7fa',
        },
        Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#dbeafe',
            itemSelectedColor: '#3b82f6',
            itemHoverBg: '#f5f7fa',
            itemColor: '#64748b',
            itemHeight: 40,
            iconSize: 16,
            itemBorderRadius: 8,
        },
        Card: {
            paddingLG: 24,
        },
        Button: {
            primaryShadow: 'none',
            defaultShadow: 'none',
            dangerShadow: 'none',
        },
    },
};
