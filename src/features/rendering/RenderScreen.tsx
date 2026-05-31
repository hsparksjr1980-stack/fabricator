import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { estimateRoughMaterial, MaterialKind } from '@/services/materials/materialEstimateService';
import { colors, radius, spacing } from '@/theme/theme';
import { BuildPhoto, BuildTask, Part } from '@/types/models';

const advisorModes = [
  {
    key: 'priority',
    title: 'Priority Advisor',
    icon: 'format-list-numbered',
    copy: 'Turn the current project into a practical next-session order.',
  },
  {
    key: 'trouble',
    title: 'Troubleshooting',
    icon: 'wrench-clock',
    copy: 'Use project context and your question to narrow down the next move.',
  },
  {
    key: 'photo',
    title: 'Photo Review',
    icon: 'image-search-outline',
    copy: 'Review a build photo for fitment, missing items, and safety concerns.',
  },
  {
    key: 'materials',
    title: 'Material Estimate',
    icon: 'ruler-square',
    copy: 'Rough planning calculator for shop materials.',
  },
] as const;

type AdvisorMode = typeof advisorModes[number]['key'];

function buildProjectContext(store: any) {
  const project = store.activeProject();
const tasks = store.tasks.filter((task: BuildTask) => task.projectId === store.selectedProjectId);
const parts = store.parts.filter((part: Part) => part.projectId === store.selectedProjectId);
const photos = store.photos.filter((photo: BuildPhoto) => photo.projectId === store.selectedProjectId);
  const activities = (store.activities || []).filter((activity: any) => activity.projectId === store.selectedProjectId).slice(0, 8);

  return {
    project,
    openTasks: tasks.filter((task: BuildTask) => task.status !== 'Done' && task.status !== 'Completed'),
    completedTasks: tasks.filter((task: BuildTask) => task.status === 'Done' || task.status === 'Completed'),
    neededParts: parts.filter((part: Part) => part.status === 'Need to Order' || part.status === 'Ordered'),
    onHandParts: parts.filter((part: Part) => part.status === 'On Hand'),
    installedParts: parts.filter((part: Part) => part.status === 'Installed'),
    recentPhotos: photos.slice(0, 5),
    recentActivity: activities,
  };
}

function makePreview(mode: AdvisorMode, context: ReturnType<typeof buildProjectContext>, question: string) {
  if (!context.project) {
    return [
      'Create or select a project before using Advisor.',
    ];
  }

  if (mode === 'priority') {
    const blockers = context.neededParts.slice(0, 2).map((part: Part) => `Confirm/order ${part.name}.`);
    const openTasks = context.openTasks.slice(0, 3).map((task: BuildTask) => `${task.title} (${task.system}).`);
    return [
      ...blockers,
      ...openTasks,
      'Do final fitment and safety checks before cosmetic work.',
    ].slice(0, 4);
  }

  if (mode === 'trouble') {
    return [
      question.trim() ? `Problem to solve: ${question.trim()}` : 'Describe the specific fitment, electrical, parts, or sequencing problem.',
      'Check whether any needed parts are blocking the work.',
      'Look for the lowest-risk reversible test before cutting, welding, drilling, or ordering.',
      'Turn the answer into one next-session checklist item.',
    ];
  }

  if (mode === 'photo') {
    return [
      'Look for clearance, fastener access, routing, support, and safety concerns.',
      'Compare the photo against open tasks and needed parts.',
      'Create a short punch list from anything visible in the image.',
    ];
  }

  return [];
}

