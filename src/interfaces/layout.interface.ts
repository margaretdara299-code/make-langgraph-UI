/**
 * Layout-related TypeScript interfaces.
 */

import type { ReactNode } from 'react';

export interface MainLayoutProps {
    children: ReactNode;
}

export interface SidebarFooterProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    onLogout: () => void;
}
