import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function ProjectEditScreen({ navigation }: NativeStackScreenProps<any>) {
  const store = useFabricatorStore();
  const project = store.activeProject();

  const [name, setName] = useState(project?.name ?? '');
  const [category, setCategory] = useState<string>(project?.category ?? 'Metal Fabrication');
  const [budgetTarget, setBudgetTarget] = useState(
  String(project?.budgetTarget || '')
    );
  const [phase, setPhase] = useState<string>(project?.phase ?? 'Planning');
  const [progress, setProgress] = useState(String(project?.progress ?? 0));
  const [hook, setHook] = useState(project?.hook ?? '');

  if (!project) {
    return (
      <Screen>
        <Title>No active project</Title>
      </Screen>
    );
  }

  const save = () => {
    store.updateProject(project.id, {
      name: name.trim() || project.name,
      category: category as any,
      phase: phase as any,
      budgetTarget: budgetTarget
      ? Number(budgetTarget)
      : 0,
      progress: Number(progress) || 0,
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

      <Title>Edit Build Profile</Title>

      <AppText style={{ marginVertical: 12 }}>
        Configure project identity, lifecycle state, workshop visibility,
        and build progress.
      </AppText>

      <Card>
        <Label>PROJECT DETAILS</Label>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Project name"
          placeholderTextColor={colors.steel}
          style={inputStyle}
        />

        <TextInput
          value={category}
          onChangeText={text => setCategory(text)}
          placeholder="Category"
          placeholderTextColor={colors.steel}
          style={inputStyle}
        />
        <TextInput
          placeholder="Budget Target"
          placeholderTextColor={colors.steel}
          value={budgetTarget}
          onChangeText={setBudgetTarget}
          keyboardType="numeric"
          style={inputStyle}
        />
        <TextInput
          value={phase}
          onChangeText={text => setPhase(text)}
          placeholder="Phase"
          placeholderTextColor={colors.steel}
          style={inputStyle}
        />

        <View style={styles.statusSummary}>
          <Label>STATUS</Label>

          <AppText style={styles.statusValue}>
            {statusLabel}
          </AppText>
        </View>

        <TextInput
          value={progress}
          onChangeText={text => setProgress(text)}
          placeholder="Progress percent"
          placeholderTextColor={colors.steel}
          keyboardType="numeric"
          style={inputStyle}
        />

        <TextInput
          value={hook}
          onChangeText={text => setHook(text)}
          placeholder="Project hook"
          placeholderTextColor={colors.steel}
          multiline
          style={[inputStyle, { minHeight: 90 }]}
        />

        <Button title="Save project" onPress={save} />

        <View style={{ height: 10 }} />

        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
      </Card>

      <Card style={{ marginTop: 18 }}>
        <Label>PROJECT LIFECYCLE</Label>

        <AppText style={styles.lifecycleText}>
          Completed projects move into the completed builds archive while
          remaining fully accessible for documentation and history tracking.
        </AppText>

        {project.status === 'active' ? (
          <Pressable style={styles.completeButton} onPress={markComplete}>
            <AppText style={styles.completeButtonText}>
              Complete Project
            </AppText>
          </Pressable>
        ) : null}

        {project.status === 'completed' ? (
          <Pressable style={styles.archiveButton} onPress={archiveProject}>
            <AppText style={styles.archiveButtonText}>
              Archive Project
            </AppText>
          </Pressable>
        ) : null}

        {project.status === 'archived' ? (
          <Pressable style={styles.reopenButton} onPress={reopenProject}>
            <AppText style={styles.reopenButtonText}>
              Reopen Project
            </AppText>
          </Pressable>
        ) : null}

        {project.completedAt ? (
          <AppText style={styles.completedDate}>
            Completed: {new Date(project.completedAt).toLocaleDateString()}
          </AppText>
        ) : null}

        {project.archivedAt ? (
          <AppText style={styles.completedDate}>
            Archived: {new Date(project.archivedAt).toLocaleDateString()}
          </AppText>
        ) : null}
      </Card>

      <Card style={{ marginTop: 18 }}>
        <Label>DANGER ZONE</Label>

        <AppText style={styles.lifecycleText}>
          Delete removes this project and all related tasks, parts, notes,
          garage sessions, photos, and timeline items.
        </AppText>

        <Pressable style={styles.deleteButton} onPress={deleteProject}>
          <AppText style={styles.deleteButtonText}>
            Delete Project
          </AppText>
        </Pressable>
      </Card>
    </Screen>
  );
}

const inputStyle = {
  backgroundColor: colors.graphite,
  borderWidth: 1,
  borderColor: colors.line,
  color: colors.white,
  padding: spacing.md,
  borderRadius: radius.md,
  marginBottom: 14,
};

const styles = {
  lifecycleText: {
    marginTop: 12,
    marginBottom: 18,
    color: colors.steel,
    lineHeight: 22,
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
    fontWeight: '900' as const,
    marginTop: 6,
  },

  completeButton: {
    backgroundColor: '#1F3A29',
    borderWidth: 1,
    borderColor: '#2E7D4F',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  completeButtonText: {
    color: '#7DFFB2',
    fontWeight: '900' as const,
    fontSize: 16,
  },

  reopenButton: {
    backgroundColor: '#2A1612',
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  archiveButton: {
    backgroundColor: '#241F19',
    borderWidth: 1,
    borderColor: '#6B5A44',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  archiveButtonText: {
    color: '#B9A58A',
    fontWeight: '900' as const,
    fontSize: 16,
  },

  deleteButton: {
    backgroundColor: '#351311',
    borderWidth: 1,
    borderColor: '#B8423A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  deleteButtonText: {
    color: '#FF8A80',
    fontWeight: '900' as const,
    fontSize: 16,
  },

  reopenButtonText: {
    color: colors.orange,
    fontWeight: '900' as const,
    fontSize: 16,
  },

  completedDate: {
    marginTop: 16,
    color: colors.steel,
    textAlign: 'center' as const,
  },
};