export function RenderScreen() {
  const store = useFabricatorStore();
  const [mode, setMode] = useState<AdvisorMode>('priority');
  const [question, setQuestion] = useState('What should I do first before the next shop session?');
  const [image, setImage] = useState('');
  const [material, setMaterial] = useState<MaterialKind>('steel');
  const [lengthFeet, setLengthFeet] = useState('8');
  const [widthInches, setWidthInches] = useState('4');
  const [thicknessInches, setThicknessInches] = useState('0.125');
  const [quantity, setQuantity] = useState('4');
  const [waste, setWaste] = useState('12');

  const context = useMemo(() => buildProjectContext(store), [store]);
  const preview = useMemo(() => makePreview(mode, context, question), [mode, context, question]);

  const estimate = useMemo(
    () =>
      estimateRoughMaterial({
        materialKind: material,
        lengthFeet: Number(lengthFeet) || 0,
        widthInches: Number(widthInches) || 0,
        thicknessInches: Number(thicknessInches) || 0,
        quantity: Number(quantity) || 1,
        wastePercent: Number(waste) || 0,
      }),
    [material, lengthFeet, widthInches, thicknessInches, quantity, waste]
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) setImage(result.assets[0].uri);
  };

  return (
    <Screen>
      <View style={styles.heroPanel}>
        <Label>AI TOOLS</Label>
        <Title style={styles.heroTitle}>Narrow Advisor, Not Open Chat</Title>
        <AppText style={styles.heroCopy}>
          Advisor uses the selected project, tasks, parts, photos, and recent activity to produce focused help. API calls should go through a backend or serverless endpoint later, not directly from the mobile app.
        </AppText>
        <View style={styles.contextBadge}>
          <MaterialCommunityIcons name="database-eye" size={16} color={colors.orange} />
          <AppText style={styles.badgeText}>
            {context.project?.name || 'No project selected'} • {context.openTasks.length} open tasks • {context.neededParts.length} parts blocking
          </AppText>
        </View>
      </View>

      <View style={styles.modeGrid}>
        {advisorModes.map(item => (
          <Pressable key={item.key} onPress={() => setMode(item.key)} style={[styles.modeCard, mode === item.key && styles.modeCardActive]}>
            <MaterialCommunityIcons name={item.icon as any} size={26} color={colors.orange} />
            <AppText style={styles.modeTitle}>{item.title}</AppText>
            <AppText style={styles.modeCopy}>{item.copy}</AppText>
          </Pressable>
        ))}
      </View>

      {mode === 'priority' ? (
        <Card style={styles.focusCard}>
          <View style={styles.cardTop}>
            <View>
              <Label>PRIORITY ADVISOR</Label>
              <Title style={styles.cardTitle}>What should happen first?</Title>
            </View>
            <MaterialCommunityIcons name="format-list-checks" size={28} color={colors.orange} />
          </View>
          <TextInput value={question} onChangeText={setQuestion} multiline placeholder="Add extra context if needed." placeholderTextColor={colors.steel} style={styles.textArea} />
          <Card style={styles.mockResult}>
            <Label>LOCAL PREVIEW</Label>
            {preview.map((item, index) => (
              <AppText key={`${item}-${index}`} style={styles.listItem}>{index + 1}. {item}</AppText>
            ))}
          </Card>
          <Button title="Backend AI Endpoint Placeholder" />
        </Card>
      ) : null}

      {mode === 'trouble' ? (
        <Card style={styles.focusCard}>
          <View style={styles.cardTop}>
            <View>
              <Label>TROUBLESHOOTING</Label>
              <Title style={styles.cardTitle}>Describe the problem</Title>
            </View>
            <MaterialCommunityIcons name="wrench-clock" size={28} color={colors.orange} />
          </View>
          <TextInput value={question} onChangeText={setQuestion} multiline placeholder="Example: steering shaft clearance is tight near the header." placeholderTextColor={colors.steel} style={styles.textArea} />
          <Card style={styles.mockResult}>
            <Label>LOCAL PREVIEW</Label>
            {preview.map((item, index) => (
              <AppText key={`${item}-${index}`} style={styles.listItem}>{index + 1}. {item}</AppText>
            ))}
          </Card>
          <Button title="Ask Advisor Placeholder" />
        </Card>
      ) : null}

      {mode === 'photo' ? (
        <Card style={styles.focusCard}>
          <View style={styles.cardTop}>
            <View>
              <Label>PHOTO REVIEW</Label>
              <Title style={styles.cardTitle}>Analyze a build photo</Title>
            </View>
            <MaterialCommunityIcons name="image-search-outline" size={28} color={colors.orange} />
          </View>
          <AppText style={{ marginBottom: 12 }}>
            Upload a photo or sketch for future backend vision review. This should be used for fitment, safety, routing, missing parts, and sequencing—not open-ended chat.
          </AppText>
          <Button title={image ? 'Change image' : 'Upload reference photo'} variant="ghost" onPress={pickImage} />
          {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
          <Card style={styles.mockResult}>
            <Label>LOCAL PREVIEW</Label>
            {preview.map((item, index) => (
              <AppText key={`${item}-${index}`} style={styles.listItem}>{index + 1}. {item}</AppText>
            ))}
          </Card>
        </Card>
      ) : null}

      {mode === 'materials' ? (
        <Card style={styles.focusCard}>
          <View style={styles.cardTop}>
            <View>
              <Label>MATERIAL PLANNER</Label>
              <Title style={styles.cardTitle}>Rough estimate</Title>
            </View>
            <MaterialCommunityIcons name="ruler-square" size={28} color={colors.orange} />
          </View>
          <View style={styles.row}>
            {(['steel', 'aluminum', 'wood'] as MaterialKind[]).map(type => (
              <Button key={type} title={type} variant={material === type ? 'primary' : 'ghost'} onPress={() => setMaterial(type)} />
            ))}
          </View>
          <TextInput value={lengthFeet} onChangeText={setLengthFeet} placeholder="Length feet" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input} />
          <TextInput value={widthInches} onChangeText={setWidthInches} placeholder="Width inches" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input} />
          <TextInput value={thicknessInches} onChangeText={setThicknessInches} placeholder="Thickness inches" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input} />
          <TextInput value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input} />
          <TextInput value={waste} onChangeText={setWaste} placeholder="Waste percent" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input} />
          <Card style={styles.mockResult}>
            <Label>ROUGH ESTIMATE</Label>
            <AppText>Linear Feet: {estimate.linearFeet}</AppText>
            <AppText>Volume: {estimate.volumeCubicInches} cubic inches</AppText>
            <AppText>Estimated Weight: {estimate.estimatedWeightLb} lb</AppText>
            {material === 'wood' ? <AppText>Board Feet: {estimate.boardFeet}</AppText> : null}
          </Card>
        </Card>
      ) : null}

      <View style={{ height: 40 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroPanel: { backgroundColor: colors.panelHigh, borderColor: colors.line, borderWidth: 1, borderRadius: radius.xl, padding: spacing.lg, marginBottom: 18 },
  heroTitle: { fontSize: 34, lineHeight: 39 },
  heroCopy: { color: colors.white, marginTop: 10, lineHeight: 22 },
  contextBadge: { alignSelf: 'flex-start', flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: colors.orangeSoft, borderColor: 'rgba(217,106,29,0.35)', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, marginTop: 16 },
  badgeText: { fontSize: 12, color: colors.white, fontWeight: '900' },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  modeCard: { width: '48%', backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: radius.lg, padding: 14, minHeight: 132 },
  modeCardActive: { borderColor: colors.orange, backgroundColor: colors.panelHigh },
  modeTitle: { color: colors.white, fontWeight: '900', fontSize: 15, marginTop: 8 },
  modeCopy: { fontSize: 12, color: colors.muted, marginTop: 6, lineHeight: 17 },
  focusCard: { borderColor: 'rgba(217,106,29,0.35)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardTitle: { fontSize: 23, lineHeight: 29 },
  textArea: { minHeight: 130, backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, color: colors.white, padding: spacing.md, borderRadius: radius.md, marginBottom: 12, textAlignVertical: 'top' },
  mockResult: { backgroundColor: colors.charcoal, borderColor: colors.line, marginTop: 12, marginBottom: 12 },
  listItem: { color: colors.white, marginTop: 8 },
  image: { height: 220, borderRadius: radius.md, marginTop: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 14 },
  input: { backgroundColor: colors.graphite, borderWidth: 1, borderColor: colors.line, color: colors.white, padding: spacing.md, borderRadius: radius.md, marginBottom: 12 },
});
