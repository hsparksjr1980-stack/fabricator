import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildTask, TaskStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

const quickSystems = [
  'Today',
  'Next Session',
  'Fabrication',
  'Chassis',
  'Suspension',
  'Wiring',
  'Drivetrain',
  'Body',
  'Interior',
  'Paint',
  'Engine',
  'Parts',
];

const quickAdds = [
  'Check clearance',
  'Order hardware',
  'Stage parts',
  'Take progress photo',
];

const taskStatuses: TaskStatus[] = [
  'To Do',
  'In Progress',
  'Done',
];

function isTaskDone(status: TaskStatus) {
  return status === 'Done' || status === 'Completed';
}

function statusLabel(status: TaskStatus) {
  return status === 'Completed' ? 'Done' : status;
}

function nextTaskStatus(status: TaskStatus): TaskStatus {
  if (status === 'To Do') return 'In Progress';
  if (status === 'In Progress') return 'Done';
  return 'To Do';
}

function StatusChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        active && styles.chipActive,
      ]}
    >
      <AppText
        style={[
          styles.chipText,
          active && styles.chipTextActive,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function TaskRow({
  task,
  onAdvance,
  onEdit,
}: {
  task: BuildTask;
  onAdvance: () => void;
  onEdit: () => void;
}) {
  const done = isTaskDone(task.status);
  const active = task.status === 'In Progress';

  return (
    <Pressable
      onPress={onAdvance}
      onLongPress={onEdit}
      style={({ pressed }) => [
        styles.taskRow,
        active && styles.taskRowActive,
        done && styles.taskRowDone,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.statusBox,
          active && styles.statusBoxActive,
          done && styles.statusBoxDone,
        ]}
      >
        {done ? (
          <MaterialCommunityIcons
            name="check-bold"
            size={15}
            color={colors.white}
          />
        ) : active ? (
          <View style={styles.statusDot} />
        ) : null}
      </View>

      <View style={styles.taskBody}>
        <AppText
          numberOfLines={2}
          style={[
            styles.taskTitle,
            done && styles.doneTitle,
          ]}
        >
          {task.title}
        </AppText>

        <View style={styles.taskMeta}>
          <View style={styles.systemPill}>
            <AppText style={styles.systemText}>
              {task.system}
            </AppText>
          </View>

          <AppText style={styles.rowStatusText}>
            {statusLabel(task.status)}
          </AppText>
        </View>
      </View>

      <Pressable
        onPress={onEdit}
        hitSlop={10}
        style={styles.iconButton}
      >
        <MaterialCommunityIcons
          name="pencil-outline"
          size={18}
          color={colors.orange}
        />
      </Pressable>
    </Pressable>
  );
}

function TaskEditModal({
  visible,
  task,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  task: BuildTask | null;
  onClose: () => void;
  onSave: (updates: Partial<BuildTask>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('Today');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [notes, setNotes] = useState('');

  useMemo(() => {
    if (!task) return;
    setTitle(task.title);
    setSystem(task.system || 'General');
    setStatus(task.status === 'Completed' ? 'Done' : task.status);
    setNotes(task.notes || '');
  }, [task]);

  const save = () => {
    if (!task || !title.trim()) return;

    onSave({
      title: title.trim(),
      system: system.trim() || 'General',
      status,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalShade}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Label>EDIT TASK</Label>
              <Title style={styles.sheetTitle}>
                Update shop item
              </Title>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.white}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <TextInput
              value={system}
              onChangeText={setSystem}
              placeholder="System / work area"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <Label>Status</Label>
            <View style={styles.chipWrap}>
              {taskStatuses.map(item => (
                <StatusChip
                  key={item}
                  label={item === 'Done' ? 'Done' : item}
                  active={status === item}
                  onPress={() => setStatus(item)}
                />
              ))}
            </View>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={colors.steel}
              multiline
              style={[
                styles.input,
                styles.notesInput,
              ]}
            />

            <View style={styles.sheetActions}>
              <Button
                title="Save Changes"
                onPress={save}
              />

              <Pressable
                onPress={onDelete}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={colors.red}
                />
                <AppText style={styles.deleteText}>
                  Delete Task
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function TasksScreen() {
  const store = useFabricatorStore();

  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('Today');
  const [addToBuyList, setAddToBuyList] = useState(false);
  const [editingTask, setEditingTask] = useState<BuildTask | null>(null);

  const tasks = store.tasks.filter(
    (task: BuildTask) =>
      task.projectId === store.selectedProjectId
  );

  const grouped = useMemo(
    () => ({
      Today: tasks.filter(
        (task: BuildTask) =>
          !isTaskDone(task.status) &&
          (task.system === 'Today' ||
            task.system === 'Next Session' ||
            task.status === 'In Progress')
      ),
      Open: tasks.filter(
        (task: BuildTask) =>
          !isTaskDone(task.status) &&
          task.status !== 'In Progress' &&
          task.system !== 'Today' &&
          task.system !== 'Next Session'
      ),
      Done: tasks.filter(
        (task: BuildTask) => isTaskDone(task.status)
      ),
    }),
    [tasks]
  );

  const save = () => {
    if (!title.trim()) return;

    store.addTask(
      title.trim(),
      system.trim() || 'General',
      addToBuyList
    );

    setTitle('');
    setSystem('Today');
    setAddToBuyList(false);
  };

  const fastAdd = (text: string) => {
    store.addTask(text, system.trim() || 'Today', false);
  };

  const saveEdit = (updates: Partial<BuildTask>) => {
    if (!editingTask) return;
    store.updateTask(editingTask.id, updates);
    setEditingTask(null);
  };

  const deleteEdit = () => {
    if (!editingTask) return;
    store.deleteTask(editingTask.id);
    setEditingTask(null);
  };

  return (
    <Screen>
      <View style={styles.compactHero}>
        <View style={{ flex: 1 }}>
          <Label>TASKS</Label>
          <Title style={styles.heroTitle}>Shop List</Title>
          <AppText style={styles.heroCopy}>
            Compact capture, status tracking, and quick edits.
          </AppText>
        </View>

        <View style={styles.countPill}>
          <AppText style={styles.countText}>
            {grouped.Today.length} today
          </AppText>
        </View>
      </View>

      <Card style={styles.quickAddCard}>
        <View style={styles.quickAddRow}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task, part, or note…"
            placeholderTextColor={colors.steel}
            style={styles.quickInput}
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <Pressable
            style={styles.addButton}
            onPress={save}
          >
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={colors.white}
            />
          </Pressable>
        </View>

        <View style={styles.buyRow}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.buyTitle}>
              Add matching part
            </AppText>
            <AppText style={styles.buyCopy}>
              Uses the same text as a parts item.
            </AppText>
          </View>

          <Switch
            value={addToBuyList}
            onValueChange={setAddToBuyList}
            trackColor={{
              false: colors.graphite,
              true: colors.orange,
            }}
            thumbColor={colors.white}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalChips}
        >
          {quickSystems.map(item => (
            <StatusChip
              key={item}
              label={item}
              active={system === item}
              onPress={() => setSystem(item)}
            />
          ))}
        </ScrollView>

        <View style={styles.fastRow}>
          {quickAdds.map(item => (
            <Pressable
              key={item}
              onPress={() => fastAdd(item)}
              style={styles.fastChip}
            >
              <MaterialCommunityIcons
                name="plus"
                size={12}
                color={colors.orange}
              />
              <AppText style={styles.fastText}>
                {item}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      {Object.entries(grouped).map(([section, list]) => (
        <View
          key={section}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Label>{section}</Label>
            <AppText style={styles.sectionCount}>
              {list.length}
            </AppText>
          </View>

          {list.length ? (
            list.map((task: BuildTask) => (
              <TaskRow
                key={task.id}
                task={task}
                onAdvance={() =>
                  store.updateTask(task.id, {
                    status: nextTaskStatus(task.status),
                  })
                }
                onEdit={() => setEditingTask(task)}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <AppText>No items here yet.</AppText>
            </Card>
          )}
        </View>
      ))}

      <TaskEditModal
        visible={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={saveEdit}
        onDelete={deleteEdit}
      />

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
    marginBottom: 12,
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
    fontSize: 11,
  },
  quickAddCard: {
    padding: spacing.md,
    marginBottom: 14,
    borderColor: 'rgba(217,106,29,0.32)',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  quickInput: {
    flex: 1,
    color: colors.white,
    backgroundColor: colors.graphite,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '700',
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyRow: {
    marginTop: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyTitle: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  buyCopy: {
    color: colors.steel,
    fontSize: 11,
    marginTop: 2,
  },
  horizontalChips: {
    gap: 8,
    paddingTop: 11,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  chipActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  chipText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '800',
  },
  chipTextActive: {
    color: colors.white,
  },
  fastRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  fastChip: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  fastText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  section: {
    marginBottom: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  sectionCount: {
    color: colors.steel,
    fontWeight: '900',
    fontSize: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 58,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 11,
    marginBottom: 8,
  },
  taskRowActive: {
    borderColor: 'rgba(217,106,29,0.55)',
    backgroundColor: colors.panelHigh,
  },
  taskRowDone: {
    opacity: 0.66,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  statusBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBoxActive: {
    backgroundColor: colors.orangeSoft,
  },
  statusBoxDone: {
    backgroundColor: colors.orange,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.orange,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  doneTitle: {
    color: colors.steel,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  systemPill: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  systemText: {
    color: colors.orange,
    fontSize: 10,
    fontWeight: '900',
  },
  rowStatusText: {
    color: colors.steel,
    fontSize: 11,
    fontWeight: '800',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
  },
  emptyCard: {
    padding: spacing.md,
  },
  modalShade: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.panelHigh,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    borderColor: colors.line,
    borderWidth: 1,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.line,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 24,
    lineHeight: 29,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    color: colors.white,
    backgroundColor: colors.graphite,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 11,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  sheetActions: {
    gap: 10,
    paddingBottom: 12,
  },
  deleteButton: {
    borderColor: 'rgba(181,91,85,0.45)',
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  deleteText: {
    color: colors.red,
    fontWeight: '900',
  },
});
