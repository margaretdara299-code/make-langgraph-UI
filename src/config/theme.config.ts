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
        fontSize: 'var(--text-base)',

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

export const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: '#B39CD0',     /* Lavender CTA */
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorError: '#FFC1CC',       /* Soft Pink */
        colorInfo: '#A8DADC',        /* Light Cyan */
        colorText: '#E4E4E4',        /* Light Gray */
        colorTextSecondary: '#A3A3A3',
        colorTextTertiary: '#7A7A7A',
        colorBgContainer: '#363636', /* Elevated Surface */
        colorBgLayout: '#2C2C2C',    /* Slate Gray Base */
        colorBgSpotlight: '#404040',
        colorBorder: '#4a4a4a',
        colorBorderSecondary: 'rgba(228, 228, 228, 0.05)',
        colorBgElevated: '#404040',  /* Modal/Dropdown Backgrounds */
    },
    components: {
        Layout: {
            siderBg: '#2C2C2C',
            headerBg: 'rgba(44, 44, 44, 0.85)',
            bodyBg: '#2C2C2C',
        },
        Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'rgba(179, 156, 208, 0.15)',
            itemSelectedColor: '#B39CD0',
            itemHoverBg: 'rgba(228, 228, 228, 0.05)',
            itemColor: '#A3A3A3',
        },
        Button: {
            defaultBg: '#363636',
            defaultBorderColor: 'rgba(228, 228, 228, 0.15)',
            defaultColor: '#E4E4E4',
        },
        Card: {
            colorBgContainer: '#363636',
            colorBorderSecondary: 'transparent',
        },
        Table: {
            headerBg: '#363636',
            headerColor: '#A3A3A3',
            colorBgContainer: '#363636',
            borderColor: 'rgba(228, 228, 228, 0.05)',
        },
        Modal: {
            contentBg: '#363636',
            headerBg: '#363636',
            titleColor: '#E4E4E4',
        }
    },
};

