import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

const projectImages = [
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
];

export function WelcomeScreen({ navigation }: NativeStackScreenProps<any>) {
  const { projects, selectProject, addProject, photos } = useFabricatorStore();

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('Metal Fabrication');
  const [phase, setPhase] = useState('Planning');
  const [budgetTarget, setBudgetTarget] = useState('');

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    return projects.filter(project => {
      const value = `${project.name} ${project.category} ${project.phase}`.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [projects, search]);

  const activeProjectList = filteredProjects.filter(
    project => project.status !== 'Completed'
  );

  const completedProjectList = filteredProjects.filter(
    project => project.status === 'Completed'
  );

  const activeProjects = projects.filter(
    project => project.status === 'Active'
  ).length;

  const completedProjects = projects.filter(
    project => project.status === 'Completed'
  ).length;

  const createProject = () => {
    if (!projectName.trim()) return;

    addProject({
      name: projectName.trim(),
      category: category as any,
      phase: phase as any,
      status: 'Active',
      budgetTarget: budgetTarget ? Number(budgetTarget) : 0,
    } as any);

    setProjectName('');
    setCategory('Metal Fabrication');
    setPhase('Planning');
    setBudgetTarget('');
    setShowCreate(false);
  };

  const openProject = (projectId: string) => {
    selectProject(projectId);
    navigation.navigate('Main');
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.heroLayout}>
          <View style={{ flex: 1 }}>
            <Image
              source={require('../../../assets/fabricator-logo.png')}
              style={styles.logo}
            />

            <Label>WORKSHOP PROJECTS</Label>

            <Title style={styles.heroTitle}>
              Your builds.{'\n'}Organized.
            </Title>

            <AppText style={styles.heroCopy}>
              Create projects to track fabrication notes, photos,
              materials, unfinished work, and build progress across the
              shop.
            </AppText>
          </View>

          <Pressable
            style={styles.newProjectTile}
            onPress={() => setShowCreate(!showCreate)}
          >
            <MaterialCommunityIcons
              name={showCreate ? 'close' : 'plus'}
              size={42}
              color={colors.white}
            />

            <AppText style={styles.newProjectText}>
              {showCreate ? 'Close' : 'New Project'}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color={colors.steel}
            />

            <TextInput
              placeholder="Search projects..."
              placeholderTextColor={colors.steel}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {showCreate ? (
          <Card style={styles.createCard}>
            <Label>CREATE NEW PROJECT</Label>

            <TextInput
              placeholder="Project name"
              placeholderTextColor={colors.steel}
              value={projectName}
              onChangeText={setProjectName}
              style={styles.input}
            />

            <TextInput
              placeholder="Category"
              placeholderTextColor={colors.steel}
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />

            <TextInput
              placeholder="Phase"
              placeholderTextColor={colors.steel}
              value={phase}
              onChangeText={setPhase}
              style={styles.input}
            />

            <TextInput
              placeholder="Budget Target"
              placeholderTextColor={colors.steel}
              value={budgetTarget}
              onChangeText={setBudgetTarget}
              keyboardType="numeric"
              style={styles.input}
            />

            <Pressable
              style={styles.saveButton}
              onPress={createProject}
            >
              <AppText style={styles.saveButtonText}>
                Save Project
              </AppText>
            </Pressable>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 20,
  },

  logo: {
    width: 180,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 6,
  },

  heroTitle: {
    fontSize: 46,
    lineHeight: 48,
    marginTop: 10,
    letterSpacing: -2,
  },

  heroCopy: {
    marginTop: 16,
    color: colors.steel,
    lineHeight: 28,
    fontSize: 18,
  },

  newProjectTile: {
    width: 150,
    height: 150,
    backgroundColor: colors.orange,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  newProjectText: {
    color: colors.white,
    marginTop: 10,
    fontWeight: '900',
    fontSize: 18,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    height: 62,
    paddingHorizontal: 16,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 17,
  },

  createCard: {
    marginBottom: 24,
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

  saveButton: {
    backgroundColor: colors.orange,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 17,
  },
});