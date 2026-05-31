import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import {
  ProjectCategory,
  ProjectPhase,
} from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Vehicle',
  'Woodworking',
  'Electronics',
  'Home Improvement',
  'Fabrication',
  'Crafts',
  'General',
];

const PROJECT_PHASES: ProjectPhase[] = [
  'Planning',
  'Design',
  'Parts Gathering',
  'In Progress',
  'Testing',
  'Finishing',
  'Complete',
];

function normalizeCategory(value?: string): ProjectCategory {
  if (
    value &&
    PROJECT_CATEGORIES.includes(value as ProjectCategory)
  ) {
    return value as ProjectCategory;
  }

  if (
    value === 'Metal Fabrication' ||
    value === 'Restoration' ||
    value === 'Race Build' ||
    value === 'Motorcycle Build'
  ) {
    return 'Vehicle';
  }

  return 'General';
}

function normalizePhase(value?: string): ProjectPhase {
  if (
    value &&
    PROJECT_PHASES.includes(value as ProjectPhase)
  ) {
    return value as ProjectPhase;
  }

  if (value === 'Assembly') {
    return 'In Progress';
  }

  if (value === 'Fabrication') {
    return 'In Progress';
  }

  return 'Planning';
}

function budgetToString(
  expectedBudget?: number,
  budgetTarget?: number
) {
  const value =
    typeof expectedBudget === 'number'
      ? expectedBudget
      : typeof budgetTarget === 'number'
      ? budgetTarget
      : 0;

  return value > 0 ? String(value) : '';
}

