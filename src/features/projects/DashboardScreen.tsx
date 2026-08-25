import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildPhoto, BuildTask, Part, ProjectStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget';
import { exportProjectRecord } from '@/services/export/projectExportService';

function formatCurrency(value?: number) {
  const safeValue = Number(value || 0);
  const prefix = safeValue < 0 ? '-$' : '$';
  return `${prefix}${Math.abs(safeValue).toLocaleString()}`;
}

function formatBudgetInput(value?: number) {
  if (!value) return '';
  return String(value);
}

function parseBudgetInput(value: string) {
  const normalized = value.replace(/[$,\s]/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
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
  const [isExporting, setIsExporting] = useState(false);
  const [isBudgetEditing, setIsBudgetEditing] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState('');
  const hasDataIssue = store.dataStatus !== 'local-ready';

  useEffect(() => {
    if (!project) {
      navigation.navigate('Welcome');
    }
  }, [navigation, project]);

  useEffect(() => {
    setBudgetDraft(formatBudgetInput(project?.expectedBudget ?? project?.budgetTarget));
    setIsBudgetEditing(false);
  }, [project?.budgetTarget, project?.expectedBudget, project?.id]);

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
  const projectActivities = store.activities.filter(activity => activity.projectId === project.id);
  const projectVoiceNotes = store.voiceNotes.filter(note => note.projectId === project.id);
  const openGarage = () => navigation.navigate('Welcome');

  const saveBudget = () => {
    const nextBudget = parseBudgetInput(budgetDraft);

    store.updateProject(project.id, {
      expectedBudget: nextBudget,
      budgetTarget: nextBudget,
    });

    setBudgetDraft(formatBudgetInput(nextBudget));
    setIsBudgetEditing(false);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const result = await exportProjectRecord({
        project,
        tasks: projectTasks,
        parts: projectParts,
        photos: projectPhotos,
        activities: projectActivities,
        voiceNotes: projectVoiceNotes,
      });

      Alert.alert(
        'Project export saved',
        `${result.fileName} was saved to Fabricator local document storage.\n\n${result.uri}`
      );
    } catch {
      Alert.alert(
        'Export did not finish',
        'Fabricator could not create the project export from local data. Try again after reopening the app.'
      );
    } finally {
      setIsExporting(false);
    }
  };

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

              <View style={styles.titleActions}>
                <Pressable style={styles.garageButton} onPress={openGarage}>
                  <MaterialCommunityIcons name="garage-open-variant" size={16} color={colors.black} />
                  <AppText style={styles.garageText}>Garage</AppText>
                </Pressable>

                <Pressable style={styles.editButton} onPress={() => navigation.navigate('ProjectEdit')}>
                  <MaterialCommunityIcons name="square-edit-outline" size={16} color={colors.orange} />
                  <AppText style={styles.editText}>Edit</AppText>
                </Pressable>
              </View>
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
              <BudgetChip label="Left" value={formatCurrency(remainingBudget)} tone={remainingBudget >= 0 ? 'good' : 'warning'} />
            </View>

            {isBudgetEditing ? (
              <View style={styles.budgetEditor}>
                <TextInput
                  value={budgetDraft}
                  onChangeText={setBudgetDraft}
                  placeholder="Project budget"
                  placeholderTextColor={colors.steel}
                  keyboardType="numeric"
                  style={styles.budgetInput}
                />

                <View style={styles.budgetEditorActions}>
                  <Pressable style={styles.budgetSaveButton} onPress={saveBudget}>
                    <MaterialCommunityIcons name="check" size={17} color={colors.black} />
                    <AppText style={styles.budgetSaveText}>Save</AppText>
                  </Pressable>

                  <Pressable
                    style={styles.budgetCancelButton}
                    onPress={() => {
                      setBudgetDraft(formatBudgetInput(expectedBudget));
                      setIsBudgetEditing(false);
                    }}
                  >
                    <AppText style={styles.budgetCancelText}>Cancel</AppText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.changeBudgetButton, pressed && styles.pressed]}
                onPress={() => setIsBudgetEditing(true)}
              >
                <MaterialCommunityIcons name="cash-edit" size={17} color={colors.orange} />
                <AppText style={styles.changeBudgetText}>Change Budget</AppText>
              </Pressable>
            )}
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

        <Card style={styles.dataTrustCard}>
          <View style={styles.dataTrustTop}>
            <View style={styles.dataTrustIcon}>
              <MaterialCommunityIcons name="shield-check-outline" size={21} color={colors.orange} />
            </View>

            <View style={{ flex: 1 }}>
              <AppText style={styles.dataTrustTitle}>Local build record</AppText>
              <AppText style={styles.dataTrustCopy}>
                {store.dataStatusMessage} Export creates a readable Markdown record from the data available locally.
              </AppText>
            </View>
          </View>

          {hasDataIssue ? (
            <View style={styles.dataWarning}>
              <MaterialCommunityIcons name="alert-outline" size={16} color={colors.orange} />
              <AppText style={styles.dataWarningText}>
                Export important project records before continuing heavy edits.
              </AppText>
            </View>
          ) : null}

          <Pressable
            disabled={isExporting}
            onPress={handleExport}
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.pressed,
              isExporting && styles.disabledButton,
            ]}
          >
            <MaterialCommunityIcons name="file-export-outline" size={18} color={colors.black} />
            <AppText style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export Project'}
            </AppText>
          </Pressable>
        </Card>

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
  titleActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  projectTitle: {
    fontSize: 31,
    lineHeight: 35,
    marginTop: 5,
  },
  garageButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.orange,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  garageText: {
    color: colors.black,
    fontWeight: '900',
    fontSize: 12,
  },
  editButton: {
    minHeight: 38,
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
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  budgetChip: {
    flexGrow: 1,
    flexBasis: '31%',
    minWidth: 92,
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
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  budgetValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  changeBudgetButton: {
    minHeight: 42,
    marginTop: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.48)',
    backgroundColor: colors.orangeSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changeBudgetText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 13,
  },
  budgetEditor: {
    marginTop: 10,
    gap: 10,
  },
  budgetInput: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.48)',
    backgroundColor: colors.black,
    color: colors.white,
    paddingHorizontal: 13,
    fontSize: 16,
    fontWeight: '800',
  },
  budgetEditorActions: {
    flexDirection: 'row',
    gap: 10,
  },
  budgetSaveButton: {
    minHeight: 42,
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  budgetSaveText: {
    color: colors.black,
    fontWeight: '900',
  },
  budgetCancelButton: {
    minHeight: 42,
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCancelText: {
    color: colors.white,
    fontWeight: '900',
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
  dataTrustCard: {
    borderColor: 'rgba(96,165,250,0.32)',
    marginBottom: 14,
  },
  dataTrustTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dataWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.orangeSoft,
    borderColor: 'rgba(217,106,29,0.35)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 12,
  },
  dataWarningText: {
    flex: 1,
    color: colors.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  dataTrustIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataTrustTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  dataTrustCopy: {
    color: colors.steel,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  exportButton: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonText: {
    color: colors.black,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.62,
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
