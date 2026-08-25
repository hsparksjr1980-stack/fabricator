import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  Linking,
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
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildPhoto, ProjectCategory } from '@/types/models';
import { colors, radius, shadows, spacing } from '@/theme/theme';

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1400&auto=format&fit=crop';

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
  ],
  Woodworking: [
    'Design',
    'Cutting',
    'Joinery',
    'Assembly',
    'Sanding',
    'Finishing',
    'Hardware',
  ],
  Electronics: [
    'Design',
    'Wiring',
    'Circuit',
    'Soldering',
    'Testing',
    'Enclosure',
    'Install',
  ],
  'Home Improvement': [
    'Planning',
    'Demo',
    'Framing',
    'Electrical',
    'Plumbing',
    'Drywall',
    'Paint',
    'Finish Work',
  ],
  Fabrication: [
    'Design',
    'Mockup',
    'Cutting',
    'Fitment',
    'Welding',
    'Grinding',
    'Paint',
    'Assembly',
  ],
  Crafts: [
    'Design',
    'Materials',
    'Cutting',
    'Assembly',
    'Detailing',
    'Finishing',
  ],
  General: [
    'Planning',
    'Materials',
    'Mockup',
    'Assembly',
    'Testing',
    'Finishing',
  ],
};

function getWorkAreas(category?: ProjectCategory | string) {
  return WORK_AREAS_BY_CATEGORY[category || 'General'] || WORK_AREAS_BY_CATEGORY.General;
}

