import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/lib/auth-context';
import { spacing, radius, background, brand, elevation, textColor, semantic } from '@/constants/Tokens';
import { Text, Button } from '@/components/ui';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const initial = user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <ScrollView style={styles.container}>
      {/* Avatar banner */}
      <LinearGradient colors={[brand.amberLight, brand.amber, brand.amberDark]} style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text variant="display" color="#fff">{initial}</Text>
        </View>
        <Text variant="h2" color="#fff" style={{ marginTop: spacing.md }}>
          {user?.displayName || 'HUMAID User'}
        </Text>
        <Text variant="bodySm" color="rgba(255,255,255,0.8)" style={{ marginTop: spacing.xs }}>
          {user?.email || 'Not signed in'}
        </Text>
      </LinearGradient>

      {/* Account section */}
      <View style={styles.section}>
        <Text variant="label" color="tertiary" style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="envelope-o" label="Email" value={user?.email || '--'} />
          <InfoRow icon="user-o" label="Name" value={user?.displayName || 'Not set'} />
          <InfoRow icon="calendar-o" label="Joined" value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '--'} />
          <InfoRow icon="clock-o" label="Last Sign In" value={user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : '--'} last />
        </View>
      </View>

      {/* About section */}
      <View style={styles.section}>
        <Text variant="label" color="tertiary" style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="info-circle" label="App" value="HUMAID Mobile v1.0.0" />
          <InfoRow icon="database" label="Platform" value="BAY States Intelligence" />
          <InfoRow icon="globe" label="Region" value="Borno, Adamawa, Yobe" last />
        </View>
      </View>

      {/* Sign out */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xxl }}>
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          icon={<FontAwesome name="sign-out" size={16} color={semantic.danger} />}
        />
      </View>

      <View style={{ height: spacing.huge * 1.5 }} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, last }: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <FontAwesome name={icon} size={15} color={textColor.tertiary} style={{ width: 24 }} />
      <Text variant="bodySm" color="tertiary" style={{ width: 90 }}>{label}</Text>
      <Text variant="bodySm" color="primary" weight="500" style={{ flex: 1, textAlign: 'right' }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingTop: 72,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
  },

  section: { marginTop: spacing.xxl, paddingHorizontal: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm, letterSpacing: 1 },

  infoCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation.L2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 48,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
});
