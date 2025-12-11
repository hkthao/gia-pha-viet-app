import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { OnboardingSlide } from '@/components/onboarding';
import { SPACING_MEDIUM, SPACING_LARGE } from '@/constants/dimensions';
import { useOnboardingFlow } from '@/hooks/onboarding/useOnboardingFlow'; // Import the new hook

const { width } = Dimensions.get('window');

const slidesData = [
  {
    id: '1',
    image: require('@/assets/images/onboarding-1.png'),
    title: 'onboarding.slide1.title',
    description: 'onboarding.slide1.description',
  },
  {
    id: '2',
    image: require('@/assets/images/onboarding-2.png'),
    title: 'onboarding.slide2.title',
    description: 'onboarding.slide2.description',
  },
  {
    id: '3',
    image: require('@/assets/images/onboarding-3.png'),
    title: 'onboarding.slide3.title',
    description: 'onboarding.slide3.description',
  },
  {
    id: '4',
    image: require('@/assets/images/onboarding-4.png'),
    title: 'onboarding.slide4.title',
    description: 'onboarding.slide4.description',
  },
  {
    id: '5',
    image: require('@/assets/images/onboarding-5.png'),
    title: 'onboarding.slide5.title',
    description: 'onboarding.slide5.description',
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    currentIndex,
    scrollX,
    slidesRef,
    viewableItemsChanged,
    viewConfig,
    scrollToPrevious,
    scrollToNext,
    skipOnboarding,
  } = useOnboardingFlow(slidesData);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    pagination: {
      flexDirection: 'row',
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
      marginHorizontal: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: SPACING_MEDIUM,
      paddingBottom: SPACING_LARGE,
    },
    skipButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness,
    },
    buttonLabel: {
      color: theme.colors.onPrimary,
    },
  }), [theme]);

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {slidesData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              style={[styles.dot, { width: dotWidth, opacity }]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slidesData}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        ref={slidesRef}
      />
      {renderPagination()}
      <View style={styles.buttonContainer}>
        {currentIndex > 0 ? (
          <Button mode="text" onPress={scrollToPrevious}>
            {t('onboarding.back')}
          </Button>
        ) : (
          <View />
        )}

        <View style={{ flexDirection: 'row' }}>
          {currentIndex < slidesData.length - 1 ? (
            <>
              <Button mode="text" onPress={skipOnboarding} style={{ marginRight: SPACING_MEDIUM, borderRadius: theme.roundness }}>
                {t('onboarding.skip')}
              </Button>
              <Button style={{ borderRadius: theme.roundness }} mode="contained" onPress={() => scrollToNext(slidesData.length)}>
                {t('onboarding.next')}
              </Button>
            </>
          ) : (
            <Button mode="contained" onPress={skipOnboarding} labelStyle={styles.buttonLabel} style={{ borderRadius: theme.roundness }}>
              {t('onboarding.getStarted')}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}