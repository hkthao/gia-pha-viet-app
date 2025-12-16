import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardMetrics } from '@/types/dashboard';

interface GenderDistributionItem {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export interface UseFamilyDashboardChartsDataResult {
  generationsData: { generation: number; members: number }[];
  translatedGenderDistribution: GenderDistributionItem[];
}

export function useFamilyDashboardChartsData(dashboardData: DashboardMetrics | undefined): UseFamilyDashboardChartsDataResult {
  const { t } = useTranslation();

  const generationsData = useMemo(() => {
    if (!dashboardData?.membersPerGeneration) {
      return [];
    }
    return Object.keys(dashboardData.membersPerGeneration)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(generation => ({
        generation: parseInt(generation),
        members: dashboardData.membersPerGeneration[parseInt(generation)],
      }));
  }, [dashboardData]);

  const translatedGenderDistribution = useMemo(() => {
    if (!dashboardData?.genderDistribution) {
      return [];
    }
    return dashboardData.genderDistribution.map((item: GenderDistributionItem) => ({
      ...item,
      name: item.name === 'Male' ? t('common.male') : (item.name === 'Female' ? t('common.female') : item.name),
      color: item.name === 'Male' ? '#ADD8E6' : (item.name === 'Female' ? '#FFC0CB' : '#D3D3D3'),
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }));
  }, [dashboardData, t]);

  return {
    generationsData,
    translatedGenderDistribution,
  };
}
