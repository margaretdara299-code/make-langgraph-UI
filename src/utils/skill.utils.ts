/**
 * Skill-related utility functions.
 */

import {
    SKILL_KEY_PATTERN,
    SKILL_NAME_MIN_LENGTH,
    SKILL_NAME_MAX_LENGTH,
    SKILL_DESCRIPTION_MAX_LENGTH,
    SKILL_TAGS_MAX_COUNT,
    SKILL_TAG_MAX_LENGTH,
} from '@/constants';

/** Validates a skill name against length constraints. */
export function validateSkillName(name: string): string | null {
    if (!name.trim()) return 'Skill name is required.';
    if (name.length < SKILL_NAME_MIN_LENGTH)
        return `Skill name must be at least ${SKILL_NAME_MIN_LENGTH} characters.`;
    if (name.length > SKILL_NAME_MAX_LENGTH)
        return `Skill name must be at most ${SKILL_NAME_MAX_LENGTH} characters.`;
    return null;
}

/** Validates a skill key against the required pattern. */
export function validateSkillKey(key: string): string | null {
    if (!key.trim()) return 'Skill key is required.';
    if (!SKILL_KEY_PATTERN.test(key))
        return 'Skill key must be 2-8 uppercase alphanumeric characters, starting with a letter.';
    return null;
}

/** Validates a skill description. */
export function validateSkillDescription(description: string): string | null {
    if (description.length > SKILL_DESCRIPTION_MAX_LENGTH)
        return `Description must be at most ${SKILL_DESCRIPTION_MAX_LENGTH} characters.`;
    return null;
}

/** Validates tags array. */
export function validateSkillTags(tags: string[]): string | null {
    if (tags.length > SKILL_TAGS_MAX_COUNT) return `Maximum ${SKILL_TAGS_MAX_COUNT} tags allowed.`;
    const longTag = tags.find((t) => t.length > SKILL_TAG_MAX_LENGTH);
    if (longTag) return `Tag "${longTag}" exceeds ${SKILL_TAG_MAX_LENGTH} characters.`;
    return null;
}

/** Auto-generates a skill key suggestion from a skill name. */
export function suggestSkillKey(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 8);
}
