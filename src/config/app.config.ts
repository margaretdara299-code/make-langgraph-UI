/**
 * Application configuration.
 * Environment-specific settings and feature flags.
 */

export const appConfig = {
    /** Application name displayed in the UI */
    appName: 'Tensaw Skills Studio',

    /** Default environment for new skills */
    defaultEnvironment: 'dev' as const,

    /** Default page size for listings */
    defaultPageSize: 12,

    /** Feature flags — toggle features during development */
    features: {
        enableTestRun: false,
        enablePublish: false,
        enableMonitoringTab: false,
        enableActionCatalog: false,
    },
} as const;
