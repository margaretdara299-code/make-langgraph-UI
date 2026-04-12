import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';
import type { DashboardCounts } from '@/interfaces';

export const engineService = {
    /**
     * Fetch aggregated totals and counts for the dashboard map
     */
    getCounts: async (): Promise<DashboardCounts> => {
        const response = await apiClient.get<DashboardCounts>(API_ENDPOINTS.ENGINE.COUNTS);
        return response.data;
    },
    
    /**
     * Executes the skill workflow and retrieves the full monolithic response (logs, node states).
     */
    runSkillWorkflow: async (versionId: string, initialData?: Record<string, any>): Promise<any> => {
        /**
         * apiClient.post returns the unwrapped data from the response interceptor:
         * { data: transformedPayload, message: string }
         */
        return apiClient.post<any>(API_ENDPOINTS.ENGINE.RUN(versionId), initialData || {});
    },
};
