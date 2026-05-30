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
import { ProjectStatus } from '@/types/models';

const projectImages = [
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
];

export function WelcomeScreen({ navigation }: NativeStackScreenProps<any>) {
  const {
    projects,
    selectProject,
    addProject,
    photos,
    projectFilter,
    setProjectFilter,
  } = useFabricatorStore();

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('Metal Fabrication');
  const [phase, setPhase] = useState('Planning');
  const [budgetTarget, setBudgetTarget] = useState('');

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    return projects.filter(project => {
      const value = `${project.name} ${project.category} ${project.phase} ${project.status}`.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [projects, search]);

  const visibleProjectList = filteredProjects.filter(
    project => project.status === projectFilter
  );

  const statusLabels: Record<ProjectStatus, string> = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
  };

  const activeProjects = projects.filter(
    project => project.status === 'active'
  ).length;

  const completedProjects = projects.filter(
    project => project.status === 'completed'
  ).length;

  const archivedProjects = projects.filter(
    project => project.status === 'archived'
  ).length;

  const createProject = () => {
    if (!projectName.trim()) return;

    addProject({
      name: projectName.trim(),
      category: category as any,
      phase: phase as any,
      status: 'active',
      budgetTarget: budgetTarget
        ? Number(budgetTarget)
        : 0,
    });

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
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="folder-outline"
              size={24}
              color={colors.orange}
            />

            <Title style={styles.statValue}>{projects.length}</Title>

            <AppText style={styles.statLabel}>Projects</AppText>
            <AppText style={styles.statSub}>Total</AppText>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="progress-clock"
              size={24}
              color={colors.orange}
            />

            <Title style={styles.statValue}>{activeProjects}</Title>

            <AppText style={styles.statLabel}>Active</AppText>
            <AppText style={styles.statSub}>In Progress</AppText>
          </View>

          <View style={styles.statCardCompleted}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={24}
              color="#7DFFB2"
            />

            <Title style={styles.completedStatValue}>
              {completedProjects}
            </Title>

            <AppText style={styles.statLabel}>Completed</AppText>
            <AppText style={styles.statSub}>Finished Builds</AppText>
          </View>

          <View style={styles.statCardArchived}>
            <MaterialCommunityIcons
              name="archive-outline"
              size={24}
              color="#B9A58A"
            />

            <Title style={styles.archivedStatValue}>
              {archivedProjects}
            </Title>

            <AppText style={styles.statLabel}>Archived</AppText>
            <AppText style={styles.statSub}>Stored Builds</AppText>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={24}
              color={colors.orange}
            />

            <Title style={styles.statValue}>{photos.length}</Title>

            <AppText style={styles.statLabel}>Photos</AppText>
            <AppText style={styles.statSub}>Across Projects</AppText>
          </View>
        </View>

        <View style={styles.statusFilterRow}>
          {(['active', 'completed', 'archived'] as ProjectStatus[]).map(
            status => {
              const selected =
                projectFilter === status;

              return (
                <Pressable
                  key={status}
                  style={[
                    styles.statusFilterButton,
                    selected &&
                      styles.statusFilterButtonActive,
                  ]}
                  onPress={() => setProjectFilter(status)}
                >
                  <AppText
                    style={[
                      styles.statusFilterText,
                      selected &&
                        styles.statusFilterTextActive,
                    ]}
                  >
                    {statusLabels[status]}
                  </AppText>
                </Pressable>
              );
            }
          )}
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

          <Pressable style={styles.filterButton}>
            <MaterialCommunityIcons
              name="tune-variant"
              size={22}
              color={colors.white}
            />

            <AppText style={styles.filterText}>Filter</AppText>
          </Pressable>
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
              placeholder="Budget Target"
              placeholderTextColor={colors.steel}
              value={budgetTarget}
              onChangeText={setBudgetTarget}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Phase"
              placeholderTextColor={colors.steel}
              value={phase}
              onChangeText={setPhase}
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

        <View style={styles.sectionHeader}>
          <Label>{statusLabels[projectFilter].toUpperCase()} PROJECTS</Label>

          <AppText style={styles.viewAllText}>
            {visibleProjectList.length} builds
          </AppText>
        </View>

        {visibleProjectList.map((project, index) => (
          <Pressable
  key={project.id}
  onPress={() => openProject(project.id)}
>
  <View
    style={
      project.status === 'completed'
        ? styles.completedProjectRow
        : project.status === 'archived'
        ? styles.archivedProjectRow
        : styles.projectRow
    }
  >
    <Image
      source={{
        uri:
          photos.find(
            photo => photo.id === project.coverPhotoId
          )?.uri ||
          projectImages[index % projectImages.length],
      }}
      style={styles.projectImage}
    />

    <View style={{ flex: 1 }}>
      <View style={styles.projectHeader}>
        <Title style={styles.projectTitle}>
          {project.name}
        </Title>

        <MaterialCommunityIcons
          name="dots-vertical"
          size={20}
          color={colors.steel}
        />
      </View>

      <View style={styles.pillRow}>
        <StatusPill label={project.phase} />
        <StatusPill label={statusLabels[project.status]} />
      </View>

      <AppText style={styles.updateText}>
        {project.status === 'archived'
          ? 'Archived for reference'
          : project.status === 'completed'
          ? 'Completed build record'
          : 'Updated recently'}
      </AppText>

      <View style={styles.progressRow}>
        <AppText style={styles.progressLabel}>
          {project.progress}%
        </AppText>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${project.progress}%` },
            ]}
          />
        </View>
      </View>
    </View>
  </View>
</Pressable>
        ))}
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
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    minWidth: 128,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 16,
    minHeight: 128,
  },

  statCardCompleted: {
    flex: 1,
    minWidth: 128,
    backgroundColor: '#14211A',
    borderWidth: 1,
    borderColor: '#2E7D4F',
    borderRadius: 22,
    padding: 16,
    minHeight: 128,
  },

  statCardArchived: {
    flex: 1,
    minWidth: 128,
    backgroundColor: '#241F19',
    borderWidth: 1,
    borderColor: '#6B5A44',
    borderRadius: 22,
    padding: 16,
    minHeight: 128,
  },

  statValue: {
    fontSize: 34,
    marginTop: 10,
  },

  completedStatValue: {
    fontSize: 34,
    marginTop: 10,
    color: '#7DFFB2',
  },

  archivedStatValue: {
    fontSize: 34,
    marginTop: 10,
    color: '#B9A58A',
  },

  statLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  statSub: {
    color: colors.steel,
    marginTop: 4,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  statusFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  statusFilterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 13,
  },

  statusFilterButtonActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeSoft,
  },

  statusFilterText: {
    color: colors.steel,
    fontWeight: '900',
  },

  statusFilterTextActive: {
    color: colors.orange,
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

  filterButton: {
    width: 120,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  filterText: {
    color: colors.white,
    fontWeight: '800',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  viewAllText: {
    color: colors.orange,
    fontWeight: '800',
  },

  completedLabel: {
    color: '#7DFFB2',
    fontWeight: '800',
  },

  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 14,
    gap: 16,
    marginBottom: 14,
  },

  completedProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14211A',
    borderWidth: 1,
    borderColor: '#2E7D4F',
    borderRadius: 24,
    padding: 14,
    gap: 16,
    marginBottom: 14,
  },

  archivedProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#241F19',
    borderWidth: 1,
    borderColor: '#6B5A44',
    borderRadius: 24,
    padding: 14,
    gap: 16,
    marginBottom: 14,
  },

  projectImage: {
    width: 110,
    height: 110,
    borderRadius: 18,
    backgroundColor: colors.graphite,
  },

  completedProjectImage: {
    width: 110,
    height: 110,
    borderRadius: 18,
    opacity: 0.82,
  },

  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  projectTitle: {
    fontSize: 30,
    lineHeight: 34,
    flex: 1,
  },

  completedProjectTitle: {
    fontSize: 30,
    lineHeight: 34,
    flex: 1,
    color: '#D7FFE7',
  },

  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  updateText: {
    color: colors.steel,
    marginTop: 10,
  },

  completedText: {
    color: '#A7D9BA',
    marginTop: 10,
  },

  completedDate: {
    color: '#7DFFB2',
    marginTop: 8,
    fontWeight: '700',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },

  progressLabel: {
    width: 42,
    color: colors.white,
    fontWeight: '800',
  },

  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.graphite,
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
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
