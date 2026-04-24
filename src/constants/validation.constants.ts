/**
 * Centralized validation messages for the Tensaw Studio UI.
 */
export const VALIDATION_MESSAGES = {
    REQUIRED: (field: string) => `${field} is required`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) => `${field} must not exceed ${max} characters`,
    INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
    ALREADY_EXISTS: (field: string) => `${field} already exists`,
};

export const GROUP_VALIDATION = {
    NAME_REQUIRED: VALIDATION_MESSAGES.REQUIRED('Group Name'),
    KEY_REQUIRED: VALIDATION_MESSAGES.REQUIRED('Group Key'),
};

export const VARIABLE_VALIDATION = {
    NAME_REQUIRED: VALIDATION_MESSAGES.REQUIRED('Variable Name'),
    KEY_REQUIRED: VALIDATION_MESSAGES.REQUIRED('Variable Key'),
    VALUE_REQUIRED: VALIDATION_MESSAGES.REQUIRED('Variable Value'),
};
