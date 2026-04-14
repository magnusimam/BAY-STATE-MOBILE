import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/lib/auth-context';

export default function ProfileScreen() {
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
    <ScrollView style={styles.container}>
      {/* Avatar banner */}
      <LinearGradient colors={['#f4b942', '#d4952a']} style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.displayName}>{user?.displayName || 'HUMAID User'}</Text>
        <Text style={styles.email}>{user?.email || 'Not signed in'}</Text>
      </LinearGradient>

      {/* Account info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="envelope-o" label="Email" value={user?.email || '--'} />
          <InfoRow icon="user-o" label="Name" value={user?.displayName || 'Not set'} />
          <InfoRow icon="calendar-o" label="Joined" value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '--'} />
          <InfoRow icon="clock-o" label="Last Sign In" value={user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : '--'} last />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="info-circle" label="App" value="HUMAID Mobile v1.0.0" />
          <InfoRow icon="database" label="Platform" value="BAY States Intelligence" />
          <InfoRow icon="globe" label="Region" value="Borno, Adamawa, Yobe" last />
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <FontAwesome name="sign-out" size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
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
    <View style={[rowStyles.row, !last && rowStyles.border]}>
      <FontAwesome name={icon} size={15} color="#64748b" style={rowStyles.icon} />
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  icon: { width: 24 },
  label: { color: '#94a3b8', fontSize: 14, width: 90 },
  value: { color: '#f5f5f5', fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  avatarSection: {
    alignItems: 'center', paddingVertical: 36, paddingTop: 60,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  displayName: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 12 },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { color: '#f5f5f5', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoCard: {
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 32, padding: 16,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#ef4444',
    gap: 8,
  },
  signOutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
