import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Appbar, useTheme, Text, ActivityIndicator, Card, Button, Chip, Avatar } from 'react-native-paper'; // Removed Divider, List
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFaceDataDetails } from '@/hooks/face/useFaceDataDetails';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { getAvatarSource } from '@/utils/imageUtils';

export default function FaceDataDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);

  const faceDataId = Array.isArray(id) ? id[0] : id;

  const {
    faceData,
    loading,
    error,
    handleDeleteFaceData,
    deleteLoading,
  } = useFaceDataDetails(faceDataId as string);

  const { canManageFamily, isAdmin } = usePermissionCheck(currentFamilyId ?? undefined);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
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
    card: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    thumbnailContainer: {
      alignItems: 'center',
      paddingVertical: SPACING_MEDIUM,
    },
    thumbnail: {
      width: 150,
      height: 150,
      borderRadius: theme.roundness,
      resizeMode: 'contain',
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: SPACING_SMALL,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    button: {
      flex: 1,
      borderRadius: theme.roundness,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    deleteButtonLabel: {
      color: theme.colors.onError,
    },
    infoText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: SPACING_SMALL,
    },
  }), [theme]);

  if (loading || deleteLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !faceData) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>{error || t('faceDataDetail.errors.fetchError')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={t('faceDataDetail.title')} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.thumbnailContainer}>
            {faceData.thumbnailUrl ? (
              <Image source={{ uri: faceData.thumbnailUrl }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, { justifyContent: 'center' }]}>
                <Text variant="bodySmall" style={styles.infoText}>{t('faceDataDetail.noThumbnail')}</Text>
              </View>
            )}
            <View style={{
              padding: SPACING_SMALL,
              display: "flex",
              flexDirection: "row",
              gap: SPACING_MEDIUM,
              flexWrap: "wrap"
            }}>

              <Chip compact
                avatar={faceData.memberAvatarUrl ? <Avatar.Image size={24} source={getAvatarSource(faceData.memberAvatarUrl)} /> : <Avatar.Icon size={24} icon="account" />}

              >
                {faceData.memberName}
              </Chip>

              <Chip compact
                avatar={faceData.familyAvatarUrl ? <Avatar.Image size={24} source={getAvatarSource(faceData.familyAvatarUrl)} /> : <Avatar.Icon size={24} icon="account-group" />}
              >
                {faceData.familyName}
              </Chip>
              {
                faceData.emotion && <Chip compact >
                  {faceData.emotion}
                </Chip>
              }
              {(faceData.birthYear || faceData.deathYear) && (
                <Chip
                  icon="calendar"
                  compact
                  style={{ backgroundColor: theme.colors.surfaceVariant }}
                >
                  ({faceData.birthYear || t('common.not_available')} - {faceData.deathYear || t('common.not_available')})
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {(canManageFamily || isAdmin) && (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleDeleteFaceData}
              style={[styles.button, styles.deleteButton]}
              labelStyle={styles.deleteButtonLabel}
              icon="delete"
              loading={deleteLoading}
            >
              {t('common.delete')}
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}