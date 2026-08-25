import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { Part, PartStatus, ProjectCategory, normalizePartStatus } from '@/types/models';
import { colors, radius, shadows, spacing } from '@/theme/theme';

type PartFilter = 'Needed' | 'Ordered' | 'Received' | 'Installed' | 'All';

const PART_FILTERS: PartFilter[] = ['Needed', 'Ordered', 'Received', 'Installed', 'All'];
const PART_STATUSES: PartStatus[] = ['Needed', 'Ordered', 'Received', 'Installed'];

const WORK_AREAS_BY_CATEGORY: Record<string, string[]> = {
  Vehicle: [
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
  ],
  Woodworking: [
    'Lumber',
    'Hardware',
    'Joinery',
    'Finishing',
    'Tools',
    'Shop Supplies',
  ],
  Electronics: [
    'Wiring',
    'Circuit',
    'Sensors',
    'Switches',
    'Power',
    'Enclosure',
    'Tools',
  ],
  'Home Improvement': [
    'Demo',
    'Framing',
    'Electrical',
    'Plumbing',
    'Drywall',
    'Paint',
    'Finish Work',
    'Hardware',
  ],
  Fabrication: [
    'Steel',
    'Aluminum',
    'Hardware',
    'Welding',
    'Fitment',
    'Grinding',
    'Paint',
    'Shop Supplies',
  ],
  Crafts: [
    'Materials',
    'Tools',
    'Assembly',
    'Detailing',
    'Finishing',
    'Packaging',
  ],
  General: [
    'Parts',
    'Materials',
    'Hardware',
    'Tools',
    'Shop Supplies',
    'Finishing',
  ],
};

function getWorkAreas(category?: ProjectCategory | string) {
  return WORK_AREAS_BY_CATEGORY[category || 'General'] || WORK_AREAS_BY_CATEGORY.General;
}

function displayStatus(status: PartStatus): PartFilter {
  return normalizePartStatus(status);
}

function filterMatches(part: Part, filter: PartFilter) {
  if (filter === 'All') return true;
  return normalizePartStatus(part.status) === filter;
}

