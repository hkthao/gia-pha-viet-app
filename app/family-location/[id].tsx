import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Text, useTheme, Card, ActivityIndicator, List, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useFamilyLocation } from '@/hooks/familyLocation/useFamilyLocationQueries';
import { LocationType, LocationAccuracy, LocationSource } from '@/types';

export default function FamilyLocationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const locationId = Array.isArray(id) ? id[0] : id;

  const { data: familyLocation, isLoading, error } = useFamilyLocation(locationId as string);

  const locationTypeStringMap: Record<LocationType, string> = useMemo(() => ({
    [LocationType.Home]: t('locationType.home'),
    [LocationType.Birthplace]: t('locationType.birthplace'),
    [LocationType.Deathplace]: t('locationType.deathplace'),
    [LocationType.Burial]: t('locationType.burial'),
    [LocationType.Other]: t('locationType.other'),
  }), [t]);

  const accuracyStringMap: Record<LocationAccuracy, string> = useMemo(() => ({
    [LocationAccuracy.Exact]: t('locationAccuracy.exact'),
    [LocationAccuracy.Approximate]: t('locationAccuracy.approximate'),
    [LocationAccuracy.Estimated]: t('locationAccuracy.estimated'),
  }), [t]);

  const sourceStringMap: Record<LocationSource, string> = useMemo(() => ({
    [LocationSource.UserSelected]: t('locationSource.userSelected'),
    [LocationSource.Geocoded]: t('locationSource.geocoded'),
  }), [t]);

  const handleEdit = useCallback(() => {
    router.push(`/family-location/${locationId}/edit`);
  }, [router, locationId]);

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
      padding: SPACING_MEDIUM,
      backgroundColor: theme.colors.errorContainer,
      marginBottom: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.onErrorContainer,
      textAlign: 'center',
    },
    card: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    detailsContainer: {
      width: '100%',
    },
    titleText: {
      marginBottom: SPACING_MEDIUM,
      textAlign: 'center',
    },
  }), [theme]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('familyLocation.detailTitle')} />
          <Appbar.Action icon="pencil" onPress={handleEdit} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('common.error_occurred')}: {error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!familyLocation) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('familyLocation.detailTitle')} />
          <Appbar.Action icon="pencil" onPress={handleEdit} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('familyLocation.errors.dataNotAvailable')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={familyLocation.name || t('familyLocation.detailTitle')} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
      </Appbar.Header>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.detailsContainer}>
              <Text variant="headlineSmall" style={styles.titleText}>{familyLocation.name || t('common.not_available')}</Text>
              {familyLocation.description && <Text variant="bodyMedium" >{familyLocation.description}</Text>}
            </View>

            <List.Section>
              <List.Item
                title={t('familyLocationForm.name')}
                description={familyLocation.name}
                left={() => <List.Icon icon="map-marker-account" />}
              />
              <Divider />

              {familyLocation.address && (
                <>
                  <List.Item
                    title={t('familyLocationForm.address')}
                    description={familyLocation.address}
                    left={() => <List.Icon icon="home-map-marker" />}
                  />
                  <Divider />
                </>
              )}

              {familyLocation.latitude !== undefined && (
                <>
                  <List.Item
                    title={t('familyLocationForm.latitude')}
                    description={familyLocation.latitude.toString()}
                    left={() => <List.Icon icon="latitude" />}
                  />
                  <Divider />
                </>
              )}

              {familyLocation.longitude !== undefined && (
                <>
                  <List.Item
                    title={t('familyLocationForm.longitude')}
                    description={familyLocation.longitude.toString()}
                    left={() => <List.Icon icon="longitude" />}
                  />
                  <Divider />
                </>
              )}

              <List.Item
                title={t('familyLocationForm.locationType')}
                description={locationTypeStringMap[familyLocation.locationType] || t('common.not_available')}
                left={() => <List.Icon icon="tag" />}
              />
              <Divider />

              <List.Item
                title={t('familyLocationForm.accuracy')}
                description={accuracyStringMap[familyLocation.accuracy] || t('common.not_available')}
                left={() => <List.Icon icon="crosshairs-gps" />}
              />
              <Divider />

              <List.Item
                title={t('familyLocationForm.source')}
                description={sourceStringMap[familyLocation.source] || t('common.not_available')}
                left={() => <List.Icon icon="database" />}
              />
              <Divider />

            </List.Section>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
