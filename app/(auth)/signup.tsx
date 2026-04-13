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
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { signUp, loading, error, clearError } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) return;
    if (password !== confirm) return;
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
    } catch {
      // error is set in context
    }
  };

  const passwordMismatch = confirm.length > 0 && password !== confirm;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>HUMAID</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create your account
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: '#fef2f2' }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
            placeholder="Your name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />

          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(t) => { clearError(); setEmail(t); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={(t) => { clearError(); setPassword(t); }}
            secureTextEntry
          />

          <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: passwordMismatch ? colors.danger : colors.border },
            ]}
            placeholder="Repeat your password"
            placeholderTextColor={colors.textSecondary}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
          {passwordMismatch && (
            <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
              Passwords do not match
            </Text>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: passwordMismatch ? 0.5 : 1 }]}
            onPress={handleSignUp}
            disabled={loading || passwordMismatch}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.back()}>
            <Text style={{ color: colors.textSecondary }}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  brand: { fontSize: 36, fontWeight: '800', letterSpacing: 2 },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 16, padding: 24, borderWidth: 1 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, padding: 14, fontSize: 16, borderWidth: 1 },
  btn: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  errorBox: { borderRadius: 8, padding: 12, marginBottom: 8 },
  errorText: { color: '#dc2626', fontSize: 14 },
});
