/**
 * Main application layout — wraps all pages with the global nav shell.
 * Contains the top navigation bar and renders child routes.
 */

import './MainLayout.css';
import type { MainLayoutProps } from '@/interfaces';

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="main-layout">
            <header className="main-layout__header">
                <div className="main-layout__logo">
                    <span className="main-layout__logo-icon">⬡</span>
                    <span className="main-layout__logo-text">
                        <strong>Tensaw</strong> Skills Studio
                    </span>
                </div>

                <div className="main-layout__search">
                    <input
                        type="text"
                        placeholder="Search Skills, Cases, Workflows..."
                        className="main-layout__search-input"
                    />
                </div>

                <div className="main-layout__actions">
                    <span className="main-layout__env-badge">Dev</span>
                    <span className="main-layout__user-avatar">👤</span>
                </div>
            </header>

            <main className="main-layout__content">{children}</main>
        </div>
    );
}
