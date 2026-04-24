import * as icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

/**
 * Converts a kebab-case string to PascalCase.
 * e.g., 'user-check' -> 'UserCheck'
 */
const kebabToPascal = (str: string) => {
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};

export interface IconRendererProps extends Omit<LucideProps, 'ref'> {
    /** The string name from the backend (e.g., 'brain', 'user-check') */
    iconName?: string;
    /** Fallback icon to display if the name is missing or invalid */
    fallback?: React.ReactNode;
}

/**
 * Dynamically renders a Lucide React icon based on a string name.
 */
export default function IconRenderer({ iconName, fallback = <icons.HelpCircle size={18} />, ...props }: IconRendererProps) {
    if (!iconName) {
        return <>{fallback}</>;
    }

    const pascalName = kebabToPascal(iconName);
    const IconComponent = (icons as any)[iconName] || (icons as any)[pascalName];

    if (!IconComponent) {
        // Fallback if the icon name doesn't exist in the lucide-react library
        return <>{fallback}</>;
    }

    return <IconComponent {...props} />;
}
