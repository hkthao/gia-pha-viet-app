import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Text, useTheme, Card, Avatar, ActivityIndicator, Chip, List, Divider, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL, SPACING_LARGE } from '@/constants/dimensions';
import { EventType, MemberListDto } from '@/types';
import { getAvatarSource } from '@/utils/imageUtils';
import { useEventDetails } from '@/hooks/event/useEventDetails'; // Import the new hook
import { useDeleteEvent } from '@/hooks/event/useDeleteEvent'; // Import the new hook
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck'; // Import usePermissionCheck

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const eventId = Array.isArray(id) ? id[0] : id;

  const { event, isLoading, error } = useEventDetails(eventId);
  const { deleteEvent, isDeleting } = useDeleteEvent();
  const { canManageFamily, isAdmin } = usePermissionCheck(event?.familyId);

  const handleDelete = useCallback(() => {
    if (event?.id) {
      Alert.alert(
        t('eventDetail.deleteConfirmTitle'),
        t('eventDetail.deleteConfirmMessage', { eventName: event.name }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => { }, // Do nothing on cancel
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => deleteEvent(event.id), // Trigger delete mutation
          },
        ],
        { cancelable: true }
      );
    }
  }, [event, t, deleteEvent]);

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
    cardContent: {
    },
    avatar: {
      marginBottom: SPACING_MEDIUM,
    },
    detailsContainer: {
      alignItems: 'center',
      width: '100%',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING_SMALL / 2,
      width: '100%',
    },
    detailLabel: {
      fontWeight: 'bold',
      marginRight: SPACING_SMALL / 2,
      flexShrink: 0,
    },
    detailValue: {
      flex: 1,
      textAlign: 'right',
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: SPACING_SMALL,
      gap: SPACING_SMALL,
      justifyContent: 'center',
    },
    chip: {
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    deleteButton: {
      borderRadius: theme.roundness,
    },
    deleteButtonLabel: {
    },
    titleText: {
      marginBottom: SPACING_SMALL,
      textAlign: 'center',
    },
    // Removed old chipsContainer, chip styles
    listSection: {
      // Remove horizontal padding from here, it's better applied directly to Card.Content if needed
    },
    accordion: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
    },
    accordionTitle: {
      fontWeight: 'bold',
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
          <Appbar.Content title={t('eventDetail.title')} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('common.error_occurred')}: {error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!event) {
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

  const formattedStartDate = event.startDate ? new Date(event.startDate).toLocaleDateString() : t('common.not_available');
  const formattedEndDate = event.endDate ? new Date(event.endDate).toLocaleDateString() : t('common.not_available');

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={event.name || t('eventDetail.title')} />
        {(canManageFamily || isAdmin) && (
          <Appbar.Action icon="pencil" onPress={() => router.push(`/event/${event.id}/edit`)} />
        )}
      </Appbar.Header>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content >
            <View style={styles.detailsContainer}>
              <Avatar.Icon icon={event.type !== undefined ? eventTypeIconMap[event.type] : 'calendar-month'} size={80} color={theme.colors.onPrimary} style={styles.avatar} />
              <Text variant="headlineSmall" style={styles.titleText}>{event.name || t('common.not_available')}</Text>
              {event.description && <Text variant="bodyMedium" >{event.description}</Text>}
            </View>

            <List.Section title={t('eventDetail.details')}>
              <List.Item
                title={t('eventDetail.eventType')}
                description={eventTypeStringMap[event.type] || t('common.not_available')}
                left={() => <List.Icon icon="tag" />}
              />
              <Divider />
              <List.Item
                title={t('eventDetail.startDate')}
                description={formattedStartDate}
                left={() => <List.Icon icon="calendar-start" />}
              />
              <Divider />
              <List.Item
                title={t('eventDetail.endDate')}
                description={formattedEndDate}
                left={() => <List.Icon icon="calendar-end" />}
              />
              <Divider />
              <List.Item
                title={t('eventDetail.location')}
                description={event.location}
                left={() => <List.Icon icon="map-marker" />}
              />
            </List.Section>

            {/* Related Members */}
            {event.relatedMembers && event.relatedMembers.length > 0 && (
              <List.Section title={t('eventDetail.relatedMembers')}>
                {event.relatedMembers.map((member: MemberListDto) => (
                  <>
                    <List.Item
                      key={member.id}
                      title={member.fullName}
                      left={() => <Avatar.Image size={40} source={getAvatarSource(member.avatarUrl)} />}
                      onPress={() => router.push(`/member/${member.id}`)}
                    />
                  </>
                ))}
              </List.Section>
            )}

          </Card.Content>
        </Card>

        {(canManageFamily || isAdmin) && (
          <Button
            mode="contained"
            onPress={handleDelete}
            style={styles.deleteButton}
            labelStyle={styles.deleteButtonLabel}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {t('common.delete')}
          </Button>
        )}
      </ScrollView>
    </View>
  );
}