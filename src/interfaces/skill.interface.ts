/**
 * Skill-related TypeScript interfaces.
 * Defines the shape of Skill, SkillVersion, and related entities.
 */

export interface Skill {
    id: string;
    name: string;
    skillKey: string;
    description: string;
    category: string;
    clientId: string;
    payerId?: string;
    owner: string;
    tags: string[];
    status: SkillStatus;
    environment: Environment;
    createdAt: string;
    updatedAt: string;
    updatedBy: string;
}

export interface SkillVersion {
    id: string;
    skillId: string;
    version: string;
    status: SkillVersionStatus;
    environment: Environment;
    compiledSkillJson?: string;
    compileHash?: string;
    createdAt: string;
    updatedAt: string;
}

export type SkillStatus = 'draft' | 'published' | 'archived';
export type SkillVersionStatus = 'draft' | 'published' | 'archived';
export type Environment = 'dev' | 'staging' | 'prod';

export interface UseSkillsFilters {
    status?: string;
    category?: string;
    clientId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface UseSkillsReturn {
    skills: Skill[];
    total: number;
    page: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    setFilters: (filters: UseSkillsFilters) => void;
}
