import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Appbar, useTheme, Text, ActivityIndicator, Card, Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFaceDataDetails } from '@/hooks/face/useFaceDataDetails';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { useFamilyStore } from '@/stores/useFamilyStore';

export default function FaceDataDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const faceDataId = Array.isArray(id) ? id[0] : id;

  const {
    faceData,
    loading,
    error,
    handleEditFaceData,
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
    imageContainer: {
      alignItems: 'center',
      marginBottom: SPACING_MEDIUM,
    },
    thumbnail: {
      width: 200,
      height: 200,
      borderRadius: theme.roundness,
      resizeMode: 'contain',
      backgroundColor: theme.colors.surfaceVariant,
    },
    card: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    cardTitle: {
      fontWeight: 'bold',
      marginBottom: SPACING_SMALL,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING_SMALL,
    },
    detailLabel: {
      fontWeight: 'bold',
      color: theme.colors.onSurfaceVariant,
      marginRight: SPACING_SMALL,
    },
    detailValue: {
      flexShrink: 1,
      color: theme.colors.onSurface,
      textAlign: 'right',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
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
        <View style={styles.imageContainer}>
          {faceData.thumbnailUrl ? (
            <Image source={{ uri: faceData.thumbnailUrl }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnail}>
              <Text variant="bodySmall" style={{ textAlign: 'center', paddingTop: '40%' }}>{t('faceDataDetail.noThumbnail')}</Text>
            </View>
          )}
        </View>

        <Card style={styles.card}>
          <Card.Title title={t('faceDataDetail.details')} titleVariant="titleMedium" />
          <Card.Content>
            {faceData.memberName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('faceDataDetail.associatedMember')}:</Text>
                <Text style={styles.detailValue} onPress={() => router.push(`/member/${faceData.memberId}`)}>
                  {faceData.memberName} ({faceData.familyName})
                </Text>
              </View>
            )}
            {faceData.emotion && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('faceDataDetail.emotion')}:</Text>
                <Text style={styles.detailValue}>{faceData.emotion}</Text>
              </View>
            )}
            {faceData.boundingBox && (
              <View>
                <Divider style={{ marginVertical: SPACING_SMALL }} />
                <Text style={styles.detailLabel}>{t('faceDataDetail.boundingBox')}:</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>X:</Text>
                  <Text style={styles.detailValue}>{faceData.boundingBox.x.toFixed(0)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Y:</Text>
                  <Text style={styles.detailValue}>{faceData.boundingBox.y.toFixed(0)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Width:</Text>
                  <Text style={styles.detailValue}>{faceData.boundingBox.width.toFixed(0)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Height:</Text>
                  <Text style={styles.detailValue}>{faceData.boundingBox.height.toFixed(0)}</Text>
                </View>
              </View>
            )}
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