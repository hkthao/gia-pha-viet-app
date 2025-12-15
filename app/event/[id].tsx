import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Text, useTheme, Card, ActivityIndicator, Chip, Avatar, List } from 'react-native-paper'; // Add List
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL, SPACING_LARGE } from '@/constants/dimensions'; // Add SPACING_LARGE
import { eventService } from '@/services'; // Import eventService
import { EventType, MemberListDto } from '@/types'; // Import EventType from admin types
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { getAvatarSource } from '@/utils/imageUtils'; // Add getAvatarSource

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const eventId = Array.isArray(id) ? id[0] : id;

  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error(t('eventDetail.errors.noEventId'));
      }
      const result = await eventService.getById(eventId);
      if (result.isSuccess) {
        return result.value;
      } else {
        throw new Error(result.error?.message || t('eventDetail.errors.fetchError'));
      }
    },
    enabled: !!eventId, // Only run query if eventId is available
  });

  const eventTypeStringMap: Record<EventType, string> = useMemo(() => ({
    [EventType.Birth]: t('eventType.birth'),
    [EventType.Death]: t('eventType.death'),
    [EventType.Marriage]: t('eventType.marriage'),
    [EventType.Anniversary]: t('eventType.anniversary'),
    [EventType.Other]: t('eventType.other'),
  }), [t]);

  const eventTypeIconMap: Record<EventType, string> = {
    [EventType.Birth]: 'cake-variant',
    [EventType.Death]: 'cross',
    [EventType.Marriage]: 'ring',
    [EventType.Anniversary]: 'calendar-heart',
    [EventType.Other]: 'information',
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    appbar: {
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
    errorText: {
      color: theme.colors.onErrorContainer,
      textAlign: 'center',
    },
    card: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    profileCardContent: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: SPACING_MEDIUM,
    },
    titleText: {
      marginBottom: SPACING_SMALL,
      textAlign: 'center',
    },
    // Removed old chipsContainer, chip styles
    listSection: {
      paddingHorizontal: SPACING_MEDIUM,
    },
    accordion: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
    },
    accordionTitle: {
      fontWeight: 'bold',
    },
    accordionContentItem: {
      paddingLeft: SPACING_LARGE,
    },
  }), [theme]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('eventDetail.title')} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('common.error_occurred')}: {error?.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('eventDetail.title')} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('eventDetail.errors.dataNotAvailable')}
          </Text>
        </View>
      </View>
    );
  }

  const formattedStartDate = item.startDate ? new Date(item.startDate).toLocaleDateString() : t('common.not_available');
  const formattedEndDate = item.endDate ? new Date(item.endDate).toLocaleDateString() : t('common.not_available');

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={item.name || t('eventDetail.title')} />
        <Appbar.Action icon="pencil" onPress={() => router.push(`/event/edit/${eventId}`)} /> {/* Add Edit Button */}
      </Appbar.Header>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Main Event Information Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.profileCardContent}>
            <Avatar.Icon icon={item.type !== undefined ? eventTypeIconMap[item.type] : 'calendar-month'} size={80} color={theme.colors.onPrimary}  />
            <Text variant="headlineSmall" style={styles.titleText}>{item.name || t('common.not_available')}</Text>
            {item.description && <Text variant="bodyMedium" >{item.description}</Text>}
          </Card.Content>

          <List.Section title={t('eventDetail.details')} style={styles.listSection}>
            {item && item.type !== undefined && (
              <List.Item
                title={t('eventDetail.eventType')}
                description={eventTypeStringMap[item.type] || t('common.not_available')}
                left={() => <List.Icon icon="tag" />}
              />
            )}
            <List.Item
              title={t('eventDetail.startDate')}
              description={formattedStartDate}
              left={() => <List.Icon icon="calendar-start" />}
            />
            {item.endDate && (
              <List.Item
                title={t('eventDetail.endDate')}
                description={formattedEndDate}
                left={() => <List.Icon icon="calendar-end" />}
              />
            )}
            {item.location && (
              <List.Item
                title={t('eventDetail.location')}
                description={item.location}
                left={() => <List.Icon icon="map-marker" />}
              />
            )}
          </List.Section>
        </Card>

        {/* Related Members Card */}
        {item.relatedMembers && item.relatedMembers.length > 0 && (
          <Card style={styles.card}>
            <List.Section title={t('eventDetail.relatedMembers')} style={styles.listSection}>
              {item.relatedMembers.map((member: MemberListDto) => (
                <List.Item
                  key={member.id}
                  title={member.fullName}
                  left={() => <Avatar.Image size={40} source={getAvatarSource(member.avatarUrl)} />}
                  onPress={() => router.push(`/member/${member.id}`)} // Navigate to member details
                />
              ))}
            </List.Section>
          </Card>
        )}

        {/* Auditable Information Card */}
        <Card style={styles.card}>
          <List.Accordion
            title={t('eventDetail.auditableInfo')}
            left={() => <List.Icon icon="information-outline" />}
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
          >
            {item.created && (
              <List.Item
                title={t('common.created')}
                description={new Date(item.created).toLocaleString()}
                style={styles.accordionContentItem}
              />
            )}
            {item.createdBy && (
              <List.Item
                title={t('common.createdBy')}
                description={item.createdBy}
                style={styles.accordionContentItem}
              />
            )}
            {item.lastModified && (
              <List.Item
                title={t('common.lastModified')}
                description={new Date(item.lastModified).toLocaleString()}
                style={styles.accordionContentItem}
              />
            )}
            {item.lastModifiedBy && (
              <List.Item
                title={t('common.lastModifiedBy')}
                description={item.lastModifiedBy}
                style={styles.accordionContentItem}
              />
            )}
          </List.Accordion>
        </Card>
      </ScrollView>
    </View>
  );
}