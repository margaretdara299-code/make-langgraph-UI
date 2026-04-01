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
};
