import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_SMALL } from '@/constants/dimensions';

interface AITypingIndicatorProps {}

const AITypingIndicator: React.FC<AITypingIndicatorProps> = memo(() => {
  const { t } = useTranslation();
  const theme = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    bubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: SPACING_SMALL / 2, // Smaller padding for indicator
      paddingHorizontal: SPACING_SMALL,
      borderRadius: theme.roundness,
      marginBottom: SPACING_SMALL,
      maxWidth: '80%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingText: {
      color: theme.colors.onSurface,
      marginRight: SPACING_SMALL,
    },
  }), [theme]);

  return (
    <View style={styles.bubble}>
      <Text style={styles.typingText}>{t('aiChat.typingIndicator')}</Text>
      <ActivityIndicator size="small" color={theme.colors.onSurfaceVariant} />
    </View>
  );
});

AITypingIndicator.displayName = 'AITypingIndicator';

export default AITypingIndicator;