function money(value?: number) {
  const safe = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `$${safe.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function parseMoney(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function showPricingUnavailable() {
  Alert.alert(
    'Pricing search is not live yet',
    'Part pricing search is planned as a paid Shop Help feature before public launch.\n\nPrices and availability can change. Verify with the seller before buying.'
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.selectField} onPress={() => setOpen(true)}>
        <View>
          <Label>{label}</Label>
          <AppText style={styles.selectValue}>{value}</AppText>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={22} color={colors.orange} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.dropdownOverlay}>
          <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)} />

          <View style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <View>
                <Label>{label}</Label>
                <Title style={styles.dropdownTitle}>Choose option</Title>
              </View>
              <Pressable style={styles.dropdownClose} onPress={() => setOpen(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.white} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map(option => {
                const selected = option === value;

                return (
                  <Pressable
                    key={option}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <AppText style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option}
                    </AppText>
                    {selected ? <MaterialCommunityIcons name="check" size={20} color={colors.orange} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function SummaryTile({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: number | string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.summaryTile,
        active && styles.summaryTileActive,
        pressed && styles.pressed,
      ]}
    >
      <Title style={styles.summaryValue}>{value}</Title>
      <AppText style={[styles.summaryLabel, active && styles.summaryLabelActive]}>{label}</AppText>
    </Pressable>
  );
}

function PartCard({
  part,
  onEdit,
}: {
  part: Part;
  onEdit: () => void;
}) {
  return (
    <Card style={styles.partCard}>
      <View style={styles.partHeaderRow}>
        <View style={styles.partTitleWrap}>
          <AppText style={styles.partTitle} numberOfLines={1}>{part.name}</AppText>
          <AppText style={styles.partMeta} numberOfLines={1}>
            {part.system || 'General'}{part.vendor ? ` • ${part.vendor}` : ''}
          </AppText>
        </View>

        <View style={styles.statusBadge}>
          <AppText style={styles.statusText}>{displayStatus(part.status)}</AppText>
        </View>
      </View>

      {part.description ? (
        <AppText style={styles.descriptionText} numberOfLines={2}>{part.description}</AppText>
      ) : null}

      <View style={styles.costRow}>
        <View style={styles.costPill}>
          <Label>EST</Label>
          <AppText style={styles.costValue}>{money(part.estimatedCost)}</AppText>
        </View>
        <View style={styles.costPill}>
          <Label>ACTUAL</Label>
          <AppText style={styles.costValue}>{money(part.actualCost)}</AppText>
        </View>
      </View>

      <View style={styles.cardActionRow}>
        <Pressable style={styles.cardActionButton} onPress={showPricingUnavailable}>
          <MaterialCommunityIcons name="tag-search-outline" size={17} color={colors.orange} />
          <AppText style={styles.cardActionText}>Pricing later</AppText>
        </Pressable>

        <Pressable style={styles.cardActionButton} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color={colors.orange} />
          <AppText style={styles.cardActionText}>Edit</AppText>
        </Pressable>
      </View>
    </Card>
  );
}

function PartFormSheet({
  visible,
  mode,
  part,
  workAreas,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  mode: 'add' | 'edit';
  part: Part | null;
  workAreas: string[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    estimatedCost?: number;
    actualCost?: number;
    vendor?: string;
    status: PartStatus;
    system: string;
    description?: string;
  }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [vendor, setVendor] = useState('');
  const [status, setStatus] = useState<PartStatus>('Needed');
  const [system, setSystem] = useState(workAreas[0] || 'General');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && part) {
      setName(part.name || '');
      setEstimatedCost(part.estimatedCost ? String(part.estimatedCost) : '');
      setActualCost(part.actualCost ? String(part.actualCost) : '');
      setVendor(part.vendor || '');
      setStatus(normalizePartStatus(part.status));
      setSystem(part.system || workAreas[0] || 'General');
      setDescription(part.description || part.notes || '');
      return;
    }

    setName('');
    setEstimatedCost('');
    setActualCost('');
    setVendor('');
    setStatus('Needed');
    setSystem(workAreas[0] || 'General');
    setDescription('');
  }, [mode, part, visible, workAreas]);

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Part name required', 'Add a part name before saving.');
      return;
    }

    onSave({
      name: name.trim(),
      estimatedCost: parseMoney(estimatedCost),
      actualCost: parseMoney(actualCost),
      vendor: vendor.trim() || undefined,
      status,
      system: system.trim() || 'General',
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Label>{mode === 'add' ? 'ADD PART' : 'EDIT PART'}</Label>
              <Title style={styles.sheetTitle}>{mode === 'add' ? 'Part details' : 'Update part'}</Title>
            </View>
            <Pressable style={styles.sheetClose} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={colors.white} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Part Name"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <View style={styles.twoCol}>
              <TextInput
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                placeholder="Estimated Cost"
                placeholderTextColor={colors.steel}
                keyboardType="numeric"
                style={[styles.input, styles.twoColInput]}
              />
              <TextInput
                value={actualCost}
                onChangeText={setActualCost}
                placeholder="Actual Cost"
                placeholderTextColor={colors.steel}
                keyboardType="numeric"
                style={[styles.input, styles.twoColInput]}
              />
            </View>

            <TextInput
              value={vendor}
              onChangeText={setVendor}
              placeholder="Vendor optional"
              placeholderTextColor={colors.steel}
              style={styles.input}
            />

            <SelectField
              label="STATUS"
              value={displayStatus(status)}
              options={PART_STATUSES}
              onChange={value => setStatus(normalizePartStatus(value))}
            />

            <SelectField
              label="WORK AREA"
              value={system}
              options={workAreas}
              onChange={setSystem}
            />

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={colors.steel}
              multiline
              style={[styles.input, styles.descriptionInput]}
            />

            <Pressable style={styles.saveButton} onPress={save}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
              <AppText style={styles.saveButtonText}>{mode === 'add' ? 'Add Part' : 'Save Changes'}</AppText>
            </Pressable>

            {mode === 'edit' && onDelete ? (
              <Pressable style={styles.deleteButton} onPress={onDelete}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.red} />
                <AppText style={styles.deleteText}>Delete Part</AppText>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function PartsScreen() {
  const store = useFabricatorStore();
  const project = store.activeProject();
  const workAreas = useMemo(() => getWorkAreas(project?.category), [project?.category]);

  const [filter, setFilter] = useState<PartFilter>('Needed');
  const [addOpen, setAddOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const parts = store.parts.filter((part: Part) => part.projectId === store.selectedProjectId);
  const visibleParts = parts.filter((part: Part) => filterMatches(part, filter));

  const counts = useMemo(() => ({
    Needed: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Needed').length,
    Ordered: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Ordered').length,
    Received: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Received').length,
    Installed: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Installed').length,
    All: parts.length,
  }), [parts]);

  const estimatedTotal = parts.reduce((sum: number, part: Part) => sum + (part.estimatedCost || 0), 0);
  const actualTotal = parts.reduce((sum: number, part: Part) => sum + (part.actualCost || 0), 0);
  const remainingTotal = Math.max(estimatedTotal - actualTotal, 0);
  const blockerParts = parts.filter((part: Part) => {
    const status = normalizePartStatus(part.status);
    return status === 'Needed' || status === 'Ordered';
  });

  const saveNewPart = (data: {
    name: string;
    estimatedCost?: number;
    actualCost?: number;
    vendor?: string;
    status: PartStatus;
    system: string;
    description?: string;
  }) => {
    store.addPart(
      data.name,
      data.system,
      data.vendor,
      undefined,
      data.description,
      data.estimatedCost,
      data.actualCost,
      data.status
    );

    setAddOpen(false);
  };

  const saveExistingPart = (data: {
    name: string;
    estimatedCost?: number;
    actualCost?: number;
    vendor?: string;
    status: PartStatus;
    system: string;
    description?: string;
  }) => {
    if (!editingPart) return;

    store.updatePart(editingPart.id, {
      name: data.name,
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
      vendor: data.vendor,
      status: data.status,
      system: data.system,
      description: data.description,
    });

    setEditingPart(null);
  };

  const deleteEditingPart = () => {
    if (!editingPart) return;

    Alert.alert('Delete part?', `Remove ${editingPart.name} from this project?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          store.deletePart(editingPart.id);
          setEditingPart(null);
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Label>PARTS</Label>
            <Title style={styles.headerTitle}>Parts List</Title>
            <AppText style={styles.headerCopy}>Track what is needed, ordered, received, and installed.</AppText>
          </View>

          <Pressable style={styles.addButton} onPress={() => setAddOpen(true)}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
          </Pressable>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            {PART_FILTERS.slice(0, 4).map((item: PartFilter) => (
              <SummaryTile
                key={item}
                label={item}
                value={counts[item]}
                active={filter === item}
                onPress={() => setFilter(item)}
              />
            ))}
          </View>

          <View style={styles.budgetRow}>
            <View style={styles.budgetPill}>
              <Label>ESTIMATED</Label>
              <AppText style={styles.budgetValue}>{money(estimatedTotal)}</AppText>
            </View>
            <View style={styles.budgetPill}>
              <Label>ACTUAL</Label>
              <AppText style={styles.budgetValue}>{money(actualTotal)}</AppText>
            </View>
            <View style={styles.budgetPill}>
              <Label>LEFT</Label>
              <AppText style={styles.budgetValue}>{money(remainingTotal)}</AppText>
            </View>
          </View>
        </Card>

        <Card style={styles.blockerCard}>
          <View style={styles.blockerHeader}>
            <View>
              <Label>BLOCKERS</Label>
              <AppText style={styles.blockerTitle}>
                {blockerParts.length ? `${blockerParts.length} parts to chase` : 'No part blockers'}
              </AppText>
            </View>

            <Pressable style={styles.blockerFilterButton} onPress={() => setFilter('Needed')}>
              <AppText style={styles.blockerFilterText}>Needed</AppText>
            </Pressable>
          </View>

          {blockerParts.length ? (
            blockerParts.slice(0, 3).map((part: Part) => (
              <View key={part.id} style={styles.blockerRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.orange} />
                <AppText style={styles.blockerText} numberOfLines={1}>
                  {part.name} · {displayStatus(part.status)} · {part.system || 'General'}
                </AppText>
              </View>
            ))
          ) : (
            <AppText style={styles.blockerEmptyText}>
              Needed and ordered parts will appear here when they can slow the next shop session.
            </AppText>
          )}
        </Card>

        <Pressable style={styles.addPartCard} onPress={() => setAddOpen(true)}>
          <View style={styles.addPartIcon}>
            <MaterialCommunityIcons name="package-variant-plus" size={22} color={colors.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.addPartTitle}>Add Part</AppText>
            <AppText style={styles.addPartCopy}>Part name, costs, vendor, status, work area, and description.</AppText>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.steel} />
        </Pressable>

        <View style={styles.listHeader}>
          <View>
            <Label>{filter.toUpperCase()}</Label>
            <Title style={styles.listTitle}>{visibleParts.length} parts</Title>
          </View>
          <Pressable style={styles.allButton} onPress={() => setFilter(filter === 'All' ? 'Needed' : 'All')}>
            <AppText style={styles.allButtonText}>{filter === 'All' ? 'Needed' : 'All'}</AppText>
          </Pressable>
        </View>

        {visibleParts.length ? (
          visibleParts.map((part: Part) => (
            <PartCard
              key={part.id}
              part={part}
              onEdit={() => setEditingPart(part)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="package-variant" size={38} color={colors.orange} />
            <Title style={styles.emptyTitle}>No parts here</Title>
            <AppText style={styles.emptyCopy}>Add a part or switch to All to review the full parts list.</AppText>
          </Card>
        )}
      </ScrollView>

      <PartFormSheet
        visible={addOpen}
        mode="add"
        part={null}
        workAreas={workAreas}
        onClose={() => setAddOpen(false)}
        onSave={saveNewPart}
      />

      <PartFormSheet
        visible={!!editingPart}
        mode="edit"
        part={editingPart}
        workAreas={workAreas}
        onClose={() => setEditingPart(null)}
        onSave={saveExistingPart}
        onDelete={deleteEditingPart}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 34,
    marginTop: 4,
  },
  headerCopy: {
    color: colors.steel,
    marginTop: 5,
    lineHeight: 19,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderColor: 'rgba(217,106,29,0.32)',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  summaryTile: {
    width: '48.5%',
    minHeight: 80,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    justifyContent: 'center',
  },
  summaryTileActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  summaryValue: {
    fontSize: 27,
    lineHeight: 30,
  },
  summaryLabel: {
    color: colors.steel,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryLabelActive: {
    color: colors.white,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  budgetPill: {
    flex: 1,
    backgroundColor: colors.graphite,
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
  blockerCard: {
    borderColor: 'rgba(217,106,29,0.28)',
    marginBottom: 12,
  },
  blockerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  blockerTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  blockerFilterButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.45)',
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  blockerFilterText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '900',
  },
  blockerRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  blockerText: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  blockerEmptyText: {
    color: colors.steel,
    lineHeight: 20,
  },
  addPartCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: spacing.md,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addPartIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
  },
  addPartTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  addPartCopy: {
    color: colors.steel,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 24,
    lineHeight: 29,
  },
  allButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  allButtonText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 12,
  },
  partCard: {
    marginBottom: 10,
    padding: spacing.md,
  },
  partHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  partTitleWrap: {
    flex: 1,
  },
  partTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  partMeta: {
    color: colors.steel,
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(217,106,29,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  descriptionText: {
    color: colors.muted,
    marginTop: 10,
    lineHeight: 19,
  },
  costRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  costPill: {
    flex: 1,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 10,
  },
  costValue: {
    color: colors.white,
    fontWeight: '900',
    marginTop: 4,
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cardActionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  cardActionText: {
    color: colors.orange,
    fontWeight: '900',
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 27,
    marginTop: 12,
  },
  emptyCopy: {
    textAlign: 'center',
    color: colors.steel,
    marginTop: 8,
    lineHeight: 20,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.panelHigh,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  sheetHandle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 25,
    lineHeight: 30,
  },
  sheetClose: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: {
    color: colors.white,
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 10,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColInput: {
    flex: 1,
  },
  descriptionInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  selectField: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  selectValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '900',
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(181,91,85,0.55)',
    backgroundColor: '#351311',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  deleteText: {
    color: colors.red,
    fontWeight: '900',
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownCard: {
    maxHeight: '70%',
    backgroundColor: colors.panelHigh,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownTitle: {
    fontSize: 24,
    lineHeight: 29,
  },
  dropdownClose: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.md,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowSelected: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  optionText: {
    color: colors.white,
    fontWeight: '800',
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
