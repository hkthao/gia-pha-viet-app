import { useState, useRef, useCallback } from 'react';
import { Dimensions, Animated, ViewToken, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Define the slide type locally for the hook
interface OnboardingSlideData {
  id: string;
  image: any; // Use 'any' for require() images
  title: string;
  description: string;
}

export interface UseOnboardingFlowResult {
  currentIndex: number;
  scrollX: Animated.Value;
  slidesRef: React.RefObject<FlatList<OnboardingSlideData> | null>;
  viewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[] }) => void;
  viewConfig: { viewAreaCoveragePercentThreshold: number };
  scrollToPrevious: () => void;
  scrollToNext: (slidesLength: number) => void;
  skipOnboarding: () => Promise<void>;
}

export function useOnboardingFlow(slides: OnboardingSlideData[]): UseOnboardingFlowResult {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<OnboardingSlideData>>(null);

  const viewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToPrevious = useCallback(() => {
    if (slidesRef.current && currentIndex > 0) {
      slidesRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  }, [currentIndex]);

  const scrollToNext = useCallback((slidesLength: number) => {
    if (slidesRef.current && currentIndex < slidesLength - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      skipOnboarding();
    }
  }, [currentIndex, slides.length]); // Add slides.length to dependencies

  const skipOnboarding = useCallback(async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.push('/');
  }, []);

  return {
    currentIndex,
    scrollX,
    slidesRef,
    viewableItemsChanged,
    viewConfig,
    scrollToPrevious,
    scrollToNext,
    skipOnboarding,
  };
}
