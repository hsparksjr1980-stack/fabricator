import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildActivity, BuildPhoto, BuildTask, Part, normalizePartStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

type TimelineItem = {
  id: string;
  kind: string;
  title: string;
  detail?: string;
  date: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type TimelineGroup = {
  key: string;
  label: string;
  items: TimelineItem[];
};

function formatTimelineDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimelineDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function groupKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function displayKind(kind: string) {
  const normalized = kind.toLowerCase();
  if (normalized.includes('photo')) return 'Photo';
  if (normalized.includes('milestone')) return 'Milestone';
  if (normalized.includes('part')) return 'Part';
  if (normalized.includes('task')) return 'Task';
  if (normalized.includes('budget')) return 'Budget';
  if (normalized.includes('voice')) return 'Voice Note';
  if (normalized.includes('project')) return 'Project';
  return 'Activity';
}

function iconForKind(kind: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const normalized = kind.toLowerCase();

  if (normalized.includes('photo')) return 'camera-outline';
  if (normalized.includes('part')) return 'package-variant';
  if (normalized.includes('task')) return 'clipboard-check-outline';
  if (normalized.includes('project')) return 'folder-outline';
  if (normalized.includes('voice')) return 'microphone-outline';
  if (normalized.includes('budget')) return 'cash';
  if (normalized.includes('milestone')) return 'flag-checkered';

  return 'timeline-text-outline';
}

function normalizePhotoTitle(photo: BuildPhoto) {
  return `Added photo: ${photo.caption || 'Build photo'}`;
}

function buildTimelineGroups(items: TimelineItem[]): TimelineGroup[] {
  const groups = new Map<string, TimelineGroup>();

  items.forEach(item => {
    const key = groupKey(item.date);
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      return;
    }

    groups.set(key, {
      key,
      label: formatTimelineDay(item.date),
      items: [item],
    });
  });

  return Array.from(groups.values());
}

