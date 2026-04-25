import './PremiumCard.css';

// ✅ BEST PRACTICE (The Goal)
// 1. Semantic HTML (div, span) for a clean DOM
// 2. All styles extracted to PremiumCard.css
// 3. BEM-style class naming (premium-card__header)
// 4. Dynamic styling uses CSS Custom Properties (--status-color) passed in style prop IF needed, otherwise plain classes.

export default function EliteCard({ statusColor = "var(--error)" }) {
    return (
        <div className="premium-card">
            <div className="premium-card__header">
                <div className="premium-card__title">Premium Title</div>
            </div>
            
            <div className="premium-card__body">
                <div className="premium-card__desc">This is some description text.</div>
            </div>
            
            <div className="premium-card__footer">
               <span 
                 className="premium-card__badge" 
                 style={{ '--badge-bg': statusColor } as React.CSSProperties}
               >
                   Error
                </span>
            </div>
        </div>
    );
}