function formatDate(value?: string) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function showPermissionRecovery(kind: 'camera' | 'photo library') {
  Alert.alert(
    `${kind === 'camera' ? 'Camera' : 'Photo library'} access needed`,
    `Fabricator needs ${kind} access to add build photos. Open device settings, allow access for Fabricator, then try again.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
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
                    {selected ? (
                      <MaterialCommunityIcons name="check" size={20} color={colors.orange} />
                    ) : null}
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

export function PhotosScreen() {
  const store = useFabricatorStore();
  const project = store.activeProject();

  const workAreas = useMemo(
    () => getWorkAreas(project?.category),
    [project?.category]
  );

  const [caption, setCaption] = useState('');
  const [workArea, setWorkArea] = useState(workAreas[0] || 'General');
  const [uri, setUri] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<BuildPhoto | null>(null);

  const photos = store.photos.filter((photo: BuildPhoto) => photo.projectId === store.selectedProjectId);

  const filterOptions = useMemo(() => ['All', ...workAreas], [workAreas]);

  const filteredPhotos = useMemo(() => {
    if (filter === 'All') return photos;
    return photos.filter((photo: BuildPhoto) => photo.tag === filter);
  }, [photos, filter]);

  const photoCountLabel = `${filteredPhotos.length} of ${photos.length}`;

  const ensureWorkAreaIsValid = (nextAreas: string[]) => {
    if (!nextAreas.includes(workArea)) {
      setWorkArea(nextAreas[0] || 'General');
    }

    if (filter !== 'All' && !nextAreas.includes(filter)) {
      setFilter('All');
    }
  };

  useMemo(() => {
    ensureWorkAreaIsValid(workAreas);
  }, [workAreas]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showPermissionRecovery('photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Gallery did not open',
        'Fabricator could not open your photo library. Try again, or use the camera instead.'
      );
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showPermissionRecovery('camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Camera did not open',
        'Fabricator could not open the camera. Try again, or choose a photo from the gallery.'
      );
    }
  };

  const save = () => {
    if (!uri.trim()) {
      Alert.alert('Add a photo first', 'Use Camera or Gallery before saving.');
      return;
    }

    store.addPhoto(
      caption.trim() || `${workArea} photo`,
      workArea.trim() || 'General',
      uri.trim()
    );

    setCaption('');
    setUri('');
  };

  return (
    <Screen>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTitleWrap}>
            <Label>PHOTOS</Label>
            <Title style={styles.heroTitle}>Build Photos</Title>
            <AppText style={styles.heroCopy}>
              Capture progress first, then organize by work area.
            </AppText>
          </View>

          <View style={styles.heroCountBox}>
            <MaterialCommunityIcons name="image-multiple-outline" size={22} color={colors.orange} />
            <Title style={styles.heroCount}>{photos.length}</Title>
            <AppText style={styles.heroCountLabel}>Photos</AppText>
          </View>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatPill}>
            <Label>PHOTO COUNT</Label>
            <AppText style={styles.heroStatValue}>{photoCountLabel}</AppText>
          </View>
          <View style={styles.heroStatPill}>
            <Label>FILTER</Label>
            <AppText style={styles.heroStatValue}>{filter}</AppText>
          </View>
        </View>
      </View>

      <Card style={styles.addCard}>
        <View style={styles.addHeaderRow}>
          <View>
            <Label>ADD PHOTO</Label>
            <Title style={styles.addTitle}>Document work</Title>
          </View>
          <MaterialCommunityIcons name="camera-plus-outline" size={26} color={colors.orange} />
        </View>

        <SelectField
          label="WORK AREA"
          value={workArea}
          options={workAreas}
          onChange={setWorkArea}
        />

        <View style={styles.sourceRow}>
          <Pressable style={styles.sourceButton} onPress={takePhoto}>
            <MaterialCommunityIcons name="camera-outline" size={21} color={colors.orange} />
            <AppText style={styles.sourceText}>Camera</AppText>
          </Pressable>

          <Pressable style={styles.sourceButton} onPress={pickImage}>
            <MaterialCommunityIcons name="image-outline" size={21} color={colors.orange} />
            <AppText style={styles.sourceText}>{uri ? 'Change' : 'Gallery'}</AppText>
          </Pressable>
        </View>

        {uri ? (
          <Image source={{ uri }} style={styles.preview} />
        ) : (
          <View style={styles.emptyPreview}>
            <MaterialCommunityIcons name="image-plus-outline" size={28} color={colors.steel} />
            <AppText style={styles.emptyPreviewText}>Choose Camera or Gallery first.</AppText>
          </View>
        )}

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Caption optional"
          placeholderTextColor={colors.steel}
          style={styles.input}
        />

        <Pressable
          disabled={!uri}
          style={[styles.saveButton, !uri && styles.saveButtonDisabled]}
          onPress={save}
        >
          <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
          <AppText style={styles.saveButtonText}>Save Photo</AppText>
        </Pressable>
      </Card>

      <Card style={styles.filterCard}>
        <SelectField
          label="FILTER"
          value={filter}
          options={filterOptions}
          onChange={setFilter}
        />
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <Label>PHOTO LOG</Label>
          <Title style={styles.sectionTitle}>{filteredPhotos.length} photos</Title>
        </View>
        <AppText style={styles.helper}>Tap to view.</AppText>
      </View>

      {filteredPhotos.length ? (
        <View style={styles.galleryGrid}>
          {filteredPhotos.map((photo: BuildPhoto) => {
            const isCover = project?.coverPhotoId === photo.id;

            return (
              <Pressable
                key={photo.id}
                onPress={() => setSelectedPhoto(photo)}
                style={({ pressed }) => [styles.photoCard, pressed && styles.pressed]}
              >
                <Image source={{ uri: photo.uri || FALLBACK_PHOTO }} style={styles.photoImage} />

                <View style={styles.photoBody}>
                  <View style={styles.photoTopRow}>
                    <StatusPill label={photo.tag} />
                    {isCover ? (
                      <View style={styles.coverMiniBadge}>
                        <MaterialCommunityIcons name="star" size={11} color={colors.black} />
                        <AppText style={styles.coverMiniText}>Cover</AppText>
                      </View>
                    ) : null}
                  </View>

                  <AppText style={styles.photoCaption} numberOfLines={2}>
                    {photo.caption || `${photo.tag} photo`}
                  </AppText>
                  <AppText style={styles.photoDate}>{formatDate(photo.createdAt)}</AppText>

                  <View style={styles.photoActions}>
                    <Pressable
                      style={styles.inlineAction}
                      onPress={() => {
                        store.setProjectCoverPhoto(photo.id);
                        Alert.alert('Cover photo set', 'This photo is now the project cover.');
                      }}
                    >
                      <MaterialCommunityIcons
                        name={isCover ? 'image-check-outline' : 'image-filter-hdr'}
                        size={15}
                        color={colors.orange}
                      />
                      <AppText style={styles.inlineActionText}>
                        {isCover ? 'Cover' : 'Set Cover'}
                      </AppText>
                    </Pressable>

                    <Pressable
                      style={styles.inlineAction}
                      onPress={() => {
                        if (photo.isMilestone) {
                          store.removePhotoMilestone(photo.id);
                          Alert.alert('Milestone removed', 'This photo is no longer marked as a milestone.');
                        } else {
                          store.setPhotoMilestone(photo.id, 'Build Milestone');
                          Alert.alert('Milestone marked', 'This photo will stand out in the build timeline.');
                        }
                      }}
                    >
                      <MaterialCommunityIcons
                        name={photo.isMilestone ? 'flag-remove-outline' : 'flag-checkered'}
                        size={15}
                        color={colors.orange}
                      />
                      <AppText style={styles.inlineActionText}>
                        {photo.isMilestone ? 'Unmark' : 'Milestone'}
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <MaterialCommunityIcons name="camera-plus" size={38} color={colors.orange} />
          <Title style={styles.emptyTitle}>No photos here</Title>
          <AppText style={styles.emptyCopy}>
            Add a photo or change the filter to see more build documentation.
          </AppText>
        </Card>
      )}

      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.closeButton} onPress={() => setSelectedPhoto(null)}>
            <MaterialCommunityIcons name="close" size={28} color={colors.white} />
          </Pressable>

          {selectedPhoto ? (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPhoto.uri || FALLBACK_PHOTO }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <View style={styles.modalMeta}>
                <StatusPill label={selectedPhoto.tag} />
                <Title style={styles.modalTitle}>
                  {selectedPhoto.caption || `${selectedPhoto.tag} photo`}
                </Title>
                <AppText style={styles.modalDate}>{formatDate(selectedPhoto.createdAt)}</AppText>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <View style={{ height: 70 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.panelHigh,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTitleWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: 4,
  },
  heroCopy: {
    color: colors.steel,
    marginTop: 4,
    lineHeight: 18,
  },
  heroCountBox: {
    width: 86,
    minHeight: 86,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  heroCount: {
    fontSize: 26,
    lineHeight: 30,
    marginTop: 3,
  },
  heroCountLabel: {
    color: colors.steel,
    fontSize: 11,
    fontWeight: '800',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  heroStatPill: {
    flex: 1,
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
  },
  heroStatValue: {
    color: colors.white,
    fontWeight: '900',
    marginTop: 4,
  },
  addCard: {
    borderColor: 'rgba(217,106,29,0.38)',
    marginBottom: 12,
  },
  addHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addTitle: {
    fontSize: 22,
    lineHeight: 26,
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
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sourceButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.graphite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sourceText: {
    color: colors.white,
    fontWeight: '900',
  },
  preview: {
    height: 132,
    borderRadius: radius.md,
    marginBottom: 10,
  },
  emptyPreview: {
    height: 132,
    borderRadius: radius.md,
    marginBottom: 10,
    backgroundColor: colors.charcoal,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyPreviewText: {
    color: colors.steel,
    fontSize: 12,
    fontWeight: '800',
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
  saveButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '900',
  },
  filterCard: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 29,
  },
  helper: {
    fontSize: 12,
    color: colors.steel,
  },
  galleryGrid: {
    gap: 12,
  },
  photoCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.panel,
  },
  photoImage: {
    width: '100%',
    height: 172,
  },
  photoBody: {
    padding: spacing.md,
  },
  photoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  coverMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  coverMiniText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: '900',
  },
  photoCaption: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  photoDate: {
    color: colors.steel,
    marginTop: 5,
    fontSize: 12,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inlineActionText: {
    color: colors.orange,
    fontWeight: '800',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  closeButton: {
    position: 'absolute',
    right: 22,
    top: 54,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    gap: 16,
  },
  fullscreenImage: {
    width: '100%',
    height: 460,
    borderRadius: radius.lg,
  },
  modalMeta: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  modalTitle: {
    fontSize: 24,
    lineHeight: 29,
    marginTop: 10,
  },
  modalDate: {
    color: colors.steel,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
