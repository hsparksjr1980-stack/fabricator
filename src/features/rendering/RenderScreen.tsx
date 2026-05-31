import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { buildAdvisorProjectContext, getAdvisorProviders, runAdvisorTool } from '@/services/advisor/advisorService';
import { AdvisorProviderKey, AdvisorStructuredResponse, AdvisorToolKey } from '@/services/advisor/advisorTypes';
import { colors, radius, spacing } from '@/theme/theme';

const ADVISOR_TOOLS: {
  key: AdvisorToolKey;
  title: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  copy: string;
  missingPrompt: string;
}[] = [
  {
    key: 'priority',
    title: 'Priority Advisor',
    label: 'PRIORITY',
    icon: 'format-list-numbered',
    copy: 'One next-session order based on project phase, open tasks, parts, and recent activity.',
    missingPrompt: 'Optional: add deadline, available shop time, or anything blocking you.',
  },
  {
    key: 'troubleshooting',
    title: 'Troubleshooting Assistant',
    label: 'TROUBLESHOOT',
    icon: 'wrench-clock',
    copy: 'One safe diagnostic plan. No chat thread or history.',
    missingPrompt: 'Describe the symptom, where it happens, and what changed recently.',
  },
  {
    key: 'photoReview',
    title: 'Photo Review',
    label: 'PHOTO REVIEW',
    icon: 'image-search-outline',
    copy: 'One structured photo review for fitment, safety, routing, missing parts, and next actions.',
    missingPrompt: 'Optional: what should the photo be checked for?',
  },
];