function parseBudget(value: string) {
  const normalized = value.replace(/[$,]/g, '').trim();

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProjectEditScreen({
  navigation,
}: NativeStackScreenProps<any>) {
  const store = useFabricatorStore();
  const project = store.activeProject();

  const [name, setName] = useState(project?.name ?? '');

  const [category, setCategory] =
    useState<ProjectCategory>(
      normalizeCategory(project?.category)
    );

  const [expectedBudget, setExpectedBudget] =
    useState(
      budgetToString(
        project?.expectedBudget,
        project?.budgetTarget
      )
    );

  const [phase, setPhase] =
    useState<ProjectPhase>(
      normalizePhase(project?.phase)
    );

  const [progress, setProgress] = useState(
    String(project?.progress ?? 0)
  );

  const [hook, setHook] = useState(project?.hook ?? '');

  if (!project) {
    return (
      <Screen>
        <Title>No active project</Title>
      </Screen>
    );
  }

  const save = () => {
    const budget = parseBudget(expectedBudget);
    const progressValue = Math.max(
      0,
      Math.min(100, Number(progress) || 0)
    );

    store.updateProject(project.id, {
      name: name.trim() || project.name,
      category,
      phase,
      expectedBudget: budget,
      budgetTarget: budget,
      progress: progressValue,
      hook,
    });

    navigation.navigate('Main');
  };

  const markComplete = () => {
    Alert.alert(
      'Complete project?',
      'This moves the project to Completed. It stays viewable and can still be archived later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Project',
          onPress: () => {
            store.completeProject(project.id);
            setPhase('Complete');
            setProgress('100');
          },
        },
      ]
    );
  };

  const archiveProject = () => {
    Alert.alert(
      'Archive project?',
      'This moves the project to Archived. It remains viewable and can be reopened later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive Project',
          onPress: () => store.archiveProject(project.id),
        },
      ]
    );
  };

  const reopenProject = () => {
    Alert.alert(
      'Reopen project?',
      'This returns the project to Active and clears completed/archive timestamps.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reopen Project',
          onPress: () => store.reopenProject(project.id),
        },
      ]
    );
  };

  const deleteProject = () => {
    Alert.alert(
      'Delete project?',
      'This permanently removes the project and all related tasks, parts, notes, garage sessions, photos, and timeline items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Project',
          style: 'destructive',
          onPress: () => {
            store.deleteProject(project.id);
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  const statusLabel =
    project.status === 'active'
      ? 'Active'
      : project.status === 'completed'
      ? 'Completed'
      : 'Archived';

  return (
    <Screen>
      <Label>PROJECT CONFIGURATION</Label>

      <Title style={styles.screenTitle}>
        Edit Build Profile
      </Title>

      <AppText style={styles.screenIntro}>
        Set the project category, phase, budget, lifecycle state,
        and build progress.
      </AppText>

      <Card>
        <Label>PROJECT DETAILS</Label>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Project name"
          placeholderTextColor={colors.steel}
          style={styles.input}
        />

        <View style={styles.fieldGroup}>
          <View style={styles.fieldHeader}>
            <Label>CATEGORY</Label>
            <AppText style={styles.selectedValue}>
              {category}
            </AppText>
          </View>

          <View style={styles.chipGrid}>
            {PROJECT_CATEGORIES.map(item => (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.choiceChip,
                  category === item &&
                    styles.choiceChipActive,
                ]}
              >
                <AppText
                  style={[
                    styles.choiceText,
                    category === item &&
                      styles.choiceTextActive,
                  ]}
                >
                  {item}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <TextInput
          placeholder="Expected Budget"
          placeholderTextColor={colors.steel}
          value={expectedBudget}
          onChangeText={setExpectedBudget}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.fieldGroup}>
          <View style={styles.fieldHeader}>
            <Label>PHASE</Label>
            <AppText style={styles.selectedValue}>
              {phase}
            </AppText>
          </View>

          <View style={styles.chipGrid}>
            {PROJECT_PHASES.map(item => (
              <Pressable
                key={item}
                onPress={() => setPhase(item)}
                style={[
                  styles.choiceChip,
                  phase === item &&
                    styles.choiceChipActive,
                ]}
              >
                <AppText
                  style={[
                    styles.choiceText,
                    phase === item &&
                      styles.choiceTextActive,
                  ]}
                >
                  {item}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.statusSummary}>
          <Label>STATUS</Label>

          <AppText style={styles.statusValue}>
            {statusLabel}
          </AppText>
        </View>

        <TextInput
          value={progress}
          onChangeText={setProgress}
          placeholder="Progress percent"
          placeholderTextColor={colors.steel}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          value={hook}
          onChangeText={setHook}
          placeholder="Project hook or short description"
          placeholderTextColor={colors.steel}
          multiline
          style={[styles.input, styles.notesInput]}
        />

        <Button title="Save project" onPress={save} />

        <View style={styles.buttonSpacer} />

        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Label>PROJECT LIFECYCLE</Label>

        <AppText style={styles.lifecycleText}>
          Completed projects move into the completed builds archive
          while remaining accessible for documentation and history.
        </AppText>

        {project.status === 'active' ? (
          <Pressable
            style={styles.completeButton}
            onPress={markComplete}
          >
            <AppText style={styles.completeButtonText}>
              Complete Project
            </AppText>
          </Pressable>
        ) : null}

        {project.status === 'completed' ? (
          <Pressable
            style={styles.archiveButton}
            onPress={archiveProject}
          >
            <AppText style={styles.archiveButtonText}>
              Archive Project
            </AppText>
          </Pressable>
        ) : null}

        {project.status === 'archived' ? (
          <Pressable
            style={styles.reopenButton}
            onPress={reopenProject}
          >
            <AppText style={styles.reopenButtonText}>
              Reopen Project
            </AppText>
          </Pressable>
        ) : null}

        {project.completedAt ? (
          <AppText style={styles.completedDate}>
            Completed:{' '}
            {new Date(project.completedAt).toLocaleDateString()}
          </AppText>
        ) : null}

        {project.archivedAt ? (
          <AppText style={styles.completedDate}>
            Archived:{' '}
            {new Date(project.archivedAt).toLocaleDateString()}
          </AppText>
        ) : null}
      </Card>

      <Card style={styles.sectionCard}>
        <Label>DANGER ZONE</Label>

        <AppText style={styles.lifecycleText}>
          Delete removes this project and all related tasks, parts,
          notes, garage sessions, photos, and timeline items.
        </AppText>

        <Pressable
          style={styles.deleteButton}
          onPress={deleteProject}
        >
          <AppText style={styles.deleteButtonText}>
            Delete Project
          </AppText>
        </Pressable>
      </Card>

      <View style={styles.bottomSpacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    marginTop: 4,
  },

  screenIntro: {
    marginVertical: 12,
    color: colors.steel,
    lineHeight: 21,
  },

  input: {
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: 14,
  },

  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  fieldGroup: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
  },

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  selectedValue: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  choiceChip: {
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  choiceChipActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },

  choiceText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },

  choiceTextActive: {
    color: colors.white,
  },

  statusSummary: {
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
  },

  statusValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },

  buttonSpacer: {
    height: 10,
  },

  sectionCard: {
    marginTop: 18,
  },

  lifecycleText: {
    marginTop: 12,
    marginBottom: 18,
    color: colors.steel,
    lineHeight: 22,
  },

  completeButton: {
    backgroundColor: '#1F3A29',
    borderWidth: 1,
    borderColor: '#2E7D4F',
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  completeButtonText: {
    color: '#7DFFB2',
    fontWeight: '900',
    fontSize: 16,
  },

  reopenButton: {
    backgroundColor: '#2A1612',
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reopenButtonText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 16,
  },

  archiveButton: {
    backgroundColor: '#241F19',
    borderWidth: 1,
    borderColor: '#6B5A44',
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  archiveButtonText: {
    color: '#B9A58A',
    fontWeight: '900',
    fontSize: 16,
  },

  deleteButton: {
    backgroundColor: '#351311',
    borderWidth: 1,
    borderColor: '#B8423A',
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButtonText: {
    color: '#FF8A80',
    fontWeight: '900',
    fontSize: 16,
  },

  completedDate: {
    marginTop: 16,
    color: colors.steel,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 80,
  },
});
