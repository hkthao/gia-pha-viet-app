import React from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PaginatedSearchList } from '@/components/common';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { useFamilySearchList } from '@/hooks/useFamilySearchList';

export default function SearchScreen() {
  const { useStore, renderFamilyItem, styles, t } = useFamilySearchList();

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('search.title')} />
      </Appbar.Header>
      <PaginatedSearchList<FamilyListDto, SearchPublicFamiliesQuery>
        useStore={() => useStore}
        searchOptions={{
          initialQuery: { page: 1, itemsPerPage: 10, searchTerm: '' },
        }}
        renderItem={renderFamilyItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('search.placeholder')}
        containerStyle={styles.container}
      // Additional props can be passed here as needed
      />
    </View>
  );
}