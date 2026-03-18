/**
 * Application-wide constants.
 */

/** Skill-related constants */
export const SKILL_KEY_PATTERN = /^[A-Z][A-Z0-9]{1,7}$/;
export const SKILL_NAME_MIN_LENGTH = 3;
export const SKILL_NAME_MAX_LENGTH = 80;
export const SKILL_DESCRIPTION_MAX_LENGTH = 240;
export const SKILL_TAGS_MAX_COUNT = 10;
export const SKILL_TAG_MAX_LENGTH = 24;

/** Action-related constants */
export const ACTION_KEY_PATTERN = /^[a-z][a-z0-9.]*$/;
export const ACTION_DESCRIPTION_MAX_LENGTH = 400;

/** Skill statuses */
export const SKILL_STATUSES = ['draft', 'published', 'archived'] as const;

/** Action capabilities */
export const ACTION_CAPABILITIES = ['api', 'ai', 'rpa', 'human', 'rules'] as const;

/** Action categories */
export const ACTION_CATEGORIES = [
    'Eligibility',
    'Denials',
    'Coding',
    'Auth',
    'Documents',
    'Messaging',
    'RPA',
    'Human Tasks',
] as const;

/** Environments */
export const ENVIRONMENTS = ['dev', 'staging', 'prod'] as const;

/** User roles */
export const USER_ROLES = ['viewer', 'editor', 'publisher', 'admin'] as const;

/** Pagination */
export const DEFAULT_PAGE_SIZE = 12;
