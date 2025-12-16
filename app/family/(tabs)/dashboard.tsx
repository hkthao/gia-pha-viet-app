import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, useTheme, ActivityIndicator, Card, Appbar, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL, SPACING_LARGE } from '@/constants/dimensions';
import { useRouter } from 'expo-router'; // Import useRouter
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { PieChart, BarChart } from 'react-native-chart-kit'; // Re-add PieChart, BarChart
import { ProfileCard, DetailedInfoCard } from '@/components/family'; // Re-add ProfileCard, DetailedInfoCard
import { MetricCard } from '@/components/common'; // Re-add MetricCard
import { useGetDashboardDataQuery } from '@/hooks/dashboard/useDashboardQuery'; // Import useGetDashboardDataQuery
import { useFamilyDashboardChartsData } from '@/hooks/dashboard/useFamilyDashboardChartsData'; // Import the new hook
import { useFamilyDetails } from '@/hooks/family/useFamilyDetails';
import { useGetFamilyByIdQuery } from '@/hooks/family/useFamilyQueries'; // Import useGetFamilyByIdQuery

export default function FamilyDashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter(); // Initialize useRouter
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);

  const { data: family, isLoading: familyLoading, error: familyError } = useGetFamilyByIdQuery(currentFamilyId || '', !!currentFamilyId);
  const { data: dashboardData, isLoading: loadingDashboard, error: errorDashboard } = useGetDashboardDataQuery(currentFamilyId || '');

  const { generationsData, translatedGenderDistribution } = useFamilyDashboardChartsData(dashboardData);

  const {
    canEditOrDelete,
    handleEditFamily,
    handleDeleteFamily,
  } = useFamilyDetails(); // Use the hook to get edit/delete logic

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: SPACING_MEDIUM,
      paddingBottom: SPACING_MEDIUM * 4, // Add padding for FAB to not overlap content
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
    deleteButton: {
      marginBottom: SPACING_LARGE,
      backgroundColor: theme.colors.error,
      borderRadius: theme.roundness,
    },
    deleteButtonLabel: {
      color: theme.colors.onError,
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

  const isLoading = familyLoading || loadingDashboard;
  const hasError = familyError || errorDashboard;
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
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={family.name || t('familyDetail.title')} />
        {canEditOrDelete && (
          <Appbar.Action icon="pencil" onPress={handleEditFamily} />
        )}
      </Appbar.Header>
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

        {canEditOrDelete && (
          <Button
            mode="contained"
            onPress={handleDeleteFamily}
            style={styles.deleteButton}
            labelStyle={styles.deleteButtonLabel}
          >
            {t('common.delete')}
          </Button>
        )}
      </ScrollView>
    </View>
  );
}
