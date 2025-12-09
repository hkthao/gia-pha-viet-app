import React from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PaginatedSearchList } from '@/components/common';
import { FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { useFamilyDictList } from '@/hooks/useFamilyDictList';

export default function FamilyDictScreen() {
  const { useStore, renderFamilyDictItem, styles, t } = useFamilyDictList();

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('familyDict.list.title')} />
      </Appbar.Header>
      <PaginatedSearchList<FamilyDictDto, FamilyDictSearchQuery>
        useStore={useStore}
        searchOptions={{
          initialQuery: { searchQuery: '', sortBy: 'name', sortOrder: 'asc' },
        }}
        renderItem={renderFamilyDictItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('familyDict.search.search')}
        containerStyle={styles.container}
      />
    </View>
  );
}
