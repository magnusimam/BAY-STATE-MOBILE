import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

function TabIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={19} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#f4b942',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#141419',
          borderTopColor: 'rgba(255,255,255,0.08)',
          paddingBottom: 4,
          height: 58,
        },
        tabBarLabelStyle: { fontSize: 10 },
        headerStyle: { backgroundColor: '#0a0a0f' },
        headerTintColor: '#f5f5f5',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="dashboard" color={color} />,
          headerTitle: 'HUMAID',
          headerTitleStyle: { fontWeight: '800', fontSize: 18, color: '#f4b942' },
        }}
      />
      <Tabs.Screen
        name="states"
        options={{
          title: 'States',
          tabBarIcon: ({ color }) => <TabIcon name="map-marker" color={color} />,
          headerTitle: 'BAY States',
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color }) => <TabIcon name="lightbulb-o" color={color} />,
          headerTitle: 'AI Analysis',
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Compare',
          tabBarIcon: ({ color }) => <TabIcon name="columns" color={color} />,
          headerTitle: 'Compare States',
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ color }) => <TabIcon name="line-chart" color={color} />,
          headerTitle: 'Trend Analysis',
        }}
      />
      <Tabs.Screen
        name="briefs"
        options={{
          title: 'Briefs',
          tabBarIcon: ({ color }) => <TabIcon name="file-text-o" color={color} />,
          headerTitle: 'Policy Briefs',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="user-circle-o" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
