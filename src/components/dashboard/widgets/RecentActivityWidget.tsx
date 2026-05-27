import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors } from '@/theme/theme';

export function RecentActivityWidget() {
  const store = useFabricatorStore();

  const projectId = store.selectedProjectId;

  const recentPhotos = store.photos
    .filter(photo => photo.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

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

      {recentPhotos.length ? (
        recentPhotos.map(photo => (
          <View
            key={photo.id}
            style={styles.activityRow}
          >
            <MaterialCommunityIcons
              name="camera"
              size={18}
              color={colors.orange}
            />

            <View style={{ flex: 1 }}>
              <AppText style={styles.activityText}>
                📷 Added photo: {photo.caption}
              </AppText>
{photo.isMilestone ? (
  <View style={styles.milestoneRow}>
    <MaterialCommunityIcons
      name="trophy"
      size={14}
      color={colors.orange}
    />

    <AppText style={styles.milestoneText}>
      {photo.milestoneTitle || 'Build Milestone'}
    </AppText>
  </View>
) : null}

<AppText style={styles.date}>

                {new Date(
                  photo.createdAt
                ).toLocaleDateString()}
              </AppText>
            </View>
          </View>
        ))
      ) : (
        <AppText style={styles.empty}>
          No recent activity yet.
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
    fontWeight: '700',
  },

  date: {
    color: colors.steel,
    marginTop: 4,
    fontSize: 12,
  },

  empty: {
    color: colors.steel,
  },
  milestoneRow:{
  flexDirection:'row',
  alignItems:'center',
  gap:6,
  marginTop:6,
},

milestoneText:{
  color:colors.orange,
  fontWeight:'800',
  fontSize:12,
},
});