import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
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
  const [status, setStatus] = useState<string>(project?.status ?? 'Active');
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
      status: status as any,
      progress: Number(progress) || 0,
      hook,
    });

    navigation.navigate('Main');
  };

  const markComplete = () => {
    store.updateProject(project.id, {
      status: 'Completed',
      phase: 'Complete',
      progress: 100,
    });

    setStatus('Completed');
    setPhase('Complete');
    setProgress('100');
  };

  const reopenProject = () => {
    store.updateProject(project.id, {
      status: 'Active',
    });

    setStatus('Active');
  };

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

        <TextInput
          value={status}
          onChangeText={text => setStatus(text)}
          placeholder="Status"
          placeholderTextColor={colors.steel}
          style={inputStyle}
        />

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

        {project.status !== 'Completed' ? (
          <Pressable style={styles.completeButton} onPress={markComplete}>
            <AppText style={styles.completeButtonText}>
              Mark Project Complete
            </AppText>
          </Pressable>
        ) : (
          <Pressable style={styles.reopenButton} onPress={reopenProject}>
            <AppText style={styles.reopenButtonText}>
              Reopen Project
            </AppText>
          </Pressable>
        )}

        {project.completedAt ? (
          <AppText style={styles.completedDate}>
            Completed: {new Date(project.completedAt).toLocaleDateString()}
          </AppText>
        ) : null}
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