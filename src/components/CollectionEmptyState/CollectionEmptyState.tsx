import type { ReactNode } from 'react';
import './CollectionEmptyState.css';

interface CollectionEmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export default function CollectionEmptyState({
    icon,
    title,
    description,
    action,
    className,
}: CollectionEmptyStateProps) {
    const rootClassName = ['collection-empty-state', className].filter(Boolean).join(' ');

    return (
        <section className={rootClassName}>
            <div className="collection-empty-state__inner">
                <div className="collection-empty-state__icon-shell">{icon}</div>
                <h2 className="collection-empty-state__title">{title}</h2>
                <p className="collection-empty-state__description">{description}</p>
                {action ? <div className="collection-empty-state__actions">{action}</div> : null}
            </div>
        </section>
    );
}
