import { useMemo, useState } from 'react';
import {
  Alert,
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
import {
  Project,
  ProjectCategory,
  ProjectPhase,
  ProjectStatus,
} from '@/types/models';

const fallbackProjectImages = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
];

const projectCategories: ProjectCategory[] = [
  'Vehicle',
  'Woodworking',
  'Electronics',
  'Home Improvement',
  'Fabrication',
  'Crafts',
  'General',
];

const projectPhases: ProjectPhase[] = [
  'Planning',
  'Design',
  'Parts Gathering',
  'In Progress',
  'Testing',
  'Finishing',
  'Complete',
];

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

function statusIcon(status: ProjectStatus): keyof typeof MaterialCommunityIcons.glyphMap {
  if (status === 'completed') return 'check-decagram-outline';
  if (status === 'archived') return 'archive-outline';

  return 'garage-open-variant';
}

function statusTone(status: ProjectStatus) {
  if (status === 'completed') return styles.statusBadgeComplete;
  if (status === 'archived') return styles.statusBadgeArchived;

  return styles.statusBadgeActive;
}

function formatCurrency(value?: number) {
  const safeValue = Number(value || 0);

  return `$${safeValue.toLocaleString()}`;
}

function getExpectedBudget(project: Project) {
  return project.expectedBudget ?? project.budgetTarget ?? 0;
}

function SelectorChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map(option => {
        const selected = option === value;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.selectorChip, selected && styles.selectorChipActive]}
          >
            <AppText style={[styles.selectorChipText, selected && styles.selectorChipTextActive]}>
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function ProjectListCard({
  project,
  imageUri,
  onPress,
}: {
  project: Project;
  imageUri?: string;
  onPress: () => void;
}) {
  const progress = Math.max(0, Math.min(project.progress || 0, 100));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.projectRow,
        project.status === 'completed' && styles.completedProjectRow,
        project.status === 'archived' && styles.archivedProjectRow,
        pressed && styles.pressed,
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.projectImage} />
      ) : (
        <View style={styles.projectImagePlaceholder}>
          <MaterialCommunityIcons name="hammer-wrench" size={20} color={colors.orange} />
        </View>
      )}

      <View style={styles.projectBody}>
        <View style={styles.projectHeader}>
          <AppText style={styles.projectTitle} numberOfLines={1}>
            {project.name}
          </AppText>

          <View style={[styles.statusBadge, statusTone(project.status)]}>
            <MaterialCommunityIcons name={statusIcon(project.status)} size={11} color={colors.white} />
            <AppText style={styles.statusBadgeText}>{statusLabels[project.status]}</AppText>
          </View>
        </View>

        <AppText style={styles.projectMeta} numberOfLines={1}>
          {project.category || 'General'} • {project.phase || 'Planning'} • {formatCurrency(getExpectedBudget(project))}
        </AppText>

        <View style={styles.pillRow}>
          <StatusPill label={project.phase || 'Planning'} />
          <StatusPill label={`${progress}%`} />
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

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
  const [category, setCategory] = useState<ProjectCategory>('Vehicle');
  const [phase, setPhase] = useState<ProjectPhase>('Planning');
  const [expectedBudget, setExpectedBudget] = useState('');

  const projectCounts = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter((project: Project) => project.status === 'active').length,
      completed: projects.filter((project: Project) => project.status === 'completed').length,
      archived: projects.filter((project: Project) => project.status === 'archived').length,
      photos: photos.length,
    };
  }, [photos.length, projects]);

  const visibleProjectList = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    return projects
      .filter((project: Project) => project.status === projectFilter)
      .filter((project: Project) => {
        if (!loweredSearch) return true;

        const value = `${project.name} ${project.category} ${project.phase} ${project.status}`.toLowerCase();

        return value.includes(loweredSearch);
      });
  }, [projectFilter, projects, search]);

  const createProject = () => {
    if (!projectName.trim()) {
      Alert.alert('Project name required', 'Give this build a name before saving.');
      return;
    }

    const numericExpectedBudget = expectedBudget ? Number(expectedBudget) : 0;

    addProject({
      name: projectName.trim(),
      category,
      phase,
      status: 'active',
      expectedBudget: numericExpectedBudget,
      budgetTarget: numericExpectedBudget,
    } as any);

    setProjectName('');
    setCategory('Vehicle');
    setPhase('Planning');
    setExpectedBudget('');
    setShowCreate(false);
    setProjectFilter('active');
  };

  const openProject = (projectId: string) => {
    selectProject(projectId);
    navigation.navigate('Main');
  };

  const titleForFilter = statusLabels[projectFilter];
  const hasActiveProject = projectCounts.active > 0;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroLayout}>
          <View style={styles.heroText}>
            <Image source={require('../../../assets/fabricator-logo.png')} style={styles.logo} />

            <Label>PROJECTS</Label>

            <Title style={styles.heroTitle}>Build Library</Title>

            <AppText style={styles.heroCopy}>
              Create, reopen, archive, or review every build record from one place.
            </AppText>
          </View>

          <Pressable
            style={styles.newProjectTile}
            onPress={() => setShowCreate(!showCreate)}
          >
            <MaterialCommunityIcons
              name={showCreate ? 'close' : 'plus'}
              size={28}
              color={colors.white}
            />
            <AppText style={styles.newProjectText}>{showCreate ? 'Close' : 'New'}</AppText>
          </Pressable>
        </View>

        <View style={styles.summaryStrip}>
          <View style={styles.summaryPill}>
            <AppText style={styles.summaryValue}>{projectCounts.total}</AppText>
            <AppText style={styles.summaryLabel}>Projects</AppText>
          </View>

          <Pressable style={styles.summaryPill} onPress={() => setProjectFilter('active')}>
            <AppText style={styles.summaryValue}>{projectCounts.active}</AppText>
            <AppText style={styles.summaryLabel}>Active</AppText>
          </Pressable>

          <Pressable style={styles.summaryPill} onPress={() => setProjectFilter('completed')}>
            <AppText style={styles.summaryValue}>{projectCounts.completed}</AppText>
            <AppText style={styles.summaryLabel}>Completed</AppText>
          </Pressable>

          <Pressable style={styles.summaryPill} onPress={() => setProjectFilter('archived')}>
            <AppText style={styles.summaryValue}>{projectCounts.archived}</AppText>
            <AppText style={styles.summaryLabel}>Archived</AppText>
          </Pressable>

          <Pressable style={styles.summaryPill} onPress={() => navigation.navigate('Main', { screen: 'Photos' })}>
            <AppText style={styles.summaryValue}>{projectCounts.photos}</AppText>
            <AppText style={styles.summaryLabel}>Photos</AppText>
          </Pressable>
        </View>

        {showCreate ? (
          <Card style={styles.createCard}>
            <View style={styles.createHeader}>
              <View>
                <Label>CREATE PROJECT</Label>
                <Title style={styles.createTitle}>New build profile</Title>
              </View>
              <MaterialCommunityIcons name="folder-plus-outline" size={24} color={colors.orange} />
            </View>

            <TextInput
              placeholder="Project name"
              placeholderTextColor={colors.steel}
              value={projectName}
              onChangeText={setProjectName}
              style={styles.input}
            />

            {hasActiveProject ? (
              <View style={styles.planNotice}>
                <MaterialCommunityIcons name="lock-open-variant-outline" size={18} color={colors.orange} />
                <AppText style={styles.planNoticeText}>
                  Free-plan limit is preview-only in this build. Paid multi-project access will be enforced after monetization approval.
                </AppText>
              </View>
            ) : null}

            <Label>CATEGORY</Label>
            <SelectorChips
              value={category}
              options={projectCategories}
              onChange={setCategory}
            />

            <TextInput
              placeholder="Expected budget"
              placeholderTextColor={colors.steel}
              value={expectedBudget}
              onChangeText={setExpectedBudget}
              keyboardType="numeric"
              style={styles.input}
            />

            <Label>PHASE</Label>
            <SelectorChips
              value={phase}
              options={projectPhases}
              onChange={setPhase}
            />

            <Pressable style={styles.saveButton} onPress={createProject}>
              <AppText style={styles.saveButtonText}>Save Project</AppText>
            </Pressable>
          </Card>
        ) : null}

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.steel} />

            <TextInput
              placeholder={`Search ${titleForFilter.toLowerCase()} projects...`}
              placeholderTextColor={colors.steel}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Label>{titleForFilter.toUpperCase()} PROJECTS</Label>
            <AppText style={styles.sectionSubcopy}>
              {visibleProjectList.length} builds shown
            </AppText>
          </View>

          <Pressable style={styles.currentFilterBadge}>
            <MaterialCommunityIcons name={statusIcon(projectFilter)} size={14} color={colors.orange} />
            <AppText style={styles.currentFilterText}>{titleForFilter}</AppText>
          </Pressable>
        </View>

        {visibleProjectList.length ? (
          visibleProjectList.map((project: Project, index: number) => {
            const cover =
              photos.find(photo => photo.id === project.coverPhotoId) ||
              photos.find(photo => photo.projectId === project.id);

            return (
              <ProjectListCard
                key={project.id}
                project={project}
                imageUri={cover?.uri || fallbackProjectImages[index % fallbackProjectImages.length]}
                onPress={() => openProject(project.id)}
              />
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="folder-search-outline" size={26} color={colors.orange} />
            <AppText style={styles.emptyText}>No {titleForFilter.toLowerCase()} projects found.</AppText>
            <View style={styles.emptyActions}>
              {projectFilter !== 'active' ? (
                <Pressable style={styles.emptyActionButton} onPress={() => setProjectFilter('active')}>
                  <AppText style={styles.emptyActionText}>Show Active</AppText>
                </Pressable>
              ) : null}

              {search ? (
                <Pressable style={styles.emptyActionButton} onPress={() => setSearch('')}>
                  <AppText style={styles.emptyActionText}>Clear Search</AppText>
                </Pressable>
              ) : null}

              <Pressable style={styles.emptyActionButton} onPress={() => setShowCreate(true)}>
                <AppText style={styles.emptyActionText}>New Project</AppText>
              </Pressable>
            </View>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  heroLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 14,
  },
  heroText: {
    flex: 1,
  },
  logo: {
    width: 110,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 31,
    lineHeight: 35,
    marginTop: 4,
  },
  heroCopy: {
    marginTop: 8,
    color: colors.steel,
    lineHeight: 20,
  },
  newProjectTile: {
    width: 86,
    height: 86,
    backgroundColor: colors.orange,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  newProjectText: {
    color: colors.white,
    marginTop: 6,
    fontWeight: '900',
    fontSize: 12,
  },
  summaryStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  summaryPill: {
    minWidth: '18%',
    flexGrow: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 9,
  },
  summaryValue: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 18,
  },
  summaryLabel: {
    color: colors.steel,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  createCard: {
    marginBottom: 14,
    borderColor: 'rgba(217,106,29,0.35)',
  },
  createHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  createTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginTop: 3,
  },
  input: {
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: 9,
    marginBottom: 12,
  },
  planNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 12,
  },
  planNoticeText: {
    flex: 1,
    color: colors.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
    marginBottom: 12,
  },
  selectorChip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selectorChipActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  selectorChipText: {
    color: colors.steel,
    fontSize: 11,
    fontWeight: '900',
  },
  selectorChipTextActive: {
    color: colors.white,
  },
  saveButton: {
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '900',
  },
  searchRow: {
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionSubcopy: {
    color: colors.steel,
    fontSize: 12,
    marginTop: 2,
  },
  currentFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
  },
  currentFilterText: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: '900',
  },
  projectRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: 10,
  },
  completedProjectRow: {
    borderColor: 'rgba(110,159,105,0.45)',
    backgroundColor: '#131E17',
  },
  archivedProjectRow: {
    opacity: 0.76,
    backgroundColor: '#141618',
  },
  projectImage: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: colors.graphite,
  },
  projectImagePlaceholder: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectBody: {
    flex: 1,
    minWidth: 0,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  statusBadgeActive: {
    backgroundColor: colors.orange,
  },
  statusBadgeComplete: {
    backgroundColor: colors.green,
  },
  statusBadgeArchived: {
    backgroundColor: '#6B5A44',
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  projectMeta: {
    color: colors.steel,
    fontSize: 12,
    marginTop: 5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 7,
  },
  progressRow: {
    marginTop: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.graphite,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 22,
  },
  emptyText: {
    color: colors.steel,
    fontWeight: '800',
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  emptyActionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyActionText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
