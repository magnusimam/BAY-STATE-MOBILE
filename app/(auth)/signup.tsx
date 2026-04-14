import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) return;
    if (password !== confirm) return;
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
    } catch {
      // error displayed via context
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // error displayed via context
    }
  };

  const passwordMismatch = confirm.length > 0 && password !== confirm;

  return (
    <View style={styles.container}>
      {/* Gradient orbs */}
      <View style={styles.bgOrbs}>
        <View style={[styles.orb, styles.orbAmber]} />
        <View style={[styles.orb, styles.orbEmerald]} />
        <View style={[styles.orb, styles.orbViolet]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LinearGradient colors={['#f4b942', '#d4952a']} style={styles.logoBox}>
                <Text style={styles.logoIcon}>H</Text>
              </LinearGradient>
              <Text style={styles.brandText}>HUMAID</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the BAY States Intelligence Platform</Text>
          </View>

          {/* Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.shine} />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={email}
              onChangeText={(t) => { clearError(); setEmail(t); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={password}
              onChangeText={(t) => { clearError(); setPassword(t); }}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, passwordMismatch && { borderColor: 'rgba(239,68,68,0.5)' }]}
              placeholder="Repeat your password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            {passwordMismatch && (
              <Text style={styles.mismatchText}>Passwords do not match</Text>
            )}

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading || passwordMismatch}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#f4b942', '#d4952a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btn, (loading || passwordMismatch) && { opacity: 0.5 }]}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth */}
            <View style={styles.oauthRow}>
              <TouchableOpacity style={styles.oauthBtn} onPress={handleGoogleSignIn} disabled={loading}>
                <Text style={styles.oauthIcon}>G</Text>
                <Text style={styles.oauthLabel}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.oauthBtn} disabled={loading}>
                <Text style={styles.oauthIcon}>GH</Text>
                <Text style={styles.oauthLabel}>GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkAccent}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  bgOrbs: { ...StyleSheet.absoluteFillObject },
  orb: { position: 'absolute', borderRadius: 999 },
  orbAmber: { top: '10%', left: -40, width: 200, height: 200, backgroundColor: 'rgba(244,185,66,0.15)' },
  orbEmerald: { bottom: '15%', right: -40, width: 200, height: 200, backgroundColor: 'rgba(34,197,94,0.10)' },
  orbViolet: { top: '45%', left: '25%', width: 280, height: 280, backgroundColor: 'rgba(139,92,246,0.06)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  logoBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#f4b942', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  logoIcon: { color: '#fff', fontSize: 22, fontWeight: '800' },
  brandText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderRadius: 20, padding: 24, overflow: 'hidden',
  },
  shine: {
    position: 'absolute', top: -100, left: -100,
    width: 300, height: 300,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '12deg' }],
  },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, color: '#fff',
  },
  mismatchText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  btn: {
    borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 22,
    shadowColor: '#f4b942', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginHorizontal: 12, textTransform: 'uppercase', fontWeight: '500' },
  oauthRow: { flexDirection: 'row', gap: 12 },
  oauthBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderRadius: 14, paddingVertical: 13, gap: 8,
  },
  oauthIcon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  oauthLabel: { color: '#fff', fontSize: 14, fontWeight: '500' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 4,
  },
  errorText: { color: '#f87171', fontSize: 13 },
  linkBtn: { alignItems: 'center', marginTop: 24 },
  linkText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
  linkAccent: { color: '#f4b942', fontWeight: '600' },
});
