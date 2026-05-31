import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildPhoto, BuildTask, Part, ProjectStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget';

function formatCurrency(value?: number) {
  const safeValue = Number(value || 0);
  return `$${safeValue.toLocaleString()}`;
}

function statusLabel(status: ProjectStatus) {
  if (status === 'completed') return 'Completed';
  if (status === 'archived') return 'Archived';
  return 'Active';
}

function statusIcon(status: ProjectStatus): keyof typeof MaterialCommunityIcons.glyphMap {
  if (status === 'completed') return 'check-decagram-outline';
  if (status === 'archived') return 'archive-outline';
  return 'garage-open-variant';
}

function BudgetChip({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warning' }) {
  return (
    <View style={styles.budgetChip}>
      <AppText style={styles.budgetLabel}>{label}</AppText>
      <AppText style={[styles.budgetValue, tone === 'good' && styles.goodValue, tone === 'warning' && styles.warningValue]}>
        {value}
      </AppText>
    </View>
  );
}

function NavTile({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navTile, pressed && styles.pressed]}>
      <View style={styles.navIconWrap}>
        <MaterialCommunityIcons name={icon} size={19} color={colors.orange} />
      </View>
      <View style={styles.navTextWrap}>
        <AppText style={styles.navValue}>{value}</AppText>
        <AppText style={styles.navLabel}>{label}</AppText>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.steel} />
    </Pressable>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const store = useFabricatorStore();
  const project = store.activeProject();

  useEffect(() => {
    if (!project) {
      navigation.navigate('Welcome');
    }
  }, [navigation, project]);

  if (!project) return null;

  const projectTasks = store.tasks.filter((task: BuildTask) => task.projectId === project.id);
  const projectParts = store.parts.filter((part: Part) => part.projectId === project.id);
  const projectPhotos = store.photos.filter((photo: BuildPhoto) => photo.projectId === project.id);
  const coverPhoto = store.photos.find((photo: BuildPhoto) => photo.id === project.coverPhotoId) || projectPhotos[0];

  const completedTasks = projectTasks.filter(task => task.status === 'Done' || task.status === 'Completed').length;
  const totalTasks = projectTasks.length;
  const progress = Math.max(0, Math.min(project.progress || 0, 100));
  const expectedBudget = project.expectedBudget ?? project.budgetTarget ?? 0;
  const actualSpend = projectParts.reduce((sum, part) => sum + (part.actualCost || 0), 0);
  const remainingBudget = expectedBudget - actualSpend;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          {coverPhoto?.uri ? (
            <Image source={{ uri: coverPhoto.uri }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <MaterialCommunityIcons name="hammer-wrench" size={34} color={colors.orange} />
            </View>
          )}

          <View style={styles.heroBody}>
            <View style={styles.titleRow}>
              <View style={styles.titleColumn}>
                <Label>PROJECT DASHBOARD</Label>
                <Title style={styles.projectTitle}>{project.name}</Title>
              </View>

              <Pressable style={styles.editButton} onPress={() => navigation.navigate('ProjectEdit')}>
                <MaterialCommunityIcons name="square-edit-outline" size={16} color={colors.orange} />
                <AppText style={styles.editText}>Edit</AppText>
              </Pressable>
            </View>

            <View style={styles.metaWrap}>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="shape-outline" size={13} color={colors.orange} />
                <AppText style={styles.metaText}>{project.category || 'General'}</AppText>
              </View>

              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="timeline-clock-outline" size={13} color={colors.orange} />
                <AppText style={styles.metaText}>{project.phase || 'Planning'}</AppText>
              </View>

              <View style={[styles.statusPill, project.status === 'completed' && styles.statusComplete, project.status === 'archived' && styles.statusArchived]}>
                <MaterialCommunityIcons name={statusIcon(project.status)} size={13} color={colors.white} />
                <AppText style={styles.statusText}>{statusLabel(project.status)}</AppText>
              </View>
            </View>

            <View style={styles.progressPanel}>
              <View style={styles.progressTopRow}>
                <AppText style={styles.progressTitle}>Progress</AppText>
                <AppText style={styles.progressPercent}>{progress}%</AppText>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <AppText style={styles.progressMeta}>{completedTasks} of {totalTasks} tasks completed</AppText>
            </View>

            <View style={styles.budgetRow}>
              <BudgetChip label="Expected" value={formatCurrency(expectedBudget)} />
              <BudgetChip label="Actual" value={formatCurrency(actualSpend)} />
              <BudgetChip label="Remaining" value={formatCurrency(Math.abs(remainingBudget))} tone={remainingBudget >= 0 ? 'good' : 'warning'} />
            </View>
          </View>
        </Card>

        <View style={styles.navGrid}>
          <NavTile
            label="Tasks"
            value={projectTasks.length}
            icon="clipboard-check-outline"
            onPress={() => navigation.navigate('Tasks')}
          />
          <NavTile
            label="Parts"
            value={projectParts.length}
            icon="package-variant-closed"
            onPress={() => navigation.navigate('Parts')}
          />
          <NavTile
            label="Photos"
            value={projectPhotos.length}
            icon="image-multiple-outline"
            onPress={() => navigation.navigate('Photos')}
          />
        </View>

        <RecentActivityWidget />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
  },
  heroCard: {
    marginBottom: 14,
    padding: 12,
    borderColor: 'rgba(217,106,29,0.36)',
  },
  coverImage: {
    width: '100%',
    height: 132,
    borderRadius: 18,
    marginBottom: 12,
  },
  coverPlaceholder: {
    height: 132,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroBody: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 31,
    lineHeight: 35,
    marginTop: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.56)',
    backgroundColor: colors.orangeSoft,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  editText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 12,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 13,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  metaText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.orange,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  statusComplete: {
    backgroundColor: colors.green,
  },
  statusArchived: {
    backgroundColor: colors.steel,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  progressPanel: {
    marginTop: 14,
    backgroundColor: colors.black,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  progressPercent: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 18,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.charcoal,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },
  progressMeta: {
    color: colors.steel,
    fontWeight: '800',
    fontSize: 12,
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  budgetChip: {
    flex: 1,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  budgetLabel: {
    color: colors.steel,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  budgetValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  goodValue: {
    color: colors.green,
  },
  warningValue: {
    color: colors.red,
  },
  navGrid: {
    gap: 10,
    marginBottom: 14,
  },
  navTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  navIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTextWrap: {
    flex: 1,
  },
  navValue: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
  },
  navLabel: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
