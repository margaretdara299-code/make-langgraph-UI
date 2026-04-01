/**
 * Engine-related interfaces.
 */

export interface DashboardCounts {
    actions: {
        total: number;
        active: number;
        inactive: number;
        published: number;
        draft: number;
    };
    skills: {
        total: number;
        active: number;
        inactive: number;
        publishedVersions: number;
        draftVersions: number;
    };
}
