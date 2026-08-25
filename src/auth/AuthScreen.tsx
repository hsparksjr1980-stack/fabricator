import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { colors, radius, spacing } from '@/theme/theme';
import { useAuth } from './AuthProvider';

function friendlyAuthError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : '';

  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to')
  ) {
    return 'Fabricator could not reach account services. Check your connection and try again.';
  }

  if (
    message.includes('invalid login') ||
    message.includes('invalid credentials')
  ) {
    return 'That email and password did not match. Check them and try again.';
  }

  if (message.includes('email')) {
    return 'Check the email address and try again.';
  }

  return 'Something went wrong with account access. Please try again.';
}

export function AuthScreen() {
  const { signIn, signUp, resetPassword, authError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    'signin'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert(
        'Missing information',
        'Please enter email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === 'signup') {
        await signUp(email, password);

        Alert.alert(
          'Account created',
          'Check your email for confirmation.'
        );
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      Alert.alert(
        'Account access problem',
        friendlyAuthError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert(
        'Email required',
        'Enter your email address to reset your password.'
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email);

      Alert.alert(
        'Password reset sent',
        'Check your email for password reset instructions.'
      );
    } catch (error) {
      Alert.alert(
        'Password reset problem',
        friendlyAuthError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Label>Fabricator</Label>

      <Title>
        {mode === 'signup'
          ? 'Create Account'
          : 'Welcome Back'}
      </Title>

      {authError ? (
        <View style={styles.backendNotice}>
          <AppText style={styles.backendNoticeTitle}>
            Account services unavailable
          </AppText>
          <AppText style={styles.backendNoticeText}>
            {authError}
          </AppText>
        </View>
      ) : null}

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.steel}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.steel}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {mode === 'signin' && (
          <Pressable onPress={handleForgotPassword}>
            <AppText style={styles.forgotPasswordText}>
              Forgot password?
            </AppText>
          </Pressable>
        )}

        <Pressable
          onPress={handleSubmit}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <AppText style={styles.buttonText}>
              {mode === 'signup'
                ? 'Create Account'
                : 'Sign In'}
            </AppText>
          )}
        </Pressable>

        <Pressable
          onPress={() =>
            setMode(
              mode === 'signin'
                ? 'signup'
                : 'signin'
            )
          }
        >
          <AppText style={styles.switchText}>
            {mode === 'signin'
              ? 'Need an account? Create one'
              : 'Already have an account? Sign in'}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },

  backendNotice: {
    marginTop: spacing.lg,
    backgroundColor: '#2A1612',
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  backendNoticeTitle: {
    color: colors.orange,
    fontWeight: '900',
    marginBottom: 6,
  },

  backendNoticeText: {
    color: colors.white,
    lineHeight: 20,
  },

  input: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.white,
    padding: spacing.md,
    fontSize: 16,
  },

  forgotPasswordText: {
    color: colors.orange,
    textAlign: 'right',
    marginTop: -4,
    marginBottom: spacing.sm,
    fontSize: 13,
  },

  button: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  buttonText: {
    color: colors.black,
    fontWeight: '900',
  },

  switchText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.orange,
  },
});
