/**
 * Mock Connector Instances seed data.
 * Represents pre-configured connections to external systems.
 */

import type { ConnectorInstance } from '@/interfaces';

export const MOCK_CONNECTORS: ConnectorInstance[] = [
    {
        id: 'conn-001',
        name: 'Acme PM System',
        connectorType: 'practice_management',
        clientId: 'client-acme',
        environment: 'prod',
        secretRef: 'vault://acme/pm-api-key',
    },
    {
        id: 'conn-002',
        name: 'Acme PM System (Dev)',
        connectorType: 'practice_management',
        clientId: 'client-acme',
        environment: 'dev',
        secretRef: 'vault://acme/pm-api-key-dev',
    },
    {
        id: 'conn-003',
        name: 'Availity Clearinghouse',
        connectorType: 'clearinghouse',
        clientId: 'client-acme',
        environment: 'prod',
        secretRef: 'vault://acme/availity-key',
    },
    {
        id: 'conn-004',
        name: 'UHC Payer Portal',
        connectorType: 'payer_portal',
        clientId: 'client-acme',
        environment: 'prod',
        secretRef: 'vault://acme/uhc-portal-creds',
    },
    {
        id: 'conn-005',
        name: 'Twilio SMS Gateway',
        connectorType: 'sms_provider',
        clientId: 'client-acme',
        environment: 'prod',
        secretRef: 'vault://acme/twilio-key',
    },
    {
        id: 'conn-006',
        name: 'Summit PM System',
        connectorType: 'practice_management',
        clientId: 'client-summit',
        environment: 'prod',
        secretRef: 'vault://summit/pm-api-key',
    },
    {
        id: 'conn-007',
        name: 'BCBS Eligibility API',
        connectorType: 'eligibility_api',
        clientId: 'client-acme',
        environment: 'prod',
        secretRef: 'vault://acme/bcbs-elig-key',
    },
    {
        id: 'conn-008',
        name: 'eFax Gateway',
        connectorType: 'fax_provider',
        clientId: 'client-acme',
        environment: 'prod',
        secretRef: 'vault://acme/efax-key',
    },
];
