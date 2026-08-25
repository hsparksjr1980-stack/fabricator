import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildActivity, BuildPhoto, BuildTask, Part, normalizePartStatus } from '@/types/models';
import { colors } from '@/theme/theme';

type RecentActivityItem = {
  id: string;
  title: string;
  detail: string;
  date: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function iconForKind(kind: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const normalized = kind.toLowerCase();
  if (normalized.includes('photo')) return 'camera';
  if (normalized.includes('part')) return 'package-variant';
  if (normalized.includes('task')) return 'clipboard-check-outline';
  if (normalized.includes('voice')) return 'microphone-outline';
  if (normalized.includes('budget')) return 'cash';
  if (normalized.includes('milestone')) return 'flag-checkered';
  return 'history';
}

export function RecentActivityWidget() {
  const store = useFabricatorStore();
  const projectId = store.selectedProjectId;

  const recentItems = useMemo(() => {
    const activityItems: RecentActivityItem[] = store.activities
      .filter((activity: BuildActivity) => activity.projectId === projectId)
      .map((activity: BuildActivity) => ({
        id: activity.id,
        title: activity.title,
        detail: activity.detail || String(activity.kind),
        date: activity.createdAt,
        icon: iconForKind(String(activity.kind)),
      }));

    const taskItems: RecentActivityItem[] = store.tasks
      .filter((task: BuildTask) => task.projectId === projectId)
      .map((task: BuildTask) => ({
        id: `task-${task.id}`,
        title: task.title,
        detail: `${task.system || 'General'} | ${task.status}`,
        date: task.updatedAt || task.createdAt,
        icon: 'clipboard-check-outline',
      }));

    const partItems: RecentActivityItem[] = store.parts
      .filter((part: Part) => part.projectId === projectId)
      .map((part: Part) => ({
        id: `part-${part.id}`,
        title: part.name,
        detail: `${part.system || 'General'} | ${normalizePartStatus(part.status)}`,
        date: part.updatedAt || part.createdAt,
        icon: 'package-variant',
      }));

    const photoItems: RecentActivityItem[] = store.photos
      .filter((photo: BuildPhoto) => photo.projectId === projectId)
      .map((photo: BuildPhoto) => ({
        id: `photo-${photo.id}`,
        title: photo.isMilestone
          ? photo.milestoneTitle || 'Milestone photo'
          : photo.caption || 'Added photo',
        detail: photo.tag || 'Photo',
        date: photo.createdAt,
        icon: photo.isMilestone ? 'flag-checkered' : 'camera',
      }));

    const unique = new Map<string, RecentActivityItem>();

    [...activityItems, ...taskItems, ...partItems, ...photoItems].forEach(item => {
      if (!item.date) return;
      unique.set(item.id, item);
    });

    return Array.from(unique.values())
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [
    projectId,
    store.activities,
    store.parts,
    store.photos,
    store.tasks,
  ]);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Label>SHOP ACTIVITY</Label>
          <Title style={styles.title}>
            Recent Activity
          </Title>
        </View>

        <MaterialCommunityIcons
          name="history"
          size={24}
          color={colors.orange}
        />
      </View>

      {recentItems.length ? (
        recentItems.map(item => (
          <View
            key={item.id}
            style={styles.activityRow}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={18}
              color={colors.orange}
            />

            <View style={{ flex: 1 }}>
              <AppText style={styles.activityText}>
                {item.title}
              </AppText>

              <AppText style={styles.detail}>
                {item.detail}
              </AppText>

              <AppText style={styles.date}>
                {formatDate(item.date)}
              </AppText>
            </View>
          </View>
        ))
      ) : (
        <AppText style={styles.empty}>
          Add a task, part, photo, or note to start the build memory.
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    marginTop: 4,
  },

  activityRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },

  activityText: {
    color: colors.white,
    fontWeight: '800',
    lineHeight: 20,
  },

  detail: {
    color: colors.steel,
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },

  date: {
    color: colors.steel,
    marginTop: 4,
    fontSize: 12,
  },

  empty: {
    color: colors.steel,
    lineHeight: 20,
  },
});
