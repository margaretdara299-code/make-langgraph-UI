/**
 * Represents a Skill Category fetched from the backend.
 */
export interface Category {
    categoryId: number;
    name: string;
    description?: string;
    icon?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** Props for components that display or manage categories */
export interface CategoryCardProps {
    category: Category;
    onAction?: (actionKey: string, categoryId: number) => void;
}

export interface CreateCategoryModalProps {
    isOpen: boolean;
    categoryToEdit?: Category | null;
    onClose: () => void;
    onCreated: () => void;
}