function TimelineRow({
  item,
  featured,
}: {
  item: TimelineItem;
  featured?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineIcon,
          featured && styles.timelineIconFeatured,
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={17}
          color={colors.orange}
        />
      </View>

      <Card
        style={[
          styles.activityCard,
          featured && styles.activityCardFeatured,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Label>{displayKind(item.kind)}</Label>
            <AppText style={styles.activityTitle}>
              {item.title}
            </AppText>
          </View>

          <AppText style={styles.dateText}>
            {formatTimelineDate(item.date)}
          </AppText>
        </View>

        {item.detail ? (
          <AppText style={styles.detailText}>
            {item.detail}
          </AppText>
        ) : null}
      </Card>
    </View>
  );
}

export function TimelineScreen() {
  const store = useFabricatorStore();

  const items = useMemo(() => {
    const activityItems: TimelineItem[] =
      store.activities
        ?.filter(
          (activity: BuildActivity) =>
            activity.projectId === store.selectedProjectId
        )
        .map((activity: BuildActivity) => ({
          id: activity.id,
          kind: displayKind(String(activity.kind)),
          title: activity.title,
          detail: activity.detail,
          date: activity.createdAt,
          icon: iconForKind(String(activity.kind)),
        })) || [];

    const fallbackTaskItems: TimelineItem[] = store.tasks
      .filter(
        (task: BuildTask) =>
          task.projectId === store.selectedProjectId
      )
      .map((task: BuildTask) => ({
        id: `task-${task.id}`,
        kind: 'Task',
        title: task.title,
        detail: `${task.system || 'General'} | ${task.status}`,
        date: task.updatedAt || task.createdAt,
        icon: 'clipboard-check-outline',
      }));

    const fallbackPartItems: TimelineItem[] = store.parts
      .filter(
        (part: Part) =>
          part.projectId === store.selectedProjectId
      )
      .map((part: Part) => ({
        id: `part-${part.id}`,
        kind: 'Part',
        title: part.name,
        detail: `${part.system || 'General'} | ${normalizePartStatus(part.status)}`,
        date: part.updatedAt || part.createdAt,
        icon: 'package-variant',
      }));

    const fallbackPhotoItems: TimelineItem[] = store.photos
      .filter(
        (photo: BuildPhoto) =>
          photo.projectId === store.selectedProjectId
      )
      .map((photo: BuildPhoto) => ({
        id: `photo-${photo.id}`,
        kind: photo.isMilestone ? 'Milestone Photo' : 'Photo',
        title: normalizePhotoTitle(photo),
        detail: photo.isMilestone
          ? photo.milestoneTitle || photo.tag
          : photo.tag,
        date: photo.createdAt,
        icon: photo.isMilestone
          ? 'flag-checkered'
          : 'camera-outline',
      }));

    const allItems = [
      ...activityItems,
      ...fallbackTaskItems,
      ...fallbackPartItems,
      ...fallbackPhotoItems,
    ];

    const unique = new Map<string, TimelineItem>();

    allItems.forEach((item: TimelineItem) => {
      if (!item.date) return;
      unique.set(item.id, item);
    });

    return Array.from(unique.values()).sort(
      (a: TimelineItem, b: TimelineItem) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [
    store.activities,
    store.parts,
    store.photos,
    store.selectedProjectId,
    store.tasks,
  ]);

  const groups = useMemo(() => buildTimelineGroups(items), [items]);

  return (
    <Screen>
      <View style={styles.compactHero}>
        <View style={{ flex: 1 }}>
          <Label>LOG</Label>
          <Title style={styles.heroTitle}>
            Build Timeline
          </Title>
          <AppText style={styles.heroCopy}>
            Project memory from tasks, parts, photos, milestones, notes, costs, and project changes.
          </AppText>
        </View>

        <View style={styles.countPill}>
          <AppText style={styles.countText}>
            {items.length}
          </AppText>
        </View>
      </View>

      {items.length ? (
        groups.map((group: TimelineGroup, groupIndex: number) => (
          <View key={group.key} style={styles.dayGroup}>
            <View style={styles.dayHeader}>
              <AppText style={styles.dayLabel}>{group.label}</AppText>
              <View style={styles.dayRule} />
            </View>

            {group.items.map((item: TimelineItem, itemIndex: number) => (
              <TimelineRow
                key={item.id}
                item={item}
                featured={groupIndex === 0 && itemIndex === 0}
              />
            ))}
          </View>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <MaterialCommunityIcons name="timeline-plus-outline" size={34} color={colors.orange} />
          <Title style={styles.emptyTitle}>No build history yet</Title>
          <AppText style={styles.emptyCopy}>
            Add a task, part, photo, note, or project update and Fabricator will start building the record here.
          </AppText>
        </Card>
      )}

      <View style={{ height: 90 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  compactHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.panelHigh,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 27,
    lineHeight: 31,
  },
  heroCopy: {
    color: colors.steel,
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  countPill: {
    minWidth: 38,
    alignItems: 'center',
    backgroundColor: colors.orangeSoft,
    borderColor: 'rgba(217,106,29,0.42)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 12,
  },
  dayGroup: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 2,
  },
  dayLabel: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dayRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  timelineIconFeatured: {
    backgroundColor: colors.orangeSoft,
    borderColor: 'rgba(217,106,29,0.42)',
  },
  activityCard: {
    flex: 1,
    padding: 12,
  },
  activityCardFeatured: {
    borderColor: 'rgba(217,106,29,0.42)',
    backgroundColor: colors.panelHigh,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  activityTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
    marginTop: 3,
  },
  dateText: {
    color: colors.steel,
    fontWeight: '800',
    fontSize: 10,
    textAlign: 'right',
    maxWidth: 82,
  },
  detailText: {
    color: colors.steel,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  emptyCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 27,
    marginTop: 12,
  },
  emptyCopy: {
    color: colors.steel,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
});
