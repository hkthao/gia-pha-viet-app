// gia-pha-viet-app/app/memory/index.tsx

import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { PaginatedSearchListV2 } from "@/components/common/PaginatedSearchListV2";
import { MemoryItemDto, SearchMemoryItemsQuery, PaginatedList } from "@/types";
import { useTranslation } from "react-i18next";
import { memoryItemService } from "@/services";
import type { QueryKey } from "@tanstack/react-query";
import MemoryItemListItem from "@/components/memory/MemoryItemListItem";
import DefaultEmptyList from "@/components/common/DefaultEmptyList";
import { SPACING_SMALL } from "@/constants/dimensions";
import { useRouter } from "expo-router";
import { useCurrentFamilyStore } from "@/stores/useCurrentFamilyStore";

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: SPACING_SMALL,
    },
  });

export default function MemoryItemListScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const router = useRouter();
  const { currentFamilyId } = useCurrentFamilyStore();

  const handleItemPress = useCallback(
    (id: string) => {
      router.push(`/memory-item/${id}`);
    },
    [router]
  );

  const memoryItemQueryFn = useCallback(
    async ({
      pageParam = 1,
      filters,
    }: {
      pageParam?: number;
      queryKey: QueryKey;
      filters: SearchMemoryItemsQuery;
    }): Promise<PaginatedList<MemoryItemDto>> => {
      if (!currentFamilyId) {
        // Handle case where no family is selected (e.g., return empty list or throw error)
        return { items: [], page: 1, totalPages: 1, totalItems: 0 };
      }
      const result = await memoryItemService.search({
        ...filters,
        familyId: currentFamilyId,
        page: pageParam,
      });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t("memory.search.no_results"));
    },
    [t, currentFamilyId]
  );

  const getMemoryItemQueryKey = useCallback(
    (filters: SearchMemoryItemsQuery): QueryKey => {
      return ["memoryItems", "search", filters, currentFamilyId];
    },
    [currentFamilyId]
  );

  const initialQuery: SearchMemoryItemsQuery = useMemo(
    () => ({
      searchQuery: "",
      sortBy: "happenedAt",
      sortOrder: "desc",
      familyId: currentFamilyId ?? undefined, // Fix familyId type
    }),
    [currentFamilyId]
  );

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("memory.listTitle")} />
        <Appbar.Action
          icon="plus"
          onPress={() => router.push("/memory-item/create")}
        />
      </Appbar.Header>
      <PaginatedSearchListV2<MemoryItemDto, SearchMemoryItemsQuery>
        queryKey={getMemoryItemQueryKey}
        queryFn={memoryItemQueryFn}
        initialFilters={initialQuery}
        renderItem={({ item }) => <MemoryItemListItem item={item} onPress={handleItemPress} />}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('memory.search.search')}
        containerStyle={styles.container}
        ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} message={currentFamilyId ? t('memory.noMemoryItemsFound') : t('memory.selectFamilyToViewMemories')} />}
        externalDependencies={[currentFamilyId]}
      />
    </View>
  );
}
