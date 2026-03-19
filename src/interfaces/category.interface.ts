/**
 * Represents a Skill Category fetched from the backend.
 */
export interface Category {
    id?: number;
    categoryId: number;
    name: string;
    description?: string;
    [key: string]: any; // Catch-all for extra backend properties
}
