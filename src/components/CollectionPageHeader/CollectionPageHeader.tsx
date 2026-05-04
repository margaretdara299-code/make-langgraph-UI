import type { ReactNode } from 'react';
import './CollectionPageHeader.css';

interface CollectionPageHeaderProps {
    title: string;
    description: string;
    action?: ReactNode;
    aside?: ReactNode;
    bottom?: ReactNode;
    className?: string;
}

export default function CollectionPageHeader({
    title,
    description,
    action,
    aside,
    bottom,
    className,
}: CollectionPageHeaderProps) {
    const headerClassName = ['collection-page-header', className].filter(Boolean).join(' ');

    return (
        <header className={headerClassName}>
            <div className="collection-page-header__top">
                <div className="collection-page-header__title-block">
                    <div className="collection-page-header__title-row">
                        <h1 className="collection-page-header__title">{title}</h1>
                        {action ? <div className="collection-page-header__action">{action}</div> : null}
                    </div>
                    <p className="collection-page-header__description">{description}</p>
                </div>
                {aside ? <div className="collection-page-header__aside">{aside}</div> : null}
            </div>
            {bottom ? <div className="collection-page-header__bottom">{bottom}</div> : null}
        </header>
    );
}
