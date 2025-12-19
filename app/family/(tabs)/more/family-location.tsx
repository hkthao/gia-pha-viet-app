import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useDeleteFamilyLocation, familyLocationQueryKeys } from "@/hooks"; // Only need delete mutation here
import {
  FamilyLocationDto,
  SearchFamilyLocationsQuery,
  PaginatedList,
} from "@/types";
import {
  SPACING_MEDIUM,
  SPACING_LARGE,
  SPACING_SMALL,
} from "@/constants/dimensions";
import { ConfirmationDialog } from "@/components/common";
import { useCurrentFamilyStore } from "@/stores/useCurrentFamilyStore";
import { usePermissionCheck } from "@/hooks/permissions/usePermissionCheck"; // Import usePermissionCheck
import { PaginatedSearchListV2 } from "@/components/common/PaginatedSearchListV2";
import { familyLocationService } from "@/services"; // Import familyLocationService
import type { QueryKey } from "@tanstack/react-query";
import {
  FamilyLocationItem,
  FamilyLocationFilterComponent,
} from "@/components/familyLocation"; // Import the new components
import DefaultEmptyList from "@/components/common/DefaultEmptyList"; // Import DefaultEmptyList

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: SPACING_SMALL,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: "center",
    },
    fab: {
      position: "absolute",
      margin: SPACING_LARGE,
      right: 0,
      bottom: SPACING_LARGE,
      backgroundColor: theme.colors.primaryContainer,
    },
  });

export default function FamilyLocationListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { currentFamilyId } = useCurrentFamilyStore();
  const { canManageFamily, isAdmin } = usePermissionCheck(
    currentFamilyId ?? undefined
  ); // Check permission
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );

  const { mutate: deleteFamilyLocation, isPending: isDeleting } =
    useDeleteFamilyLocation();

  const handleCreate = useCallback(() => {
    router.push("/family-location/create");
  }, [router]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/family-location/${id}/edit`);
    },
    [router]
  );

  const handleDetailPress = useCallback(
    (id: string) => {
      router.push(`/family-location/${id}`);
    },
    [router]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedLocationId) {
      deleteFamilyLocation(selectedLocationId, {
        onSuccess: () => {
          setDialogVisible(false);
          setSelectedLocationId(null);
          // Invalidate and refetch is handled by useDeleteFamilyLocation hook
        },
        onError: (err) => {
          setDialogVisible(false);
          setSelectedLocationId(null);
          Alert.alert(
            t("common.error"),
            err.message || t("common.error_occurred")
          );
        },
      });
    }
  }, [selectedLocationId, deleteFamilyLocation, t]);

  const handleDeletePress = useCallback((id: string) => {
    setSelectedLocationId(id);
    setDialogVisible(true);
  }, []);

  // Define the query function for fetching map data data
  const familyLocationSearchQueryFn = useCallback(
    async ({
      pageParam = 1,
      filters,
      queryKey: reactQueryKey,
    }: {
      pageParam?: number;
      queryKey: QueryKey;
      filters: SearchFamilyLocationsQuery;
    }): Promise<PaginatedList<FamilyLocationDto>> => {
      if (!currentFamilyId) {
        throw new Error(t("familyLocation.selectFamilyPrompt"));
      }
      const result = await familyLocationService.search({
        ...filters,
        familyId: currentFamilyId,
        page: pageParam,
      });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(
        result.error?.message || t("familyLocation.errors.dataNotAvailable")
      );
    },
    [currentFamilyId, t]
  );

  // Define the query key generation function
  const getFamilyLocationSearchQueryKey = useCallback(
    (filters: SearchFamilyLocationsQuery): QueryKey => {
      return familyLocationQueryKeys.list({
        ...filters,
        familyId: currentFamilyId || "",
      });
    },
    [currentFamilyId]
  );

  const initialQuery: SearchFamilyLocationsQuery = useMemo(
    () => ({
      searchQuery: "",
      locationType: undefined,
      accuracy: undefined,
      source: undefined,
      familyId: currentFamilyId || "",
    }),
    [currentFamilyId]
  );

  const renderItem = useCallback(
    ({ item }: { item: FamilyLocationDto }) => (
      <FamilyLocationItem
        item={item}
        onEdit={handleEdit}
        onDelete={handleDeletePress}
        onPress={handleDetailPress}
      />
    ),
    [handleEdit, handleDeletePress, handleDetailPress]
  );

  if (!currentFamilyId) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t("familyLocation.listTitle")} />
        </Appbar.Header>
        <DefaultEmptyList
          styles={styles}
          t={t}
          message={t("familyLocation.selectFamilyPrompt")}
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("familyLocation.listTitle")} />
        {(canManageFamily || isAdmin) && (
          <Appbar.Action icon="plus" onPress={handleCreate} />
        )}
      </Appbar.Header>
      <View style={{ flex: 1 }}>
        <PaginatedSearchListV2<FamilyLocationDto, SearchFamilyLocationsQuery>
          queryKey={getFamilyLocationSearchQueryKey}
          queryFn={familyLocationSearchQueryFn}
          initialFilters={initialQuery}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          searchPlaceholder={t("familyLocation.searchPlaceholder")}
          containerStyle={styles.container}
          showFilterButton={true}
          FilterComponent={FamilyLocationFilterComponent}
          ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
          externalDependencies={[currentFamilyId]}
        />
      </View>
      <ConfirmationDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        onConfirm={handleDeleteConfirm}
        title={t("familyLocation.deleteConfirmTitle")}
        message={t("familyLocation.deleteConfirmMessage")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        loading={isDeleting}
      />
    </View>
  );
}
