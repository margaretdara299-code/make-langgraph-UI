/**
 * Represents a Skill Category fetched from the backend.
 */
export interface Category {
    category_id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
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
