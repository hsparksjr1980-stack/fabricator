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

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function WelcomeScreen({ navigation }: NativeStackScreenProps<any>) {
  const { projects, selectProject, addProject } = useFabricatorStore();

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('Metal Fabrication');
  const [phase, setPhase] = useState('Planning');

  const filteredProjects = useMemo(() => {
    if (!search.trim()) {
      return projects;
    }

    return projects.filter(project => {
      const value = `${project.name} ${project.category} ${project.phase}`.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [projects, search]);

  const activeProjects = projects.filter(
    project => project.status === 'Active'
  ).length;

  const completedProjects = projects.filter(
    project => project.status === 'Complete'
  ).length;

  const createProject = () => {
    if (!projectName.trim()) return;

    addProject({
      name: projectName.trim(),
      category: category as any,
      phase: phase as any,
      status: 'Active',
    });

    setProjectName('');
    setCategory('Metal Fabrication');
    setPhase('Planning');
    setShowCreate(false);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Label>FABRICATOR WORKSHOP</Label>

              <Title style={styles.heroTitle}>
                Build Operations
              </Title>

              <AppText style={styles.heroCopy}>
                Manage fabrication projects, restoration builds,
                documentation, parts, progress, and workshop activity from one
                place.
              </AppText>
            </View>

            <Image
              source={require('../../../assets/fabricator-logo.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Label>PROJECTS</Label>
              <Title style={styles.statValue}>
                {projects.length}
              </Title>
            </View>

            <View style={styles.statCard}>
              <Label>ACTIVE</Label>
              <Title style={styles.statValue}>
                {activeProjects}
              </Title>
            </View>

            <View style={styles.statCard}>
              <Label>COMPLETE</Label>
              <Title style={styles.statValue}>
                {completedProjects}
              </Title>
            </View>
          </View>
        </View>

        <Card style={styles.searchCard}>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={colors.steel}
            />

            <TextInput
              placeholder="Search workshop projects"
              placeholderTextColor={colors.steel}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </Card>

        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreate(!showCreate)}
        >
          <MaterialCommunityIcons
            name={showCreate ? 'close' : 'plus'}
            size={22}
            color={colors.white}
          />

          <AppText style={styles.createButtonText}>
            {showCreate ? 'Close Project Creator' : 'Create New Project'}
          </AppText>
        </Pressable>

        {showCreate ? (
          <Card style={styles.createCard}>
            <Label>NEW WORKSHOP PROJECT</Label>

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

            <Button title="Save Project" onPress={createProject} />
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <Title style={{ fontSize: 26 }}>Workshop Projects</Title>

          <AppText style={{ color: colors.steel }}>
            {filteredProjects.length} tracked builds
          </AppText>
        </View>

        {filteredProjects.map(project => (
          <Pressable
            key={project.id}
            onPress={() => {
              selectProject(project.id);
              navigation.navigate('Main');
            }}
          >
            <Card style={styles.projectCard}>
              <View style={styles.projectTop}>
                <View style={{ flex: 1 }}>
                  <Label>{project.category}</Label>

                  <Title style={styles.projectTitle}>
                    {project.name}
                  </Title>
                </View>

                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons
                    name="garage-variant"
                    size={26}
                    color={colors.orange}
                  />
                </View>
              </View>

              <StatusPill
                label={`${project.phase} • ${project.status}`}
              />

              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${project.progress}%` },
                    ]}
                  />
                </View>

                <AppText style={styles.progressText}>
                  {project.progress}% complete
                </AppText>
              </View>

              <AppText style={styles.projectHook}>
                {project.hook}
              </AppText>

              <View style={styles.projectFooter}>
                <View style={styles.footerBadge}>
                  <MaterialCommunityIcons
                    name="timeline-clock-outline"
                    size={16}
                    color={colors.orange}
                  />

                  <AppText style={styles.footerText}>
                    Build History
                  </AppText>
                </View>

                <View style={styles.footerBadge}>
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={16}
                    color={colors.orange}
                  />

                  <AppText style={styles.footerText}>
                    Photos
                  </AppText>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    marginTop: 8,
  },

  heroCopy: {
    marginTop: 12,
    color: colors.steel,
    lineHeight: 22,
  },

  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 14,
  },

  statValue: {
    fontSize: 28,
    marginTop: 6,
  },

  searchCard: {
    marginBottom: spacing.md,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
  },

  createButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },

  createButtonText: {
    color: colors.white,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  createCard: {
    marginBottom: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  projectCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },

  projectTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  projectTitle: {
    fontSize: 24,
    marginTop: 4,
  },

  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressSection: {
    marginTop: 16,
  },

  progressBar: {
    height: 10,
    backgroundColor: colors.graphite,
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },

  progressText: {
    marginTop: 8,
    color: colors.steel,
    fontWeight: '700',
  },

  projectHook: {
    marginTop: 14,
    lineHeight: 21,
    color: colors.white,
  },

  projectFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  footerText: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: '700',
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
});