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

export function AuthScreen() {
  const { signIn, signUp } = useAuth();

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
    } catch (error: any) {
      Alert.alert(
        'Authentication Error',
        error.message ?? 'Something went wrong'
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

  input: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.white,
    padding: spacing.md,
    fontSize: 16,
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