import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { spacing, radius, brand, background, semantic, textColor } from '@/constants/Tokens';
import { Text, Button } from '@/components/ui';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || password !== confirm) return;
    try { await signUp(email.trim(), password, name.trim() || undefined); } catch {}
  };

  const passwordMismatch = confirm.length > 0 && password !== confirm;

  return (
    <View style={styles.container}>
      <View style={styles.bgOrbs}>
        <View style={[styles.orb, styles.orbAmber]} />
        <View style={[styles.orb, styles.orbEmerald]} />
        <View style={[styles.orb, styles.orbViolet]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LinearGradient colors={[brand.amberLight, brand.amberDark]} style={styles.logoBox}>
                <Text variant="h2" color="#fff">H</Text>
              </LinearGradient>
              <Text variant="h2" color="primary">HUMAID</Text>
            </View>
            <Text variant="h1" color="primary" style={{ marginTop: spacing.md }}>
              Create Account
            </Text>
            <Text variant="body" color="tertiary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
              Join the BAY States Intelligence Platform
            </Text>
          </View>

          <View style={styles.glassCard}>
            <View style={styles.shine} />

            {error && (
              <View style={styles.errorBox}>
                <Text variant="bodySm" color={semantic.danger}>{error}</Text>
              </View>
            )}

            <Text variant="label" color="secondary" style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={textColor.muted}
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />

            <Text variant="label" color="secondary" style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={textColor.muted}
              value={email}
              onChangeText={(t) => { clearError(); setEmail(t); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text variant="label" color="secondary" style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={textColor.muted}
              value={password}
              onChangeText={(t) => { clearError(); setPassword(t); }}
              secureTextEntry
            />

            <Text variant="label" color="secondary" style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, passwordMismatch && { borderColor: 'rgba(239,68,68,0.5)' }]}
              placeholder="Repeat your password"
              placeholderTextColor={textColor.muted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            {passwordMismatch && (
              <Text variant="caption" color={semantic.danger} style={{ marginTop: spacing.xs }}>
                Passwords do not match
              </Text>
            )}

            <View style={{ marginTop: spacing.xl }}>
              <Button
                label="Create Account"
                onPress={handleSignUp}
                loading={loading}
                disabled={passwordMismatch}
                fullWidth
                size="lg"
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="overline" color="muted" style={{ marginHorizontal: spacing.md }}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.oauthRow}>
              <Button label="Google" onPress={signInWithGoogle} variant="secondary" fullWidth size="md" style={{ flex: 1 }} />
              <Button label="GitHub" onPress={() => {}} variant="secondary" fullWidth size="md" style={{ flex: 1 }} />
            </View>
          </View>

          <Pressable style={styles.linkBtn} onPress={() => router.back()}>
            <Text variant="bodySm" color="tertiary">
              Already have an account?{' '}
              <Text variant="bodySm" color={brand.amber} weight="700">Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  bgOrbs: { ...StyleSheet.absoluteFillObject },
  orb: { position: 'absolute', borderRadius: 999 },
  orbAmber: { top: '10%', left: -40, width: 220, height: 220, backgroundColor: 'rgba(244,185,66,0.15)' },
  orbEmerald: { bottom: '15%', right: -40, width: 220, height: 220, backgroundColor: 'rgba(34,197,94,0.10)' },
  orbViolet: { top: '45%', left: '25%', width: 300, height: 300, backgroundColor: 'rgba(139,92,246,0.06)' },

  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },

  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoBox: {
    width: 48, height: 48, borderRadius: radius.lg,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: brand.amber, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },

  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute', top: -100, left: -100,
    width: 300, height: 300,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '12deg' }],
  },

  label: { marginTop: spacing.md, marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 15,
    color: textColor.primary,
  },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  oauthRow: { flexDirection: 'row', gap: spacing.md },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },

  linkBtn: { alignItems: 'center', marginTop: spacing.xl, minHeight: 44, justifyContent: 'center' },
});
