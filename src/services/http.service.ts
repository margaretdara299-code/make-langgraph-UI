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

import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { ApiClientResponse } from "@/interfaces";

// const API_BASE_URL = "http://10.10.11.110:8000";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


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

/**
 * Recursively transform all keys of an object/array from snake_case to camelCase.
 * Skips recursion for JSON blob fields to preserve internal schemas.
 */
export function snakeToCamel<T>(data: unknown): T {
  if (Array.isArray(data)) {
    return data.map((item) => snakeToCamel(item)) as T;
  }
  if (data !== null && typeof data === "object" && !(data instanceof Date)) {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      const newKey = snakeKeyToCamel(key);
      // Skip recursion if the key indicates it's a JSON blob (configurations_json, nodes, edges, connections, etc.)
      const isJsonBlob =
        key.endsWith("_json") || key === "nodes" || key === "edges" || key === "connections";
      transformed[newKey] = isJsonBlob ? value : snakeToCamel(value);
    }
    return transformed as T;
  }
  return data as T;
}

/**
 * Recursively transform all keys of an object/array from camelCase to snake_case.
 * Skips recursion for JSON blob fields to preserve internal schemas.
 */
export function camelToSnake<T>(data: unknown): T {
  if (Array.isArray(data)) {
    return data.map((item) => camelToSnake(item)) as T;
  }
  if (data !== null && typeof data === "object" && !(data instanceof Date)) {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      const newKey = camelKeyToSnake(key);
      // Skip recursion if the key indicates it's a JSON blob (configurationsJson, nodes, edges, connections, etc.)
      const isJsonBlob =
        key.endsWith("Json") || key === "nodes" || key === "edges" || key === "connections";
      transformed[newKey] = isJsonBlob ? value : camelToSnake(value);
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
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Response Interceptor: unwrap envelope + transform keys ──
axiosInstance.interceptors.response.use(
  (response) => {
    const envelope = response.data;
    // Backend always sends { status, message, data }
    if (envelope && typeof envelope.status === "boolean") {
      if (!envelope.status) {
        return Promise.reject(
          new Error(envelope.message || "API request failed"),
        );
      }
      // Unwrap and transform the data payload
      const transformedData = snakeToCamel(envelope.data);
      response.data = {
        data: transformedData,
        message: envelope.message || "Success",
      };
    }
    return response;
  },
  (error) => {
    // Extract error message from backend envelope if available
    const detail = error.response?.data?.detail;
    if (detail) {
      const message =
        typeof detail === "string" ? detail : detail.message || "API error";
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

// ── Request Interceptor: transform keys to snake_case ──
axiosInstance.interceptors.request.use((config) => {
  if (config.data && typeof config.data === "object") {
    config.data = camelToSnake(config.data);
  }
  return config;
});

// ══════════════════════════════════════════════════
//  PUBLIC API CLIENT
// ══════════════════════════════════════════════════

export const apiClient = {
  get: <T>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> =>
    axiosInstance.get(path, config).then((r) => r.data),
  post: <T>(
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> =>
    axiosInstance.post(path, body, config).then((r) => r.data),
  put: <T>(
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> =>
    axiosInstance.put(path, body, config).then((r) => r.data),
  patch: <T>(
    path: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> =>
    axiosInstance.patch(path, body, config).then((r) => r.data),
  delete: <T>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiClientResponse<T>> =>
    axiosInstance.delete(path, config).then((r) => r.data),
};
