import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function FamilyDetailLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>

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