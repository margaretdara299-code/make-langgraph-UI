/**
 * Common/shared interfaces used across features.
 */

export type UserRole = 'viewer' | 'editor' | 'publisher' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Standard envelope for all API client responses.
 * Matches the backend's { data: T, message: string } structure.
 */
export interface ApiClientResponse<T> {
    data: T;
    message: string;
}


export interface SelectOption {
    value: string;
    label: string;
}

export interface ConnectorInstance {
    id: string;
    name: string;
    connectorType: string;
    clientId: string;
    environment: string;
    secretRef: string;
}
