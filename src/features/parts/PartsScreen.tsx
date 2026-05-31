import { useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { Part, PartStatus } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

const baseSystems = [
  'Chassis',
  'Suspension',
  'Wiring',
  'Drivetrain',
  'Body',
  'Interior',
  'Paint',
  'Engine',
  'Fabrication',
  'Hardware',
  'Shop Supplies',
];

const partStatuses: PartStatus[] = [
  'Need to Order',
  'Ordered',
  'On Hand',
  'Installed',
];

type PartFilter = 'Needed' | 'Ordered' | 'On Hand' | 'Installed' | 'All';

const partFilters: PartFilter[] = [
  'Needed',
  'Ordered',
  'On Hand',
  'Installed',
  'All',
];

function visibleStatus(status: PartStatus) {
  if (status === 'Need to Order') return 'Needed';
  return status;
}

function nextPartStatus(status: PartStatus): PartStatus {
  if (status === 'Need to Order') return 'Ordered';
  if (status === 'Ordered') return 'On Hand';
  if (status === 'On Hand') return 'Installed';
  return 'Need to Order';
}

function money(value?: number) {
  if (!value) return '$0';
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function parseMoney(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildSearchQuery(part: Part) {
  return [
    part.name,
    part.partNumber,
    part.vendor,
  ]
    .filter(Boolean)
    .join(' ');
}

function Chip({
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

function PartRow({
  part,
  onAdvance,
  onEdit,
}: {
  part: Part;
  onAdvance: () => void;
  onEdit: () => void;
}) {
  const search = () => {
    const query = buildSearchQuery(part);
    if (!query.trim()) return;

    Linking.openURL(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`
    );
  };

  return (
    <Pressable
      onPress={onAdvance}
      onLongPress={onEdit}
      style={({ pressed }) => [
        styles.partRow,
        part.status === 'Installed' && styles.installedRow,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.partBody}>
        <View style={styles.partTop}>
          <AppText
            numberOfLines={1}
            style={styles.partTitle}
          >
            {part.name}
          </AppText>

          <View style={styles.statusPill}>
            <AppText style={styles.statusText}>
              {visibleStatus(part.status)}
            </AppText>
          </View>
        </View>

        <View style={styles.partMeta}>
          <AppText
            numberOfLines={1}
            style={styles.systemText}
          >
            {part.system}
          </AppText>

          {part.vendor ? (
            <AppText
              numberOfLines={1}
              style={styles.vendorText}
            >
              {part.vendor}
            </AppText>
          ) : null}
        </View>

        <View style={styles.costRow}>
          <AppText style={styles.costText}>
            Est {money(part.estimatedCost)}
          </AppText>
          <AppText style={styles.costText}>
            Actual {money(part.actualCost)}
          </AppText>
        </View>
      </View>

      <View style={styles.iconStack}>
        <Pressable
          onPress={search}
          hitSlop={8}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors.orange}
          />
        </Pressable>

        <Pressable
          onPress={onEdit}
          hitSlop={8}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={18}
            color={colors.orange}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

function PartEditModal({
  visible,
  part,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  part: Part | null;
  onClose: () => void;
  onSave: (updates: Partial<Part>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState('');
  const [system, setSystem] = useState('Chassis');
  const [status, setStatus] = useState<PartStatus>('Need to Order');
  const [vendor, setVendor] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [description, setDescription] = useState('');

  useMemo(() => {
    if (!part) return;
    setName(part.name);
    setSystem(part.system || 'General');
    setStatus(part.status);
    setVendor(part.vendor || '');
    setPartNumber(part.partNumber || '');
    setEstimatedCost(part.estimatedCost ? String(part.estimatedCost) : '');
    setActualCost(part.actualCost ? String(part.actualCost) : '');
    setDescription(part.description || part.notes || '');
  }, [part]);

  const save = () => {
    if (!part || !name.trim()) return;

    onSave({
      name: name.trim(),
      system: system.trim() || 'General',
      status,
      vendor: vendor.trim() || undefined,
      partNumber: partNumber.trim() || undefined,
      estimatedCost: parseMoney(estimatedCost),
      actualCost: parseMoney(actualCost),
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
              <Label>EDIT PART</Label>
              <Title style={styles.sheetTitle}>
                Update part details
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Part name"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <TextInput
              value={system}
              onChangeText={setSystem}
              placeholder="Work area / system"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <Label>Status</Label>
            <View style={styles.chipWrap}>
              {partStatuses.map(item => (
                <Chip
                  key={item}
                  label={visibleStatus(item)}
                  active={status === item}
                  onPress={() => setStatus(item)}
                />
              ))}
            </View>

            <TextInput
              value={vendor}
              onChangeText={setVendor}
              placeholder="Vendor"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <TextInput
              value={partNumber}
              onChangeText={setPartNumber}
              placeholder="Part number"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <View style={styles.twoCol}>
              <TextInput
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                placeholder="Estimated"
                placeholderTextColor={colors.steel}
                keyboardType="numeric"
                style={[
                  styles.input,
                  styles.colInput,
                ]}
              />

              <TextInput
                value={actualCost}
                onChangeText={setActualCost}
                placeholder="Actual"
                placeholderTextColor={colors.steel}
                keyboardType="numeric"
                style={[
                  styles.input,
                  styles.colInput,
                ]}
              />
            </View>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description or notes"
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
                  Delete Part
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function PartsScreen() {
  const store = useFabricatorStore();
  const [name, setName] = useState('');
  const [system, setSystem] = useState('Chassis');
  const [filter, setFilter] = useState<PartFilter>('Needed');
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const parts = store.parts.filter(
    (part: Part) =>
      part.projectId === store.selectedProjectId
  );

  const visibleParts = useMemo(() => {
    if (filter === 'All') return parts;
    if (filter === 'Needed') {
      return parts.filter(
        (part: Part) => part.status === 'Need to Order'
      );
    }

    return parts.filter(
      (part: Part) => part.status === filter
    );
  }, [filter, parts]);

  const totalEstimated = parts.reduce(
    (sum: number, part: Part) =>
      sum + (part.estimatedCost || 0),
    0
  );

  const totalActual = parts.reduce(
    (sum: number, part: Part) =>
      sum + (part.actualCost || 0),
    0
  );

  const counts = {
    Needed: parts.filter(
      (part: Part) => part.status === 'Need to Order'
    ).length,
    Ordered: parts.filter(
      (part: Part) => part.status === 'Ordered'
    ).length,
    'On Hand': parts.filter(
      (part: Part) => part.status === 'On Hand'
    ).length,
    Installed: parts.filter(
      (part: Part) => part.status === 'Installed'
    ).length,
    All: parts.length,
  };

  const save = () => {
    if (!name.trim()) return;
    store.addPart(name.trim(), system.trim() || 'General');
    setName('');
    setSystem('Chassis');
  };

  const saveEdit = (updates: Partial<Part>) => {
    if (!editingPart) return;
    store.updatePart(editingPart.id, updates);
    setEditingPart(null);
  };

  const deleteEdit = () => {
    if (!editingPart) return;
    store.deletePart(editingPart.id);
    setEditingPart(null);
  };

  return (
    <Screen>
      <View style={styles.compactHero}>
        <View style={{ flex: 1 }}>
          <Label>PARTS</Label>
          <Title style={styles.heroTitle}>
            Parts + Materials
          </Title>
          <AppText style={styles.heroCopy}>
            Compact tracking for what is needed, ordered, on hand, and installed.
          </AppText>
        </View>
      </View>

      <Card style={styles.quickAddCard}>
        <View style={styles.quickAddRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Part, material, or hardware…"
            placeholderTextColor={colors.steel}
            style={styles.quickInput}
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <Pressable
            onPress={save}
            style={styles.addButton}
          >
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={colors.white}
            />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalChips}
        >
          {baseSystems.map(item => (
            <Chip
              key={item}
              label={item}
              active={system === item}
              onPress={() => setSystem(item)}
            />
          ))}
        </ScrollView>
      </Card>

      <View style={styles.budgetStrip}>
        <View style={styles.budgetCell}>
          <Label>EST</Label>
          <AppText style={styles.budgetValue}>
            {money(totalEstimated)}
          </AppText>
        </View>

        <View style={styles.budgetCell}>
          <Label>ACTUAL</Label>
          <AppText style={styles.budgetValue}>
            {money(totalActual)}
          </AppText>
        </View>

        <View style={styles.budgetCell}>
          <Label>ITEMS</Label>
          <AppText style={styles.budgetValue}>
            {parts.length}
          </AppText>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {partFilters.map(item => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterButton,
              filter === item && styles.filterButtonActive,
            ]}
          >
            <AppText
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </AppText>

            <View style={styles.filterCount}>
              <AppText style={styles.filterCountText}>
                {counts[item]}
              </AppText>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {visibleParts.length ? (
        visibleParts.map((part: Part) => (
          <PartRow
            key={part.id}
            part={part}
            onAdvance={() =>
              store.updatePart(part.id, {
                status: nextPartStatus(part.status),
              })
            }
            onEdit={() => setEditingPart(part)}
          />
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <AppText>No parts here yet.</AppText>
        </Card>
      )}

      <PartEditModal
        visible={!!editingPart}
        part={editingPart}
        onClose={() => setEditingPart(null)}
        onSave={saveEdit}
        onDelete={deleteEdit}
      />

      <View style={{ height: 90 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  compactHero: {
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
  quickAddCard: {
    padding: spacing.md,
    borderColor: 'rgba(217,106,29,0.32)',
    marginBottom: 12,
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
  budgetStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  budgetCell: {
    flex: 1,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
  },
  budgetValue: {
    color: colors.white,
    fontWeight: '900',
    marginTop: 4,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  filterButtonActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  filterText: {
    color: colors.steel,
    fontSize: 11,
    fontWeight: '900',
  },
  filterTextActive: {
    color: colors.white,
  },
  filterCount: {
    minWidth: 22,
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: colors.graphite,
  },
  filterCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 11,
    marginBottom: 8,
    minHeight: 72,
  },
  installedRow: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  partBody: {
    flex: 1,
  },
  partTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  statusPill: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: colors.orange,
    fontSize: 10,
    fontWeight: '900',
  },
  partMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  systemText: {
    color: colors.steel,
    fontSize: 11,
    fontWeight: '800',
  },
  vendorText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  costRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  costText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  iconStack: {
    flexDirection: 'row',
    gap: 7,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    maxHeight: '84%',
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
  twoCol: {
    flexDirection: 'row',
    gap: 9,
  },
  colInput: {
    flex: 1,
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