function ToolCard({ selected, title, icon, copy, onPress }: {
  selected: boolean;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  copy: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.toolCard, selected && styles.toolCardActive, pressed && styles.pressed]}>
      <View style={styles.toolIconWrap}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.orange} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={styles.toolTitle}>{title}</AppText>
        <AppText style={styles.toolCopy}>{copy}</AppText>
      </View>
    </Pressable>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { label: string; value: string; description?: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find(option => option.value === value);

  return (
    <>
      <Pressable style={styles.selectField} onPress={() => setOpen(true)}>
        <View style={{ flex: 1 }}>
          <Label>{label}</Label>
          <AppText style={styles.selectValue}>{current?.label || value}</AppText>
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
                const selected = option.value === value;
                return (
                  <Pressable key={option.value} style={[styles.optionRow, selected && styles.optionRowSelected]} onPress={() => { onChange(option.value); setOpen(false); }}>
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</AppText>
                      {option.description ? <AppText style={styles.optionDescription}>{option.description}</AppText> : null}
                    </View>
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

function ResultCard({ result }: { result: AdvisorStructuredResponse }) {
  return (
    <Card style={styles.resultCard}>
      <View style={styles.resultHeaderRow}>
        <View style={{ flex: 1 }}>
          <Label>{result.isLiveProvider ? 'LIVE RESULT' : 'STRUCTURED PREVIEW'}</Label>
          <Title style={styles.resultTitle}>{result.headline}</Title>
        </View>
        <View style={styles.providerBadge}>
          <AppText style={styles.providerBadgeText}>{result.providerLabel}</AppText>
        </View>
      </View>

      <AppText style={styles.resultSummary}>{result.summary}</AppText>

      {result.sections.map(section => (
        <View key={section.title} style={styles.resultSection}>
          <AppText style={styles.resultSectionTitle}>{section.title}</AppText>
          {section.items.map((item, index) => (
            <AppText key={`${section.title}-${index}`} style={styles.resultItem}>{index + 1}. {item}</AppText>
          ))}
        </View>
      ))}

      <View style={styles.nextActionBox}>
        <Label>NEXT ACTION</Label>
        <AppText style={styles.nextActionText}>{result.nextAction}</AppText>
      </View>
    </Card>
  );
}

export function RenderScreen() {
  const [tool, setTool] = useState<AdvisorToolKey>('priority');
  const [providerKey, setProviderKey] = useState<AdvisorProviderKey>('geminiFlash');
  const [missingInformation, setMissingInformation] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [customEndpointUrl, setCustomEndpointUrl] = useState('');
  const [customModelName, setCustomModelName] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AdvisorStructuredResponse | null>(null);

  const context = useMemo(() => buildAdvisorProjectContext(), []);
  const providers = useMemo(() => getAdvisorProviders(), []);
  const activeTool = ADVISOR_TOOLS.find(item => item.key === tool) || ADVISOR_TOOLS[0];

  const providerOptions = providers.map(provider => ({
    label: provider.label,
    value: provider.key,
    description: provider.description,
  }));

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: false });
    if (!pickerResult.canceled && pickerResult.assets?.[0]) setPhotoUri(pickerResult.assets[0].uri);
  };

  const runTool = async () => {
    setRunning(true);
    try {
      const advisorResult = await runAdvisorTool({
        tool,
        providerKey,
        missingInformation,
        photoUri,
        customEndpointUrl: providerKey === 'customEndpoint' ? customEndpointUrl.trim() : undefined,
        customModelName: providerKey === 'customEndpoint' ? customModelName.trim() : undefined,
      });
      setResult(advisorResult);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.heroPanel}>
          <Label>AI ADVISOR</Label>
          <Title style={styles.heroTitle}>Advisor Tools</Title>
          <AppText style={styles.heroCopy}>
            Not a chatbot. Choose one tool, add only missing information, and get one structured response.
          </AppText>

          <View style={styles.contextGrid}>
            <View style={styles.contextPill}><Label>PROJECT</Label><AppText style={styles.contextValue}>{context.project?.name || 'None'}</AppText></View>
            <View style={styles.contextPill}><Label>CATEGORY</Label><AppText style={styles.contextValue}>{context.category || 'General'}</AppText></View>
            <View style={styles.contextPill}><Label>PHASE</Label><AppText style={styles.contextValue}>{context.phase || 'Planning'}</AppText></View>
            <View style={styles.contextPill}><Label>OPEN TASKS</Label><AppText style={styles.contextValue}>{context.openTasks.length}</AppText></View>
          </View>
        </Card>

        <View style={styles.toolGrid}>
          {ADVISOR_TOOLS.map(item => (
            <ToolCard key={item.key} selected={tool === item.key} title={item.title} icon={item.icon} copy={item.copy} onPress={() => { setTool(item.key); setResult(null); }} />
          ))}
        </View>

        <Card style={styles.configureCard}>
          <View style={styles.configureHeader}>
            <View style={{ flex: 1 }}>
              <Label>{activeTool.label}</Label>
              <Title style={styles.configureTitle}>{activeTool.title}</Title>
            </View>
            <MaterialCommunityIcons name={activeTool.icon} size={28} color={colors.orange} />
          </View>

          <SelectField label="AI PROVIDER" value={providerKey} options={providerOptions} onChange={value => { setProviderKey(value as AdvisorProviderKey); setResult(null); }} />

          <View style={styles.providerNote}>
            <MaterialCommunityIcons name="shield-key-outline" size={17} color={colors.orange} />
            <AppText style={styles.providerNoteText}>Fabricator owns context, prompt creation, and response formatting. Provider adapters can be swapped.</AppText>
          </View>

          {providerKey === 'customEndpoint' ? (
            <View style={styles.customBox}>
              <Label>USE YOUR OWN AI</Label>
              <TextInput value={customEndpointUrl} onChangeText={setCustomEndpointUrl} placeholder="Custom advisor endpoint" placeholderTextColor={colors.steel} autoCapitalize="none" style={styles.input} />
              <TextInput value={customModelName} onChangeText={setCustomModelName} placeholder="Model name optional" placeholderTextColor={colors.steel} autoCapitalize="none" style={styles.input} />
            </View>
          ) : null}

          <TextInput value={missingInformation} onChangeText={setMissingInformation} placeholder={activeTool.missingPrompt} placeholderTextColor={colors.steel} multiline style={styles.textArea} />

          {tool === 'photoReview' ? (
            <View style={styles.photoBox}>
              <Pressable style={styles.photoButton} onPress={pickPhoto}>
                <MaterialCommunityIcons name="image-plus" size={19} color={colors.orange} />
                <AppText style={styles.photoButtonText}>{photoUri ? 'Change Photo' : 'Attach Photo'}</AppText>
              </Pressable>
              {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : null}
            </View>
          ) : null}

          <Pressable style={styles.runButton} onPress={runTool} disabled={running}>
            <MaterialCommunityIcons name="auto-fix" size={19} color={colors.white} />
            <AppText style={styles.runButtonText}>{running ? 'Running Advisor...' : 'Run Advisor Tool'}</AppText>
          </Pressable>
        </Card>

        <Card style={styles.contextCard}>
          <Label>AUTOMATIC CONTEXT</Label>
          <View style={styles.contextRows}>
            <AppText style={styles.contextLine}>Project: {context.project?.name || 'None selected'}</AppText>
            <AppText style={styles.contextLine}>Category: {context.category || 'General'}</AppText>
            <AppText style={styles.contextLine}>Phase: {context.phase || 'Planning'}</AppText>
            <AppText style={styles.contextLine}>Open Tasks: {context.openTasks.length}</AppText>
            <AppText style={styles.contextLine}>Parts: {context.neededParts.length + context.orderedParts.length + context.receivedParts.length + context.installedParts.length}</AppText>
            <AppText style={styles.contextLine}>Recent Activity: {context.recentActivity.length}</AppText>
          </View>
        </Card>

        {result ? <ResultCard result={result} /> : null}

        <Card style={styles.architectureCard}>
          <Label>PROVIDER ARCHITECTURE</Label>
          <AppText style={styles.architectureLine}>UI → Advisor Service → Provider Adapter → Gemini/OpenAI/Claude/Ollama/Local</AppText>
          <AppText style={styles.architectureNote}>Gemini Flash is the initial provider target. The mobile app uses a structured preview unless a managed endpoint is configured.</AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 96 },
  heroPanel: { borderColor: 'rgba(217,106,29,0.34)', marginBottom: 14 },
  heroTitle: { fontSize: 31, lineHeight: 36, marginTop: 4 },
  heroCopy: { color: colors.steel, lineHeight: 20, marginTop: 8 },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 14 },
  contextPill: { width: '48.5%', backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 10 },
  contextValue: { color: colors.white, fontWeight: '900', marginTop: 3 },
  toolGrid: { gap: 10, marginBottom: 14 },
  toolCard: { backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  toolCardActive: { borderColor: colors.orange, backgroundColor: colors.panelHigh },
  toolIconWrap: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.orangeSoft, borderWidth: 1, borderColor: 'rgba(217,106,29,0.35)', alignItems: 'center', justifyContent: 'center' },
  toolTitle: { color: colors.white, fontSize: 16, fontWeight: '900' },
  toolCopy: { color: colors.steel, fontSize: 12, lineHeight: 17, marginTop: 4 },
  configureCard: { borderColor: 'rgba(217,106,29,0.34)', marginBottom: 14 },
  configureHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  configureTitle: { fontSize: 24, lineHeight: 29 },
  selectField: { minHeight: 58, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.charcoal, paddingHorizontal: spacing.md, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  selectValue: { color: colors.white, fontSize: 16, fontWeight: '900', marginTop: 3 },
  providerNote: { flexDirection: 'row', gap: 8, backgroundColor: colors.orangeSoft, borderColor: 'rgba(217,106,29,0.35)', borderWidth: 1, borderRadius: radius.md, padding: 10, marginBottom: 10 },
  providerNoteText: { color: colors.white, fontSize: 12, lineHeight: 17, flex: 1, fontWeight: '700' },
  customBox: { backgroundColor: colors.graphite, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, padding: 10, marginBottom: 10 },
  input: { color: colors.white, backgroundColor: colors.charcoal, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginTop: 10 },
  textArea: { color: colors.white, backgroundColor: colors.charcoal, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, minHeight: 104, padding: spacing.md, textAlignVertical: 'top', marginBottom: 12 },
  photoBox: { marginBottom: 12 },
  photoButton: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.graphite, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  photoButtonText: { color: colors.orange, fontWeight: '900' },
  photoPreview: { width: '100%', height: 170, borderRadius: radius.md, marginTop: 10 },
  runButton: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  runButtonText: { color: colors.white, fontWeight: '900' },
  contextCard: { marginBottom: 14 },
  contextRows: { marginTop: 8, gap: 5 },
  contextLine: { color: colors.muted, fontSize: 13 },
  resultCard: { borderColor: 'rgba(217,106,29,0.42)', marginBottom: 14 },
  resultHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  resultTitle: { fontSize: 24, lineHeight: 29, marginTop: 4 },
  providerBadge: { backgroundColor: colors.charcoal, borderColor: colors.line, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  providerBadgeText: { color: colors.orange, fontSize: 11, fontWeight: '900' },
  resultSummary: { color: colors.white, lineHeight: 21, marginTop: 12 },
  resultSection: { marginTop: 14, backgroundColor: colors.charcoal, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, padding: 12 },
  resultSectionTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 8 },
  resultItem: { color: colors.muted, lineHeight: 20, marginBottom: 5 },
  nextActionBox: { marginTop: 14, backgroundColor: colors.orangeSoft, borderColor: 'rgba(217,106,29,0.35)', borderWidth: 1, borderRadius: radius.md, padding: 12 },
  nextActionText: { color: colors.white, fontWeight: '900', lineHeight: 20, marginTop: 4 },
  architectureCard: { marginBottom: 20 },
  architectureLine: { color: colors.white, fontWeight: '900', marginTop: 8, lineHeight: 20 },
  architectureNote: { color: colors.steel, marginTop: 8, lineHeight: 20 },
  dropdownOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  dropdownBackdrop: { ...StyleSheet.absoluteFillObject },
  dropdownCard: { maxHeight: '70%', backgroundColor: colors.panelHigh, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: spacing.lg },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dropdownTitle: { fontSize: 24, lineHeight: 29 },
  dropdownClose: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line },
  optionRow: { minHeight: 58, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.charcoal, paddingHorizontal: spacing.md, paddingVertical: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  optionRowSelected: { backgroundColor: colors.orangeSoft, borderColor: colors.orange },
  optionText: { color: colors.white, fontWeight: '900' },
  optionTextSelected: { color: colors.white },
  optionDescription: { color: colors.steel, fontSize: 12, lineHeight: 16, marginTop: 4 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});