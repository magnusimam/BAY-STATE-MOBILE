import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable, ScrollView, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';
import { ADMIN_EMAILS } from '@/constants/Config';
import {
  spacing,
  radius,
  background,
  brand,
  textColor,
  borderColor,
  semantic,
} from '@/constants/Tokens';
import { Text } from '@/components/ui/Text';
import { LivePulse } from '@/components/ui/LivePulse';

const { width: SW, height: SH } = Dimensions.get('window');
const DRAWER_W = Math.min(SW * 0.82, 340);

type ItemKind = 'link' | 'action' | 'external';

interface Item {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  to?: string;
  onPress?: () => void;
  kind?: ItemKind;
  destructive?: boolean;
}

interface Section {
  title: string;
  items: Item[];
  show?: boolean;
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const tx = useSharedValue(-DRAWER_W);
  const bgOp = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      tx.value = withSpring(0, { damping: 20, stiffness: 180, mass: 0.8 });
      bgOp.value = withTiming(1, { duration: 250 });
    } else {
      tx.value = withTiming(-DRAWER_W, { duration: 260, easing: Easing.in(Easing.cubic) });
      bgOp.value = withTiming(0, { duration: 260 });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: bgOp.value }));

  const go = (to: string) => {
    Haptics.selectionAsync().catch(() => {});
    close();
    setTimeout(() => router.push(to as any), 180);
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    close();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    close();
    Alert.alert('Data Refreshed', 'Requested a fresh sync from the data source. New values will appear shortly.');
  };

  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email));

  const sections: Section[] = [
    {
      title: 'Tools',
      items: [
        { label: 'AI Analysis', icon: 'magic', onPress: () => go('/ai-chat'), kind: 'link' },
        { label: 'Compare', icon: 'columns', onPress: () => go('/compare'), kind: 'link' },
        { label: 'Policy Briefs', icon: 'file-text-o', onPress: () => go('/briefs'), kind: 'link' },
        { label: 'Export Data', icon: 'download', onPress: () => go('/export'), kind: 'link' },
      ],
    },
    {
      title: 'Data',
      items: [
        { label: 'Methodology', icon: 'info-circle', onPress: () => go('/methodology'), kind: 'link' },
        { label: 'Refresh Data', icon: 'refresh', onPress: handleRefresh, kind: 'action' },
        { label: 'LGA Directory', icon: 'list', onPress: () => go('/lga-directory'), kind: 'link' },
      ],
    },
    {
      title: 'Admin',
      show: isAdmin,
      items: [
        { label: 'Edit Site Content', icon: 'pencil-square-o', onPress: () => go('/admin/content'), kind: 'link' },
        { label: 'Theme & Sections', icon: 'paint-brush', onPress: () => go('/admin/theme'), kind: 'link' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: 'user-circle-o', onPress: () => go('/profile'), kind: 'link' },
        { label: 'Settings', icon: 'cog', onPress: () => go('/settings'), kind: 'link' },
        { label: 'Notifications', icon: 'bell-o', onPress: () => go('/notifications'), kind: 'link' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & FAQ', icon: 'question-circle-o', onPress: () => go('/help'), kind: 'link' },
        { label: 'Contact us', icon: 'envelope-o', onPress: () => go('/contact'), kind: 'link' },
        { label: 'Privacy Policy', icon: 'shield', onPress: () => go('/privacy'), kind: 'link' },
        { label: 'Sign Out', icon: 'sign-out', onPress: handleSignOut, kind: 'action', destructive: true },
      ],
    },
  ];

  const avatarInitial =
    user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, styles.root, { zIndex: 9000 }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View style={[styles.drawer, drawerStyle]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.huge }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header: user card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text variant="h2" color="#fff">{avatarInitial}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="h4" color="primary" numberOfLines={1}>
                {user?.displayName || 'HUMAID User'}
              </Text>
              <Text variant="caption" color="tertiary" numberOfLines={1}>
                {user?.email || 'Not signed in'}
              </Text>
              {isAdmin ? (
                <View style={styles.adminBadge}>
                  <Text variant="overline" style={{ color: brand.amber }}>Admin</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.livePulseRow}>
            <LivePulse label="Real-time data" size={6} />
          </View>

          {sections
            .filter((s) => s.show !== false)
            .map((section) => (
              <View key={section.title} style={styles.section}>
                <Text variant="overline" color="tertiary" style={styles.sectionTitle}>
                  {section.title}
                </Text>
                {section.items.map((item, i) => (
                  <Pressable
                    key={item.label}
                    onPress={item.onPress}
                    style={({ pressed }) => [
                      styles.item,
                      i < section.items.length - 1 && styles.itemBorder,
                      pressed && { backgroundColor: 'rgba(255,255,255,0.03)' },
                    ]}
                  >
                    <FontAwesome
                      name={item.icon}
                      size={18}
                      color={item.destructive ? semantic.danger : brand.amber}
                      style={{ width: 26 }}
                    />
                    <Text
                      variant="body"
                      style={{
                        color: item.destructive ? semantic.danger : textColor.primary,
                        marginLeft: spacing.md,
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.kind === 'link' ? (
                      <FontAwesome name="angle-right" size={18} color={textColor.muted} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_W,
    backgroundColor: background.secondary,
    borderRightWidth: 1,
    borderRightColor: borderColor.default,
    paddingTop: 60,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: borderColor.subtle,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: brand.amberBg,
    borderWidth: 1,
    borderColor: brand.amberBorder,
  },
  livePulseRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    letterSpacing: 1.2,
    color: textColor.muted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: borderColor.subtle,
  },
});
