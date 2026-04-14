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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await signIn(email.trim(), password);
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

  return (
    <View style={styles.container}>
      {/* Dark background with gradient orbs */}
      <View style={styles.bgOrbs}>
        <View style={[styles.orb, styles.orbAmber]} />
        <View style={[styles.orb, styles.orbCyan]} />
        <View style={[styles.orb, styles.orbViolet]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LinearGradient
                colors={['#f4b942', '#d4952a']}
                style={styles.logoBox}>
                <Text style={styles.logoIcon}>H</Text>
              </LinearGradient>
              <Text style={styles.brandText}>HUMAID</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your dashboard and insights</Text>
          </View>

          {/* Glassmorphic Card */}
          <View style={styles.glassCard}>
            {/* Shine overlay */}
            <View style={styles.shine} />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
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

            {/* Password */}
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={(t) => { clearError(); setPassword(t); }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity onPress={handleSignIn} disabled={loading} activeOpacity={0.8}>
              <LinearGradient
                colors={['#f4b942', '#d4952a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btn, loading && { opacity: 0.7 }]}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth buttons */}
            <View style={styles.oauthRow}>
              <TouchableOpacity
                style={styles.oauthBtn}
                onPress={handleGoogleSignIn}
                disabled={loading}>
                <Text style={styles.oauthIcon}>G</Text>
                <Text style={styles.oauthLabel}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.oauthBtn} disabled={loading}>
                <Text style={styles.oauthIcon}>GH</Text>
                <Text style={styles.oauthLabel}>GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkAccent}>Sign up</Text>
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
  orbAmber: {
    top: '15%', left: -40, width: 200, height: 200,
    backgroundColor: 'rgba(244,185,66,0.15)',
  },
  orbCyan: {
    bottom: '20%', right: -40, width: 200, height: 200,
    backgroundColor: 'rgba(110,198,232,0.10)',
  },
  orbViolet: {
    top: '40%', left: '20%', width: 300, height: 300,
    backgroundColor: 'rgba(139,92,246,0.06)',
  },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logoBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#f4b942', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  logoIcon: { color: '#fff', fontSize: 22, fontWeight: '800' },
  brandText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6, textAlign: 'center' },

  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute', top: -100, left: -100,
    width: 300, height: 300,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '12deg' }],
  },

  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 14 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { color: '#f4b942', fontSize: 12, fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#fff',
  },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500' },

  btn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#f4b942',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginHorizontal: 12, textTransform: 'uppercase', fontWeight: '500' },

  oauthRow: { flexDirection: 'row', gap: 12 },
  oauthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
  },
  oauthIcon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  oauthLabel: { color: '#fff', fontSize: 14, fontWeight: '500' },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  errorText: { color: '#f87171', fontSize: 13 },

  linkBtn: { alignItems: 'center', marginTop: 24 },
  linkText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
  linkAccent: { color: '#f4b942', fontWeight: '600' },
});
