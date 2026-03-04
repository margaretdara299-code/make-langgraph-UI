/**
 * Component Props interfaces.
 * These are thin wrappers — our components delegate to AntD internally,
 * but the app code interacts with our own typed props for consistency.
 */

import type { ReactNode } from 'react';

export interface StatusPillProps {
    status: 'draft' | 'published' | 'archived';
}

export interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    hoverable?: boolean;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}
