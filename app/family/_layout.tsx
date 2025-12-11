import { Tabs, useSegments } from 'expo-router';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFamilySharing } from '@/hooks/family/useFamilySharing'; // Import the new hook
import { useFamilyStore } from '@/stores/useFamilyStore'; // Import useFamilyStore

export default function FamilyDetailLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const segments = useSegments();
  const navigation = useNavigation();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const { onShare } = useFamilySharing(); // Use the new hook

  const currentTab = segments[segments.length - 1];

  const getTabTitle = (tabName: string) => {
    switch (tabName) {
      case 'dashboard':
        return t('familyDashboard.tab.dashboard');
      case 'members':
        return t('familyDetail.tab.members');
      case 'tree':
        return t('familyDetail.tab.tree');
      case 'face-search':
        return t('familyDetail.tab.faceSearch');
      case 'more':
        return t('familyDetail.tab.more');
      case 'calendar':
        return t('more.calendar');
      case 'face-data':
        return t('more.faceData');
      case 'memories':
        return t('more.memories');
      case 'timeline':
        return t('more.timeline');
      case 'privacy':
        return t('more.privacy');
      case 'detect-relationship':
        return t('detectRelationship.title');
      default:
        return t('familyDetail.title');
    }
  };

  const moreTabs = ['more', 'calendar', 'face-data', 'memories', 'timeline', 'privacy' ,'detect-relationship'];
  const isMoreTab = moreTabs.includes(currentTab)

  return (
    <View style={{ flex: 1 }}>
      {!isMoreTab && (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={getTabTitle(currentTab)} />
          {currentTab === 'tree' && currentFamilyId && (
            <Appbar.Action icon="share-variant" onPress={onShare} color={theme.colors.onSurface} />
          )}
        </Appbar.Header>
      )}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: t('familyDashboard.tab.overview'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="members"
          options={{
            title: t('familyDetail.tab.members'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="tree"
          options={{
            title: t('familyDetail.tab.familyTreeShort'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="sitemap-outline" color={color} size={size} />
            ),
          }}
        />


        <Tabs.Screen
          name="face-search"
          options={{
            title: t('familyDetail.tab.faceSearchShort'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="face-recognition" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="more"
          options={{
            title: t('familyDetail.tab.more'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}