/**
 * http.service.ts — Centralized HTTP client for the Tensaw Skills Studio API.
 *
 * Uses Axios and provides:
 *  - A pre-configured Axios instance with `baseURL`
 *  - `snakeToCamel` / `camelToSnake` — recursive key transformers
 *  - Automatic response unwrapping from the backend envelope `{ status, message, data }`
 *
 * The backend envelope format is: { status: boolean, message: string, data: T }
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ══════════════════════════════════════════════════
//  KEY TRANSFORMERS
// ══════════════════════════════════════════════════

/** Convert a snake_case string to camelCase. */
function snakeKeyToCamel(key: string): string {
    return key.replace(/_([a-z0-9])/gi, (_, char) => char.toUpperCase());
}

/** Convert a camelCase string to snake_case. */
function camelKeyToSnake(key: string): string {
    return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

/** Recursively transform all keys of an object/array from snake_case to camelCase. */
export function snakeToCamel<T>(data: unknown): T {
    if (Array.isArray(data)) {
        return data.map((item) => snakeToCamel(item)) as T;
    }
    if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
        const transformed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            transformed[snakeKeyToCamel(key)] = snakeToCamel(value);
        }
        return transformed as T;
    }
    return data as T;
}

/** Recursively transform all keys of an object/array from camelCase to snake_case. */
export function camelToSnake<T>(data: unknown): T {
    if (Array.isArray(data)) {
        return data.map((item) => camelToSnake(item)) as T;
    }
    if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
        const transformed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            transformed[camelKeyToSnake(key)] = camelToSnake(value);
        }
        return transformed as T;
    }
    return data as T;
}

// ══════════════════════════════════════════════════
//  AXIOS INSTANCE
// ══════════════════════════════════════════════════

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// ── Response Interceptor: unwrap envelope + transform keys ──
axiosInstance.interceptors.response.use(
    (response) => {
        const envelope = response.data;
        // Backend always sends { status, message, data }
        if (envelope && typeof envelope.status === 'boolean') {
            if (!envelope.status) {
                return Promise.reject(new Error(envelope.message || 'API request failed'));
            }
            // Unwrap and transform the data payload
            response.data = snakeToCamel(envelope.data);
        }
        return response;
    },
    (error) => {
        // Extract error message from backend envelope if available
        const detail = error.response?.data?.detail;
        if (detail) {
            const message = typeof detail === 'string' ? detail : detail.message || 'API error';
            return Promise.reject(new Error(message));
        }
        return Promise.reject(error);
    },
);

// ── Request Interceptor: transform keys to snake_case ──
axiosInstance.interceptors.request.use((config) => {
    if (config.data && typeof config.data === 'object') {
        config.data = camelToSnake(config.data);
    }
    return config;
});

// ══════════════════════════════════════════════════
//  PUBLIC API CLIENT
// ══════════════════════════════════════════════════

export const apiClient = {
    get: <T>(path: string) => axiosInstance.get<T>(path).then((r) => r.data),
    post: <T>(path: string, body?: unknown) => axiosInstance.post<T>(path, body).then((r) => r.data),
    put: <T>(path: string, body?: unknown) => axiosInstance.put<T>(path, body).then((r) => r.data),
    patch: <T>(path: string, body?: unknown) => axiosInstance.patch<T>(path, body).then((r) => r.data),
    delete: <T>(path: string) => axiosInstance.delete<T>(path).then((r) => r.data),
};
