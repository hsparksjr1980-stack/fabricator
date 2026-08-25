import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText, Label, Title } from '@/components/Text';
import { ProjectStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

type Props = {
  visible: boolean;
  projectStatus?: ProjectStatus;
  onClose: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onReopen: () => void;
};

function ActionRow({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={21} color={colors.orange} />
      </View>

      <View style={{ flex: 1 }}>
        <AppText style={styles.actionTitle}>{title}</AppText>
        <AppText style={styles.actionDetail}>{detail}</AppText>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.steel} />
    </Pressable>
  );
}

export function ProjectManagementModal({
  visible,
  projectStatus,
  onClose,
  onComplete,
  onArchive,
  onReopen,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Label>PROJECT</Label>
              <Title style={styles.title}>Manage Build</Title>
              <AppText style={styles.copy}>
                Change lifecycle state without deleting build history.
              </AppText>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={colors.white} />
            </Pressable>
          </View>

          {projectStatus === 'active' ? (
            <ActionRow
              icon="check-decagram-outline"
              title="Complete Project"
              detail="Move this build to Completed. It stays viewable."
              onPress={onComplete}
            />
          ) : null}

          {projectStatus === 'completed' ? (
            <ActionRow
              icon="archive-outline"
              title="Archive Project"
              detail="Move this completed build out of the active library."
              onPress={onArchive}
            />
          ) : null}

          {projectStatus === 'archived' ? (
            <ActionRow
              icon="garage-open-variant"
              title="Reopen Project"
              detail="Return this build to the active project list."
              onPress={onReopen}
            />
          ) : null}

          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <AppText style={styles.secondaryText}>Close</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.panelHigh,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderColor: colors.line,
    borderWidth: 1,
    padding: spacing.lg,
  },
  handle: {
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 25,
    lineHeight: 30,
    marginTop: 3,
  },
  copy: {
    color: colors.steel,
    lineHeight: 19,
    marginTop: 5,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    minHeight: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.charcoal,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  actionDetail: {
    color: colors.steel,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.white,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
