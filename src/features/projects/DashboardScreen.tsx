import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors } from '@/theme/theme';
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const store = useFabricatorStore();
  const project = store.activeProject();

  useEffect(() => {
    if (!project) {
      navigation.navigate('Welcome');
    }
  }, [project]);

  if (!project) return null;

  const coverPhoto = store.photos.find(
    photo => photo.id === project.coverPhotoId
  );

  const projectTasks = store.tasks.filter(
    task => task.projectId === project.id
  );

  const projectPhotos = store.photos.filter(
    photo => photo.projectId === project.id
  );

  const projectParts = store.parts.filter(
    part => part.projectId === project.id
  );

  const estimatedTotal = projectParts.reduce(
    (sum, part) => sum + (part.estimatedCost || 0),
    0
  );

  const actualTotal = projectParts.reduce(
    (sum, part) => sum + (part.actualCost || 0),
    0
  );

  const remainingBudget =
    (project.budgetTarget || 0) - actualTotal;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => navigation.navigate('Welcome')}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.orange}
          />

          <AppText style={styles.backText}>
            Back to Workshop
          </AppText>
        </Pressable>

        <Card style={styles.heroCard}>
          {coverPhoto?.uri ? (
            <Image
              source={{ uri: coverPhoto.uri }}
              style={styles.heroImage}
            />
          ) : null}

          <Label>{project.category}</Label>

          <Title style={styles.projectTitle}>
            {project.name}
          </Title>

          <AppText style={styles.hookText}>
            {project.hook}
          </AppText>

          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${project.progress}%` },
                ]}
              />
            </View>

            <AppText style={styles.progressText}>
              {project.progress}% complete
            </AppText>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Label>TASKS</Label>
            <Title>{projectTasks.length}</Title>
          </Card>

          <Card style={styles.statCard}>
            <Label>PHOTOS</Label>
            <Title>{projectPhotos.length}</Title>
          </Card>

          <Card style={styles.statCard}>
            <Label>PARTS</Label>
            <Title>{projectParts.length}</Title>
          </Card>
        </View>

        <Card style={styles.budgetCard}>
          <Label>PROJECT BUDGET</Label>

          <View style={styles.budgetRow}>
            <View style={styles.budgetColumn}>
              <AppText style={styles.budgetLabel}>Target</AppText>
              <Title>${(project.budgetTarget || 0).toLocaleString()}</Title>
            </View>

            <View style={styles.budgetColumn}>
              <AppText style={styles.budgetLabel}>Actual</AppText>
              <Title>${actualTotal.toLocaleString()}</Title>
            </View>
          </View>

          <View style={styles.budgetRow}>
            <View style={styles.budgetColumn}>
              <AppText style={styles.budgetLabel}>Estimated</AppText>
              <Title>${estimatedTotal.toLocaleString()}</Title>
            </View>

            <View style={styles.budgetColumn}>
              <AppText style={styles.budgetLabel}>Remaining</AppText>
              <Title style={{ color: remainingBudget < 0 ? '#FF6B6B' : '#7DFFB2' }}>
                ${Math.abs(remainingBudget).toLocaleString()}
              </Title>
            </View>
          </View>
        </Card>

        <Card>
          <Label>PROJECT STATUS</Label>

          <AppText style={styles.statusText}>
            {project.phase} • {project.status}
          </AppText>

          {project.completedAt ? (
            <AppText style={styles.completeText}>
              Completed {new Date(project.completedAt).toLocaleDateString()}
            </AppText>
          ) : null}
        </Card>

        <RecentActivityWidget />

        <Card>
          <Label>WORKSHOP TOOLS</Label>

          <View style={styles.toolGrid}>
            <Pressable
              style={styles.toolButton}
              onPress={() => navigation.navigate('Tasks')}
            >
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={24}
                color={colors.orange}
              />

              <AppText style={styles.toolText}>Tasks</AppText>
            </Pressable>

            <Pressable
              style={styles.toolButton}
              onPress={() => navigation.navigate('Photos')}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={24}
                color={colors.orange}
              />

              <AppText style={styles.toolText}>Photos</AppText>
            </Pressable>

            <Pressable
              style={styles.toolButton}
              onPress={() => navigation.navigate('Parts')}
            >
              <MaterialCommunityIcons
                name="tools"
                size={24}
                color={colors.orange}
              />

              <AppText style={styles.toolText}>Parts</AppText>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },

  backText: {
    color: colors.orange,
    fontWeight: '800',
  },

  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 18,
  },

  heroCard: {
    marginBottom: 18,
  },

  projectTitle: {
    fontSize: 38,
    lineHeight: 42,
    marginTop: 8,
  },

  hookText: {
    marginTop: 12,
    color: colors.steel,
    lineHeight: 22,
  },

  progressSection: {
    marginTop: 22,
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.graphite,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },

  progressText: {
    marginTop: 10,
    color: colors.white,
    fontWeight: '800',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
  },

  budgetCard: {
    marginBottom: 18,
  },

  budgetRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },

  budgetColumn: {
    flex: 1,
    backgroundColor: colors.graphite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },

  budgetLabel: {
    color: colors.steel,
    marginBottom: 8,
    fontWeight: '700',
  },

  statusText: {
    marginTop: 12,
    fontSize: 18,
    color: colors.white,
  },

  completeText: {
    marginTop: 10,
    color: '#7DFFB2',
    fontWeight: '800',
  },

  toolGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },

  toolButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: colors.graphite,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },

  toolText: {
    marginTop: 8,
    color: colors.white,
    fontWeight: '700',
  },
});
