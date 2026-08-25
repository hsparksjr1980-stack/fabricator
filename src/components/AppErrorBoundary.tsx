import { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText, Label, Title } from '@/components/Text';
import { colors, radius, spacing } from '@/theme/theme';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Fabricator recovered from an app error', {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.screen}>
        <View style={styles.panel}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={32}
              color={colors.orange}
            />
          </View>

          <Label>FABRICATOR RECOVERED</Label>

          <Title style={styles.title}>
            Something interrupted the app
          </Title>

          <AppText style={styles.copy}>
            Your local build data was not intentionally changed. Try returning to Fabricator; if this repeats, restart the app before continuing work.
          </AppText>

          <Pressable style={styles.button} onPress={this.reset}>
            <AppText style={styles.buttonText}>Return to Fabricator</AppText>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelHigh,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    lineHeight: 33,
    marginTop: 6,
  },
  copy: {
    color: colors.steel,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.black,
    fontWeight: '900',
  },
});
