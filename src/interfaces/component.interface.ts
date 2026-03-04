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

export interface SkillCardProps {
    skill: import('./skill.interface').Skill;
    onClick?: () => void;
}

export interface StatusFilterItemProps {
    filterKey: string;
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}

export interface CreateSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export interface CreateSkillFormData {
    name: string;
    skillKey: string;
    description: string;
    category: string;
    tags: string[];
    creationMethod: string;
}

export interface SkillDetailsFormProps {
    form: import('antd').FormInstance<CreateSkillFormData>;
}

export interface CreationMethodCardProps {
    methodKey: string;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export interface CreateSkillFooterProps {
    currentStep: number;
    isSubmitting: boolean;
    onBack: () => void;
    onNext: () => void;
    onCreate: () => void;
}
