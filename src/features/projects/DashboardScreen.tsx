import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { Project, ProjectStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget';

function formatCurrency(value?: number) {
  const safeValue = Number(value || 0);
  return `$${safeValue.toLocaleString()}`;
}

function formatDate(value?: string) {
  if (!value) return 'No updates yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function StatCard({
  label,
  value,
  icon,
  tone = 'default',
  onPress,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone?: 'default' | 'success' | 'muted' | 'photo';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        tone === 'success' && styles.statCardSuccess,
        tone === 'muted' && styles.statCardMuted,
        tone === 'photo' && styles.statCardPhoto,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.statTopRow}>
        <View style={styles.statIconWrap}>
          <MaterialCommunityIcons name={icon} size={18} color={colors.orange} />
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.steel} />
      </View>

      <Title style={styles.statValue}>{value}</Title>
      <AppText style={styles.statLabel}>{label}</AppText>
    </Pressable>
  );
}

function CompactProjectCard({
  project,
  taskCount,
  partCount,
  photoUri,
  onPress,
}: {
  project: Project;
  taskCount: number;
  partCount: number;
  photoUri?: string;
  onPress: () => void;
}) {
  const isArchived = project.status === 'archived';
  const isCompleted = project.status === 'completed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.projectCard,
        isArchived && styles.projectCardArchived,
        isCompleted && styles.projectCardCompleted,
        pressed && styles.pressed,
      ]}
    >
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.projectThumb} /> : (
        <View style={styles.projectThumbPlaceholder}>
          <MaterialCommunityIcons name="hammer-wrench" size={22} color={colors.orange} />
        </View>
      )}

      <View style={styles.projectBody}>
        <View style={styles.projectHeaderRow}>
          <AppText style={styles.projectName} numberOfLines={1}>
            {project.name}
          </AppText>

          <View style={[styles.statusBadge, isCompleted && styles.statusBadgeComplete, isArchived && styles.statusBadgeArchived]}>
            <MaterialCommunityIcons name={statusIcon(project.status)} size={12} color={colors.white} />
            <AppText style={styles.statusBadgeText}>{statusLabel(project.status)}</AppText>
          </View>
        </View>

        <AppText style={styles.projectMeta} numberOfLines={1}>
          {project.category || 'General'} • {project.phase || 'Planning'}
        </AppText>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(project.progress || 0, 100))}%` }]} />
        </View>

        <View style={styles.projectFooterRow}>
          <AppText style={styles.projectFooterText}>{project.progress || 0}%</AppText>
          <AppText style={styles.projectFooterText}>{taskCount} tasks</AppText>
          <AppText style={styles.projectFooterText}>{partCount} parts</AppText>
          <AppText style={styles.projectFooterText}>{formatDate(project.updatedAt)}</AppText>
        </View>
      </View>
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

  const projectStats = useMemo(() => {
    const active = store.projects.filter(item => item.status === 'active');
    const completed = store.projects.filter(item => item.status === 'completed');
    const archived = store.projects.filter(item => item.status === 'archived');

    return {
      active,
      completed,
      archived,
      total: store.projects.length,
      photos: store.photos.length,
    };
  }, [store.photos.length, store.projects]);

  if (!project) return null;

  const projectTasks = store.tasks.filter(task => task.projectId === project.id);
  const projectParts = store.parts.filter(part => part.projectId === project.id);
  const projectPhotos = store.photos.filter(photo => photo.projectId === project.id);
  const coverPhoto = store.photos.find(photo => photo.id === project.coverPhotoId) || projectPhotos[0];

  const activePreview = projectStats.active.slice(0, 4);
  const actualSpend = projectParts.reduce((sum, part) => sum + (part.actualCost || 0), 0);
  const expectedBudget = project.expectedBudget ?? project.budgetTarget ?? 0;

  const openProjectList = (filter?: 'active' | 'completed' | 'archived') => {
    if (filter) {
      store.setProjectFilter(filter);
    }
    navigation.navigate('Welcome');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Label>DASHBOARD</Label>
            <Title style={styles.headerTitle}>Projects First</Title>
            <AppText style={styles.headerCopy}>
              Active builds, project status, budget, parts, and documentation without the oversized panels.
            </AppText>
          </View>

          <Pressable style={styles.headerAction} onPress={() => openProjectList()}>
            <MaterialCommunityIcons name="garage" size={22} color={colors.orange} />
          </Pressable>
        </View>

        <View style={styles.statGrid}>
          <StatCard
            label="Projects"
            value={projectStats.total}
            icon="folder-multiple-outline"
            onPress={() => openProjectList()}
          />
          <StatCard
            label="Active"
            value={projectStats.active.length}
            icon="garage-open-variant"
            onPress={() => openProjectList('active')}
          />
          <StatCard
            label="Completed"
            value={projectStats.completed.length}
            icon="check-decagram-outline"
            tone="success"
            onPress={() => openProjectList('completed')}
          />
          <StatCard
            label="Archived"
            value={projectStats.archived.length}
            icon="archive-outline"
            tone="muted"
            onPress={() => openProjectList('archived')}
          />
          <StatCard
            label="Photos"
            value={projectStats.photos}
            icon="image-multiple-outline"
            tone="photo"
            onPress={() => navigation.navigate('Photos')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Label>CURRENT PROJECT</Label>
            <AppText style={styles.sectionSubcopy}>Selected build profile</AppText>
          </View>
          <Pressable onPress={() => navigation.navigate('ProjectEdit')} style={styles.smallLinkButton}>
            <MaterialCommunityIcons name="square-edit-outline" size={15} color={colors.orange} />
            <AppText style={styles.smallLinkText}>Edit</AppText>
          </Pressable>
        </View>

        <CompactProjectCard
          project={project}
          taskCount={projectTasks.length}
          partCount={projectParts.length}
          photoUri={coverPhoto?.uri}
          onPress={() => navigation.navigate('ProjectEdit')}
        />

        <View style={styles.summaryGrid}>
          <Card style={styles.miniCard}>
            <Label>TASKS</Label>
            <Title style={styles.miniValue}>{projectTasks.length}</Title>
            <AppText style={styles.miniText}>Open and completed shop work</AppText>
          </Card>

          <Card style={styles.miniCard}>
            <Label>PARTS</Label>
            <Title style={styles.miniValue}>{projectParts.length}</Title>
            <AppText style={styles.miniText}>Needed, ordered, on hand, installed</AppText>
          </Card>
        </View>

        <Card style={styles.budgetCard}>
          <View style={styles.budgetHeaderRow}>
            <View>
              <Label>BUDGET</Label>
              <AppText style={styles.miniText}>Expected versus actual</AppText>
            </View>
            <AppText style={styles.budgetRemaining}>
              {formatCurrency(Math.max(expectedBudget - actualSpend, 0))} left
            </AppText>
          </View>

          <View style={styles.budgetRow}>
            <View style={styles.budgetPill}>
              <AppText style={styles.budgetPillLabel}>Expected</AppText>
              <AppText style={styles.budgetPillValue}>{formatCurrency(expectedBudget)}</AppText>
            </View>
            <View style={styles.budgetPill}>
              <AppText style={styles.budgetPillLabel}>Actual</AppText>
              <AppText style={styles.budgetPillValue}>{formatCurrency(actualSpend)}</AppText>
            </View>
            <View style={styles.budgetPill}>
              <AppText style={styles.budgetPillLabel}>Photos</AppText>
              <AppText style={styles.budgetPillValue}>{projectPhotos.length}</AppText>
            </View>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <View>
            <Label>ACTIVE PROJECTS</Label>
            <AppText style={styles.sectionSubcopy}>Tap the Active card above for the full active list.</AppText>
          </View>
        </View>

        {activePreview.length ? (
          activePreview.map(item => {
            const tasks = store.tasks.filter(task => task.projectId === item.id);
            const parts = store.parts.filter(part => part.projectId === item.id);
            const cover = store.photos.find(photo => photo.id === item.coverPhotoId) ||
              store.photos.find(photo => photo.projectId === item.id);

            return (
              <CompactProjectCard
                key={item.id}
                project={item}
                taskCount={tasks.length}
                partCount={parts.length}
                photoUri={cover?.uri}
                onPress={() => {
                  store.selectProject(item.id);
                  navigation.navigate('Dashboard');
                }}
              />
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <AppText>No active projects yet.</AppText>
          </Card>
        )}

        <RecentActivityWidget />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 14,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: 4,
  },
  headerCopy: {
    color: colors.steel,
    marginTop: 6,
    lineHeight: 19,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    width: '31.6%',
    minHeight: 104,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 12,
  },
  statCardSuccess: {
    borderColor: 'rgba(110,159,105,0.55)',
    backgroundColor: '#142017',
  },
  statCardMuted: {
    opacity: 0.82,
    backgroundColor: colors.charcoal,
  },
  statCardPhoto: {
    borderColor: 'rgba(217,106,29,0.4)',
    backgroundColor: colors.orangeSoft,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.graphite,
  },
  statValue: {
    fontSize: 25,
    lineHeight: 29,
    marginTop: 10,
  },
  statLabel: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
  },
  sectionSubcopy: {
    color: colors.steel,
    marginTop: 3,
    fontSize: 12,
  },
  smallLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
  },
  smallLinkText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 12,
  },
  projectCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: 10,
  },
  projectCardCompleted: {
    borderColor: 'rgba(110,159,105,0.45)',
  },
  projectCardArchived: {
    opacity: 0.72,
    backgroundColor: colors.charcoal,
  },
  projectThumb: {
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: colors.graphite,
  },
  projectThumbPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectBody: {
    flex: 1,
  },
  projectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  projectName: {
    flex: 1,
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  projectMeta: {
    color: colors.steel,
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.orangeSoft,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  statusBadgeComplete: {
    backgroundColor: '#1F3A29',
  },
  statusBadgeArchived: {
    backgroundColor: colors.graphite,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.graphite,
    marginTop: 9,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },
  projectFooterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  projectFooterText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  miniCard: {
    flex: 1,
    padding: 12,
  },
  miniValue: {
    fontSize: 23,
    lineHeight: 28,
    marginTop: 4,
  },
  miniText: {
    color: colors.steel,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  budgetCard: {
    padding: 13,
    marginBottom: 18,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  budgetRemaining: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 13,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  budgetPill: {
    flex: 1,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 10,
  },
  budgetPillLabel: {
    color: colors.steel,
    fontSize: 11,
    fontWeight: '800',
  },
  budgetPillValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  emptyCard: {
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
