import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
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
import { colors, radius, spacing } from '@/theme/theme';

function getSystems(category?: string) {
  switch (category) {
    case 'Woodworking':
      return [
        'Lumber',
        'Hardware',
        'Finishing',
        'Joinery',
        'Electrical',
        'Shop Supplies',
      ];

    case 'Metal Fabrication':
      return [
        'Steel',
        'Aluminum',
        'Hardware',
        'Welding',
        'Electrical',
        'Shop Supplies',
      ];

    case 'Restoration':
      return [
        'Body',
        'Paint',
        'Interior',
        'Electrical',
        'Suspension',
        'Engine',
      ];

    case 'Motorcycle Build':
      return [
        'Frame',
        'Engine',
        'Electrical',
        'Suspension',
        'Body',
        'Shop Supplies',
      ];

    default:
      return [
        'Chassis',
        'Engine',
        'Electrical',
        'Body',
        'Interior',
        'Shop Supplies',
      ];
  }
}

const statuses = [
  'To Buy',
  'On Shelf',
  'Installed',
] as const;

function buildSearchQuery(part: any) {
  return [
    part.name,
    part.partNumber,
    part.vendor,
  ]
    .filter(Boolean)
    .join(' ');
}

function PartRow({
  part,
  onPress,
}: {
  part: any;
  onPress: () => void;
}) {
  const search = () => {
    const query = buildSearchQuery(part);

    Linking.openURL(
      `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.partRow,
        pressed && styles.pressed,
      ]}
    >
      <View style={{ flex: 1 }}>
        <AppText style={styles.partTitle}>
          {part.name}
        </AppText>

        {part.partNumber ? (
          <AppText style={styles.partNumber}>
            {part.partNumber}
          </AppText>
        ) : null}

        {part.vendor ? (
          <AppText style={styles.vendorText}>
            {part.vendor}
          </AppText>
        ) : null}

        {part.description ? (
          <AppText style={styles.description}>
            {part.description}
          </AppText>
        ) : null}

        {part.estimatedCost ? (
          <AppText style={styles.costText}>
            Estimated: $
            {part.estimatedCost.toFixed(2)}
          </AppText>
        ) : null}

        {part.actualCost ? (
          <AppText style={styles.costText}>
            Actual: $
            {part.actualCost.toFixed(2)}
          </AppText>
        ) : null}

        <View style={styles.metaRow}>
          <Label>{part.system}</Label>

          <AppText style={styles.status}>
            {part.status}
          </AppText>
        </View>
      </View>

      <Pressable
        style={styles.searchButton}
        onPress={search}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.orange}
        />
      </Pressable>
    </Pressable>
  );
}

export function PartsScreen() {
  const store = useFabricatorStore();
  const project = store.activeProject();

const systems = getSystems(project?.category);

  const [name, setName] = useState('');
  const [partNumber, setPartNumber] =
    useState('');
  const [vendor, setVendor] = useState('');
  const [estimatedCost, setEstimatedCost] =
    useState('');
  const [actualCost, setActualCost] =
    useState('');
  const [description, setDescription] =
    useState('');
  const [system, setSystem] =
    useState('Chassis');

  const [activeStatus, setActiveStatus] =
    useState<typeof statuses[number]>(
      'To Buy'
    );

  const parts = store.parts.filter(
    p => p.projectId === store.selectedProjectId
  );

  const grouped = useMemo(
    () => ({
      'To Buy': parts.filter(
        p => p.status === 'Need to Order'
      ),

      'On Shelf': parts.filter(
        p =>
          p.status === 'On Hand' ||
          p.status === 'Ordered'
      ),

      Installed: parts.filter(
        p => p.status === 'Installed'
      ),
    }),
    [parts]
  );

  const visibleParts =
    grouped[activeStatus] || [];

  const totalEstimated = parts.reduce(
    (sum, part) =>
      sum + (part.estimatedCost || 0),
    0
  );

  const totalActual = parts.reduce(
    (sum, part) =>
      sum + (part.actualCost || 0),
    0
  );

  const save = () => {
    if (!name.trim()) return;

    store.addPart(
      name.trim(),
      system,
      vendor.trim(),
      partNumber.trim(),
      description.trim(),
      estimatedCost
        ? Number(estimatedCost)
        : undefined,
      actualCost
        ? Number(actualCost)
        : undefined
    );

    setName('');
    setPartNumber('');
    setVendor('');
    setEstimatedCost('');
    setActualCost('');
    setDescription('');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Label>PARTS WORKFLOW</Label>

        <Title style={styles.heroTitle}>
          Shop Parts + Materials
        </Title>

        <AppText style={styles.heroCopy}>
          Quick capture for fabrication
          parts, hardware, materials, and
          supplies.
        </AppText>
      </View>

      <Card style={styles.createCard}>
        <View style={styles.headerRow}>
          <View>
            <Label>QUICK CAPTURE</Label>

            <Title style={styles.cardTitle}>
              Type or dictate
            </Title>
          </View>

          <MaterialCommunityIcons
            name="microphone-message"
            size={30}
            color={colors.orange}
          />
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Part name"
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

        <TextInput
          value={estimatedCost}
          onChangeText={setEstimatedCost}
          placeholder="Estimated Cost"
          placeholderTextColor={colors.steel}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          value={actualCost}
          onChangeText={setActualCost}
          placeholder="Actual Cost"
          placeholderTextColor={colors.steel}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          value={vendor}
          onChangeText={setVendor}
          placeholder="Vendor"
          placeholderTextColor={colors.steel}
          style={styles.input}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description or notes"
          placeholderTextColor={colors.steel}
          multiline
          style={[
            styles.input,
            { minHeight: 90 },
          ]}
        />

        <View style={styles.chips}>
          {systems.map(item => (
            <Pressable
              key={item}
              onPress={() => setSystem(item)}
              style={[
                styles.chip,
                system === item &&
                  styles.chipActive,
              ]}
            >
              <AppText
                style={[
                  styles.chipText,
                  system === item &&
                    styles.chipTextActive,
                ]}
              >
                {item}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Button
          title="Save Part"
          onPress={save}
        />
      </Card>

      <Card style={styles.budgetCard}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Label>ESTIMATED</Label>

            <Title style={styles.budgetValue}>
              ${totalEstimated.toFixed(2)}
            </Title>
          </View>

          <View
            style={styles.budgetDivider}
          />

          <View style={styles.budgetItem}>
            <Label>ACTUAL</Label>

            <Title style={styles.budgetValue}>
              ${totalActual.toFixed(2)}
            </Title>
          </View>
        </View>
      </Card>

      <View style={styles.segmentBar}>
        {statuses.map(status => (
          <Pressable
            key={status}
            onPress={() =>
              setActiveStatus(status)
            }
            style={[
              styles.segment,
              status === activeStatus &&
                styles.segmentActive,
            ]}
          >
            <AppText
              style={[
                styles.segmentText,
                status === activeStatus &&
                  styles.segmentTextActive,
              ]}
            >
              {status}
            </AppText>

            <View
              style={[
                styles.countBubble,
                status === activeStatus &&
                  styles.countBubbleActive,
              ]}
            >
              <AppText style={styles.countText}>
                {grouped[status]?.length || 0}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Label>{activeStatus}</Label>

          <Title style={styles.sectionTitle}>
            {visibleParts.length} items
          </Title>
        </View>

        <AppText style={styles.helper}>
          Tap item to cycle status.
        </AppText>
      </View>

      {visibleParts.length ? (
        visibleParts.map(p => (
          <PartRow
            key={p.id}
            part={p}
            onPress={() =>
              store.cyclePart(p.id)
            }
          />
        ))
      ) : (
        <Card>
          <AppText>
            No items here yet.
          </AppText>
        </Card>
      )}

      <View style={{ height: 80 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.panelHigh,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },

  heroCopy: {
    marginTop: 10,
    lineHeight: 22,
    color: colors.white,
  },

  createCard: {
    borderColor:
      'rgba(217,106,29,0.35)',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 22,
    lineHeight: 28,
  },

  input: {
    color: colors.white,
    backgroundColor: colors.graphite,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 12,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },

  chip: {
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  chipActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },

  chipText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '800',
  },

  chipTextActive: {
    color: colors.white,
  },

  budgetCard: {
    marginBottom: 18,
    borderColor:
      'rgba(217,106,29,0.35)',
  },

  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },

  budgetDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.line,
  },

  budgetValue: {
    marginTop: 8,
    color: colors.orange,
  },

  segmentBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  segment: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },

  segmentActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },

  segmentText: {
    fontSize: 13,
    color: colors.steel,
    fontWeight: '900',
  },

  segmentTextActive: {
    color: colors.white,
  },

  countBubble: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.graphite,
    alignItems: 'center',
  },

  countBubbleActive: {
    backgroundColor: colors.orange,
  },

  countText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '900',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 26,
    lineHeight: 32,
  },

  helper: {
    fontSize: 12,
    color: colors.steel,
  },

  partRow: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  partTitle: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '900',
  },

  partNumber: {
    marginTop: 4,
    color: colors.orange,
    fontWeight: '800',
  },

  vendorText: {
    marginTop: 6,
    color: colors.white,
  },

  description: {
    marginTop: 8,
    color: colors.steel,
    lineHeight: 20,
  },

  costText: {
    marginTop: 6,
    color: colors.orange,
    fontWeight: '800',
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  status: {
    fontSize: 12,
    color: colors.steel,
    fontWeight: '800',
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});