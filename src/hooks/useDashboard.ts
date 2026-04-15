import { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { engineService, fetchSkills } from '@/services';
import type { DashboardCounts, Skill } from '@/interfaces';
import { formatDashboardMetrics, filterActivitiesByQuery } from '@/utils/dashboard.helpers';

/**
 * Custom hook to manage all dashboard-related state and data fetching.
 */
export const useDashboard = (pageSize = 50) => {
    const [counts, setCounts] = useState<DashboardCounts | null>(null);
    const [recentSkills, setRecentSkills] = useState<Skill[]>([]);
    const [totalActivities, setTotalActivities] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [countsData, skillsData] = await Promise.all([
                engineService.getCounts(),
                fetchSkills({ pageSize })
            ]);
            setCounts(countsData);
            setRecentSkills(skillsData.data);
            setTotalActivities(skillsData.total);
        } catch (err: any) {
            message.error(err.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [pageSize]);

    const filteredSkills = useMemo(() => {
        const filtered = filterActivitiesByQuery(recentSkills, searchQuery);
        console.log('--- DASHBOARD DATA DEBUG ---');
        console.log('Total Recent Skills:', recentSkills.length);
        console.log('Recent Skills Data:', recentSkills);
        console.log('Filtered Skills Data:', filtered);
        console.log('----------------------------');
        return filtered;
    }, [recentSkills, searchQuery]);

    const metricsData = useMemo(() => {
        return formatDashboardMetrics(counts);
    }, [counts]);

    return {
        counts,
        recentSkills,
        totalActivities,
        searchQuery,
        setSearchQuery,
        isLoading,
        filteredSkills,
        metricsData,
        refresh: loadData
    };
};
