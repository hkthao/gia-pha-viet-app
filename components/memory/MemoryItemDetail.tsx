// gia-pha-viet-app/components/memory/MemoryItemDetail.tsx

import React, { memo, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { Text, useTheme, Chip, IconButton, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MemoryItemDto, EmotionalTag } from '@/types';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import dayjs from 'dayjs';
import MemberAvatarChip from '@/components/common/MemberAvatarChip';
import ImageViewing from 'react-native-image-viewing'; // Added ImageViewing

interface MemoryItemDetailProps {
  memoryItem: MemoryItemDto;
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: SPACING_MEDIUM,
    paddingBottom: SPACING_MEDIUM * 2, // Add extra padding for scrollview
  },
  titleText: {
    marginBottom: SPACING_SMALL,
    textAlign: 'center',
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginTop: SPACING_SMALL,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align to the right
    alignItems: 'center',
    marginBottom: SPACING_MEDIUM,
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING_SMALL / 2,
  },
  metadataText: {
    color: theme.colors.onSurfaceVariant,
    marginLeft: SPACING_SMALL / 2,
  },
  descriptionText: {
    marginBottom: SPACING_MEDIUM,
    lineHeight: 24, // Improve readability
    color: theme.colors.onBackground,
  },
  mediaContainer: {
    height: 250, // Fixed height for the carousel
  },
  carouselItem: {
    width: Dimensions.get('window').width - (SPACING_MEDIUM * 2), // Full width minus padding
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.roundness,
    overflow: 'hidden', // Ensures image respects borderRadius
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  personChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING_SMALL,
    marginBottom: SPACING_MEDIUM,
    // MemberAvatarChip has its own margin, adjust as needed
  },
  personChip: {
    marginRight: SPACING_SMALL / 2,
    marginBottom: SPACING_SMALL / 2,
  },
  chipStyle: { // This was missing
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING_SMALL,
    color: theme.colors.onBackground,
  },
  carouselNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING_SMALL,
    paddingHorizontal: SPACING_SMALL, // Add some padding to buttons
  },
});

const MemoryItemDetail = ({ memoryItem }: MemoryItemDetailProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // State for image viewer
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // 50% of the item must be visible to be considered 'viewable'
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: { item: any; index: number | null; isViewable: boolean; }[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const handlePrevious = useCallback(() => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ animated: true, index: newIndex });
      setActiveIndex(newIndex);
    }
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    if (memoryItem.memoryMedia && activeIndex < memoryItem.memoryMedia.length - 1) {
      const newIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ animated: true, index: newIndex });
      setActiveIndex(newIndex);
    }
  }, [activeIndex, memoryItem.memoryMedia]);

  const handleImagePress = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setViewerVisible(true);
  }, []);

  // Prepare images for ImageViewing
  const imagesForViewer = useMemo(() => {
    return memoryItem.memoryMedia?.map(media => ({ uri: media.url })) || [];
  }, [memoryItem.memoryMedia]);

  const getEmotionalTagLabel = (tag: EmotionalTag) => {
    switch (tag) {
      case EmotionalTag.Happy: return t('emotionalTag.happy');
      case EmotionalTag.Sad: return t('emotionalTag.sad');
      case EmotionalTag.Proud: return t('emotionalTag.proud');
      case EmotionalTag.Memorial: return t('emotionalTag.memorial');
      case EmotionalTag.Neutral:
      default: return t('emotionalTag.neutral');
    }
  };

  const getEmotionalTagIcon = (tag: EmotionalTag) => {
    switch (tag) {
      case EmotionalTag.Happy: return 'emoticon-happy-outline';
      case EmotionalTag.Sad: return 'emoticon-sad-outline';
      case EmotionalTag.Proud: return 'medal'; // Placeholder icon
      case EmotionalTag.Memorial: return 'grave-stone'; // Placeholder icon
      case EmotionalTag.Neutral:
      default: return 'emoticon-neutral-outline';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {memoryItem.memoryMedia && memoryItem.memoryMedia.length > 0 && (
        <View style={[styles.mediaContainer, { marginBottom: 0 }]}> {/* Removed bottom margin here */}
          <FlatList
            ref={flatListRef}
            data={memoryItem.memoryMedia}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => (item.id || index).toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.carouselItem, { width: Dimensions.get('window').width }]}
                onPress={() => handleImagePress(index)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.url }} style={styles.imageStyle} />
              </TouchableOpacity>
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
          />
          {memoryItem.memoryMedia.length > 1 && (
            <View style={styles.carouselNavigation}>
              <IconButton
                icon="arrow-left-circle"
                size={30}
                onPress={handlePrevious}
                disabled={activeIndex === 0}
              />
              <Text variant="bodySmall">{`${activeIndex + 1}/${memoryItem.memoryMedia.length}`}</Text>
              <IconButton
                icon="arrow-right-circle"
                size={30}
                onPress={handleNext}
                disabled={activeIndex === (memoryItem.memoryMedia.length - 1)}
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.content}> {/* Wrap the rest of the content in a View with padding */}
        <Text variant="headlineMedium" style={styles.titleText}>{memoryItem.title}</Text>

        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Text variant="labelMedium" style={styles.metadataText}>
              {dayjs(memoryItem.happenedAt).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Chip icon={getEmotionalTagIcon(memoryItem.emotionalTag)} compact mode="outlined" style={[{ backgroundColor: 'transparent' }, styles.chipStyle]}>
              <Text variant="labelSmall">{getEmotionalTagLabel(memoryItem.emotionalTag)}</Text>
            </Chip>
          </View>
        </View>

        <Divider style={{ marginVertical: SPACING_MEDIUM}}/>

        {memoryItem.description && (
          <Text variant="bodyLarge" style={styles.descriptionText}>{memoryItem.description}</Text>
        )}

        {memoryItem.memoryPersons && memoryItem.memoryPersons.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('memory.involvedPersons')}</Text>
            <View style={styles.personChipContainer}>
              {memoryItem.memoryPersons.map((person, index) => (
                <MemberAvatarChip
                  key={person.memberId || index}
                  id={person.memberId}
                  fullName={person.memberName}
                  avatarUrl={person.memberAvatarUrl}
                />
              ))}
            </View>
          </>
        )}
      </View>

      {imagesForViewer.length > 0 && (
        <ImageViewing
          images={imagesForViewer}
          imageIndex={currentImageIndex}
          visible={viewerVisible}
          onRequestClose={() => setViewerVisible(false)}
        />
      )}
    </ScrollView>
  );
};

export default memo(MemoryItemDetail);
