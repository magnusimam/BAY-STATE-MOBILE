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
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth-context';
import { spacing, radius, brand, background, semantic, textColor } from '@/constants/Tokens';
import { Text, Button } from '@/components/ui';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    try { await signIn(email.trim(), password); } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Gradient orbs */}
      <View style={styles.bgOrbs}>
        <View style={[styles.orb, styles.orbAmber]} />
        <View style={[styles.orb, styles.orbCyan]} />
        <View style={[styles.orb, styles.orbViolet]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LinearGradient colors={[brand.amberLight, brand.amberDark]} style={styles.logoBox}>
                <Text variant="h2" color="#fff">H</Text>
              </LinearGradient>
              <Text variant="h2" color="primary">HUMAID</Text>
            </View>
            <Text variant="h1" color="primary" style={{ marginTop: spacing.md }}>
              Welcome Back
            </Text>
            <Text variant="body" color="tertiary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
              Sign in to access your dashboard and insights
            </Text>
          </View>

          {/* Glass card */}
          <View style={styles.glassCard}>
            <View style={styles.shine} />

            {error && (
              <View style={styles.errorBox}>
                <Text variant="bodySm" color={semantic.danger}>{error}</Text>
              </View>
            )}

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

            <View style={styles.passwordHeader}>
              <Text variant="label" color="secondary">Password</Text>
              <Pressable onPress={() => {}}>
                <Text variant="caption" color={brand.amber}>Forgot password?</Text>
              </Pressable>
            </View>
            <View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={textColor.muted}
                value={password}
                onChangeText={(t) => { clearError(); setPassword(t); }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); setShowPassword(!showPassword); }}>
                <Text variant="caption" color="tertiary">{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <Button
                label="Sign In"
                onPress={handleSignIn}
                loading={loading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Divider */}
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

          {/* Sign up link */}
          <Pressable
            style={styles.linkBtn}
            onPress={() => router.push('/(auth)/signup')}>
            <Text variant="bodySm" color="tertiary">
              Don't have an account?{' '}
              <Text variant="bodySm" color={brand.amber} weight="700">Sign up</Text>
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
  orbAmber: { top: '15%', left: -40, width: 220, height: 220, backgroundColor: 'rgba(244,185,66,0.15)' },
  orbCyan: { bottom: '20%', right: -40, width: 220, height: 220, backgroundColor: 'rgba(110,198,232,0.10)' },
  orbViolet: { top: '40%', left: '20%', width: 320, height: 320, backgroundColor: 'rgba(139,92,246,0.06)' },

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
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xs },
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
  eyeBtn: { position: 'absolute', right: spacing.md, top: spacing.md + 2, minHeight: 44, minWidth: 44, justifyContent: 'center' },

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
