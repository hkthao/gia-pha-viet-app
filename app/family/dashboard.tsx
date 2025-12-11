import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, useTheme, ActivityIndicator, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useFamilyListStore } from '@/stores/useFamilyListStore';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { ProfileCard, DetailedInfoCard } from '@/components/family';
import { MetricCard } from '@/components/common';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useFamilyDashboardChartsData } from '@/hooks/dashboard/useFamilyDashboardChartsData'; // Import the new hook

export default function FamilyDashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const { item: family, loading, error, getById: getFamilyById } = useFamilyListStore();
  const { dashboardData, loading: loadingDashboard, error: errorDashboard, getDashboardData } = useDashboardStore();

  const { generationsData, translatedGenderDistribution } = useFamilyDashboardChartsData(dashboardData);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: SPACING_MEDIUM,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING_MEDIUM,
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: SPACING_MEDIUM,
    },
    metricCard: {
      width: '48%',
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      elevation: 2,
    },
    metricCardContent: {
      alignItems: 'center',
      paddingVertical: SPACING_MEDIUM,
    },
    metricIcon: {
      marginBottom: SPACING_SMALL,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: SPACING_SMALL / 2,
    },
    metricLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    chartCard: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      elevation: 2,
    },
    chartCardContent: {
      padding: SPACING_MEDIUM,
      paddingBottom: SPACING_MEDIUM * 2,
    },
    chartTitle: {
      marginBottom: SPACING_SMALL,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
    },
    chartContainer: {
      alignItems: 'center',
      paddingVertical: SPACING_MEDIUM,
    },
    barChartLabel: {
      color: theme.colors.onSurface,
    },
  }), [theme]);

  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (_ = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    fillShadowGradient: theme.colors.primary,
    fillShadowGradientOpacity: 0.5
  };

  useEffect(() => {
    const loadData = async () => {
      if (!currentFamilyId) {
        return;
      }
      await getFamilyById(currentFamilyId);
      await getDashboardData(currentFamilyId);
    };
    loadData();
  }, [currentFamilyId, getFamilyById, getDashboardData]);

  const isLoading = loading || loadingDashboard;
  const hasError = error || errorDashboard;
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>{hasError}</Text>
      </View>
    );
  }
  if (!family || !dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium">{t('common.error_occurred')}: {t('familyDetail.errors.dataNotAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileCard family={family} />
        <View style={styles.cardsContainer}>
          <MetricCard
            icon="account-multiple"
            value={dashboardData.totalMembers}
            label={t('familyDashboard.totalMembers')}
          />
          <MetricCard
            icon="link-variant"
            value={dashboardData.totalRelationships}
            label={t('familyDashboard.totalRelationships')}
          />
          <MetricCard
            icon="sitemap"
            value={dashboardData.totalGenerations}
            label={t('familyDashboard.totalGenerations')}
          />
          <MetricCard
            icon="account-clock"
            value={dashboardData.averageAge}
            label={t('familyDashboard.averageAge')}
          />
          <MetricCard
            icon="heart-plus-outline"
            value={dashboardData.livingMembers}
            label={t('familyDashboard.livingMembers')}
          />
          <MetricCard
            icon="grave-stone"
            value={dashboardData.deceasedMembers}
            label={t('familyDashboard.deceasedMembers')}
          />
        </View>
        <DetailedInfoCard family={family} />
        <Card style={styles.chartCard}>
          <Card.Content style={styles.chartCardContent}>
            <Text variant="titleMedium" style={styles.chartTitle}>
              {t('familyDashboard.genderRatio')}
            </Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={translatedGenderDistribution}
                width={screenWidth - (SPACING_MEDIUM * 2)}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                hasLegend={true}
              />
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.chartCard}>
          <Card.Content style={styles.chartCardContent}>
            <Text variant="titleMedium" style={styles.chartTitle}>
              {t('familyDashboard.membersByGeneration')}
            </Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: generationsData.map(item => item.generation.toString()),
                  datasets: [
                    {
                      data: generationsData.map(item => item.members),
                    },
                  ],
                }}
                width={screenWidth - (SPACING_MEDIUM * 2)}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                  barPercentage: 0.7,
                  propsForLabels: {
                    fill: theme.colors.onSurface,
                  },
                }}
                verticalLabelRotation={30}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
