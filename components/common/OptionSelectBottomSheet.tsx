import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';

export interface Option {
  label: string;
  value: any;
}

export interface OptionSelectBottomSheetProps {
  options: Option[];
  onSelect: (value: any) => void;
  onClose: () => void;
  title?: string;
  selectedValue?: any;
}

const OptionSelectBottomSheet = forwardRef<BottomSheet, OptionSelectBottomSheetProps>(
  ({ options, onSelect, onClose, title, selectedValue }, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();

    // The snap points are crucial for how the bottom sheet opens.
    // For <= 5 options, a single dynamic snap point based on content height or a fixed small height is good.
    // Let's use a fixed small height for now, and can be made dynamic later if needed.
    const snapPoints = useMemo(() => ['40%'], []); // Adjusted snap point

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    const handleSelect = useCallback(
      (value: any) => {
        onSelect(value);
        onClose(); // Close the sheet after selection
      },
      [onSelect, onClose]
    );

    const styles = useMemo(() => StyleSheet.create({
      container: {
        backgroundColor: theme.colors.background,
      },
      titleContainer: {
        padding: SPACING_MEDIUM,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.outlineVariant,
        alignItems: 'center',
      },
      title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
      },
      listItem: {
        paddingHorizontal: SPACING_MEDIUM,
      },
      selectedItem: {
        backgroundColor: theme.colors.primaryContainer,
      },
      itemText: {
        color: theme.colors.onSurface,
      },
      selectedItemText: {
        color: theme.colors.onPrimaryContainer,
        fontWeight: 'bold',
      },
    }), [theme]);

    return (
      <BottomSheet
        ref={ref}
        index={-1} // Start closed again
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        onClose={onClose}
        backgroundStyle={styles.container} // Revert background color
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <View style={styles.titleContainer}>
          <Text variant="titleLarge" style={styles.title}>
            {title || t('common.selectAnOption')}
          </Text>
        </View>
        <BottomSheetScrollView style={styles.container} bounces={false}> {/* Revert background color */}
          {options.map((option, index) => (
            <List.Item
              key={index.toString()}
              title={option.label}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.listItem,
                selectedValue === option.value && styles.selectedItem,
              ]}
              titleStyle={[
                styles.itemText,
                selectedValue === option.value && styles.selectedItemText,
              ]}
              right={() =>
                selectedValue === option.value ? (
                  <List.Icon icon="check" color={theme.colors.onPrimaryContainer} />
                ) : null
              }
            />
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

OptionSelectBottomSheet.displayName = 'OptionSelectBottomSheet';

export default OptionSelectBottomSheet;
