/**
 * Constants for the Skills Library page.
 */

import {
    EditOutlined,
    CheckCircleOutlined,
    FileAddOutlined,
    CopyOutlined,
    RobotOutlined,
    BulbOutlined,
} from '@ant-design/icons';

export const STATUS_FILTER_OPTIONS = [
    { key: 'all', label: 'All Skills', icon: BulbOutlined },
    { key: 'draft', label: 'Draft', icon: EditOutlined },
    { key: 'published', label: 'Published', icon: CheckCircleOutlined },
] as const;

/** Icon mapping for sidebar status filter items */
export const STATUS_ICONS = {
    all: BulbOutlined,
    draft: EditOutlined,
    published: CheckCircleOutlined,
};

export const SKILLS_PAGE_SIZE = 12;


/** Creation method cards for Step 2 of the wizard */
export const CREATION_METHODS = [
    {
        key: 'scratch',
        title: 'From Scratch',
        description: 'Start with an empty canvas and build your skill step by step.',
    },
    {
        key: 'template',
        title: 'From Template',
        description: 'Choose from pre-built templates to accelerate development.',
    },
    {
        key: 'ai',
        title: 'AI-Generated',
        description: 'Describe what you need and let AI create the initial skill for you.',
    },
] as const;

/** Steps for the Create Skill wizard */
export const WIZARD_STEPS = [
    { title: 'Skill Details' },
    { title: 'Creation Method' },
];

/** Icon mapping for creation method cards */
export const METHOD_ICONS = {
    scratch: FileAddOutlined,
    template: CopyOutlined,
    ai: RobotOutlined,
};

export const CARD_ACTION_KEYS = {
    BUILD_SKILL: 'build_skill',
    EDIT_SETTINGS: 'edit_settings',
    TEST: 'test',
    PUBLISH: 'publish',
    UNPUBLISH: 'unpublish',
    DELETE: 'delete',
} as const;
