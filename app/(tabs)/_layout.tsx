import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { HamburgerButton } from '@/components/HamburgerButton';

function TabIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; focused: boolean }) {
  return (
    <FontAwesome
      size={props.focused ? 26 : 23}
      style={{ marginBottom: -3 }}
      name={props.name}
      color={props.color}
    />
  );
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
          paddingTop: 8,
          paddingBottom: 10,
          height: 74,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 3 },
        tabBarItemStyle: { paddingVertical: 4 },
        headerStyle: {
          backgroundColor: '#0a0a0f',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 96,
        },
        headerTintColor: '#f5f5f5',
        headerTitleStyle: { fontWeight: '800', fontSize: 17 },
        headerShadowVisible: false,
        headerLeft: () => <HamburgerButton />,
        headerTitleAlign: 'center',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: (p) => <TabIcon name="dashboard" {...p} />,
          headerTitle: 'HUMAID',
          headerTitleStyle: { fontWeight: '800', fontSize: 20, color: '#f4b942' },
        }}
      />
      <Tabs.Screen
        name="states"
        options={{
          title: 'States',
          tabBarIcon: (p) => <TabIcon name="map-marker" {...p} />,
          headerTitle: 'BAY States',
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: (p) => <TabIcon name="line-chart" {...p} />,
          headerTitle: 'Trend Analysis',
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: (p) => <TabIcon name="lightbulb-o" {...p} />,
          headerTitle: 'Analysis',
        }}
      />

      {/* Hidden from tab bar — still navigable via sidebar */}
      <Tabs.Screen name="compare" options={{ href: null }} />
      <Tabs.Screen name="briefs" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
