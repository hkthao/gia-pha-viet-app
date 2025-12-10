import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useTheme, Button, Text, Surface, TextInput } from 'react-native-paper';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { relationshipService } from '@/services'; // Import the instance of the service
import { DetectRelationshipResult } from '@/types';
import { useTranslation } from 'react-i18next';

export default function DetectRelationshipScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [member1Id, setMember1Id] = useState<string>('');
  const [member2Id, setMember2Id] = useState<string>('');
  const [relationshipResult, setRelationshipResult] = useState<DetectRelationshipResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectRelationship = useCallback(async () => {
    if (!member1Id || !member2Id) {
      setError(t('detectRelationship.validationError'));
      return;
    }

    setLoading(true);
    setError(null);
    setRelationshipResult(null);

    try {
      const result = await relationshipService.detectRelationship(member1Id, member2Id);
      setRelationshipResult(result);
    } catch (e: any) {
      setError(e.message || t('detectRelationship.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [member1Id, member2Id, t]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: SPACING_MEDIUM,
    },
    input: {
      marginBottom: SPACING_MEDIUM,
    },
    button: {
      marginTop: SPACING_MEDIUM,
      marginBottom: SPACING_MEDIUM * 2,
    },
    resultContainer: {
      padding: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
    },
    resultTitle: {
      fontWeight: 'bold',
      marginBottom: SPACING_MEDIUM / 2,
    },
    resultText: {
      marginBottom: SPACING_MEDIUM / 2,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_MEDIUM,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <TextInput
          label={t('detectRelationship.member1Label')}
          value={member1Id}
          onChangeText={setMember1Id}
          style={styles.input}
          mode="outlined"
          placeholder={t('detectRelationship.member1Placeholder')}
        />
        <TextInput
          label={t('detectRelationship.member2Label')}
          value={member2Id}
          onChangeText={setMember2Id}
          style={styles.input}
          mode="outlined"
          placeholder={t('detectRelationship.member2Placeholder')}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleDetectRelationship}
          loading={loading}
          disabled={loading || !member1Id || !member2Id}
          style={styles.button}
        >
          {t('detectRelationship.detectButton')}
        </Button>

        {relationshipResult && (
          <Surface style={styles.resultContainer} elevation={1}>
            <Text style={styles.resultTitle}>{t('detectRelationship.resultTitle')}</Text>
            <Text style={styles.resultText}>
              <Text style={{ fontWeight: 'bold' }}>{t('detectRelationship.description')}: </Text>
              {relationshipResult.description}
            </Text>
            <Text style={styles.resultText}>
              <Text style={{ fontWeight: 'bold' }}>{t('detectRelationship.edges')}: </Text>
              {relationshipResult.edges?.join(', ')}
            </Text>
            <Text style={styles.resultText}>
              <Text style={{ fontWeight: 'bold' }}>{t('detectRelationship.path')}: </Text>
              {relationshipResult.path?.join(' -> ')}
            </Text>
          </Surface>
        )}
      </ScrollView>
    </View>
  );
}
