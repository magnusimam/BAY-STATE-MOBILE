import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const initial = user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Avatar section */}
      <View style={[styles.avatarSection, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.displayName}>{user?.displayName || 'HUMAID User'}</Text>
        <Text style={styles.email}>{user?.email || 'Not signed in'}</Text>
      </View>

      {/* Info cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <InfoRow icon="envelope-o" label="Email" value={user?.email || '--'} colors={colors} />
          <InfoRow icon="user-o" label="Name" value={user?.displayName || 'Not set'} colors={colors} />
          <InfoRow icon="calendar-o" label="Joined" value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '--'} colors={colors} />
          <InfoRow
            icon="clock-o"
            label="Last Sign In"
            value={user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : '--'}
            colors={colors}
            last
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <InfoRow icon="info-circle" label="App" value="HUMAID Mobile v1.0.0" colors={colors} />
          <InfoRow icon="database" label="Platform" value="BAY States Intelligence" colors={colors} />
          <InfoRow icon="globe" label="Region" value="Borno, Adamawa, Yobe" colors={colors} last />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: colors.danger }]}
        onPress={handleSignOut}>
        <FontAwesome name="sign-out" size={18} color={colors.danger} />
        <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  last,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  colors: any;
  last?: boolean;
}) {
  return (
    <View style={[infoStyles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <FontAwesome name={icon} size={16} color={colors.textSecondary} style={infoStyles.icon} />
      <Text style={[infoStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  icon: { width: 24 },
  label: { fontSize: 14, width: 90 },
  value: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  displayName: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 12 },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  signOutText: { fontSize: 16, fontWeight: '700' },
});
