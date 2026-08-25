import { Alert, Pressable, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';

const APP_VERSION = '0.1.0';

type SettingsRowItem = {
  title: string;
  status: 'Active' | 'Local' | 'Coming soon' | 'Unavailable';
  description?: string;
};

const workshopRows: SettingsRowItem[] = [
  {
    title: 'Dashboard layout',
    status: 'Local',
    description: 'Saved on this device.',
  },
  {
    title: 'Project categories and phases',
    status: 'Active',
    description: 'Used when creating or editing projects.',
  },
  {
    title: 'Parts and cost tracking',
    status: 'Active',
    description: 'Stored with the project record.',
  },
  {
    title: 'Auto-save',
    status: 'Local',
    description: 'Changes are saved locally on this device.',
  },
];

const documentationRows: SettingsRowItem[] = [
  {
    title: 'Build timeline',
    status: 'Active',
    description: 'Tasks, parts, photos, notes, and project changes appear here.',
  },
  {
    title: 'Photo captions and tags',
    status: 'Active',
    description: 'Camera and gallery photos can be added to a project.',
  },
  {
    title: 'Cover and milestone photos',
    status: 'Active',
    description: 'Marked photos are kept in the project history.',
  },
];

const dataRows: SettingsRowItem[] = [
  {
    title: 'Cloud account sign-in',
    status: 'Active',
    description: 'Supabase auth is configured for accounts.',
  },
  {
    title: 'Project data storage',
    status: 'Local',
    description: 'Build data is currently stored on this device.',
  },
  {
    title: 'Cloud sync and backup',
    status: 'Coming soon',
    description: 'Do not treat this device as cloud-backed yet.',
  },
  {
    title: 'Project export',
    status: 'Local',
    description: 'Readable project exports can be saved from the dashboard.',
  },
];

const shopHelpRows: SettingsRowItem[] = [
  {
    title: 'Shop Help',
    status: 'Coming soon',
    description: 'Premium planning and review tools are not live yet.',
  },
  {
    title: 'Part pricing search',
    status: 'Coming soon',
    description: 'Prices and availability will require seller verification.',
  },
  {
    title: 'Build recaps',
    status: 'Coming soon',
    description: 'Future recap output will be clearly labeled before launch.',
  },
];

function statusColor(status: SettingsRowItem['status']) {
  if (status === 'Active') return '#D97706';
  if (status === 'Local') return '#60A5FA';
  if (status === 'Coming soon') return '#5B6168';
  return '#7C828A';
}

function SettingsRow({ row }: { row: SettingsRowItem }) {
  const muted = row.status === 'Coming soon' || row.status === 'Unavailable';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2E33',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: statusColor(row.status),
          }}
        />
        <View style={{ flex: 1 }}>
          <AppText style={{ color: muted ? '#A3A8AF' : '#F3F4F6', fontSize: 15 }}>
            {row.title}
          </AppText>
          {row.description ? (
            <AppText style={{ color: '#7C828A', fontSize: 12, marginTop: 4, lineHeight: 17 }}>
              {row.description}
            </AppText>
          ) : null}
        </View>
      </View>

      <AppText style={{ color: statusColor(row.status), fontSize: 12, fontWeight: '800' }}>
        {row.status}
      </AppText>
    </View>
  );
}

function SettingsSection({
  title,
  rows,
}: {
  title: string;
  rows: SettingsRowItem[];
}) {
  return (
    <Card
      style={{
        backgroundColor: '#1B1E21',
        borderColor: '#2A2E33',
        borderWidth: 1,
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
      }}
    >
      <Label style={{ color: '#D97706', marginBottom: 14 }}>{title}</Label>

      {rows.map((row, index) => (
        <View key={row.title} style={{ borderBottomWidth: index === rows.length - 1 ? 0 : 1, borderBottomColor: '#2A2E33' }}>
          <SettingsRow row={row} />
        </View>
      ))}
    </Card>
  );
}

export function SettingsScreen() {
  const { signOut } = useAuth();
  const dataStatus = useFabricatorStore(state => state.dataStatus);
  const dataStatusMessage = useFabricatorStore(state => state.dataStatusMessage);
  const dataStatusLabel =
    dataStatus === 'local-ready'
      ? 'Local'
      : dataStatus === 'local-save-error'
      ? 'Save issue'
      : 'Load issue';

  return (
  <Screen>
    
      <View style={{ marginBottom: 24 }}>
        <Label style={{ color: '#D97706', letterSpacing: 2 }}>FABRICATOR</Label>

        <Title style={{ fontSize: 32, marginTop: 8 }}>
          Workshop Settings
        </Title>

        <AppText style={{ color: '#9CA3AF', marginTop: 10, lineHeight: 22 }}>
          Built for fabrication, restoration, and creator builds.
        </AppText>

        <AppText style={{ color: '#6B7280', marginTop: 6 }}>
          Version {APP_VERSION}
        </AppText>
      </View>

      <Card
        style={{
          backgroundColor: '#1A1D20',
          borderColor: '#2A2E33',
          borderWidth: 1,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <Label style={{ color: '#D97706', marginBottom: 12 }}>PLATFORM STATUS</Label>

        <AppText style={{ color: '#E5E7EB', lineHeight: 22 }}>
          Fabricator is ready for local project tracking, parts, costs, photos, and build history. Cloud backup, exports, Shop Help, and pricing search are not live yet.
        </AppText>
      </Card>

      <Card
        style={{
          backgroundColor: '#1A1D20',
          borderColor: dataStatus === 'local-ready' ? '#2A2E33' : '#D97706',
          borderWidth: 1,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <Label style={{ color: '#D97706', marginBottom: 12 }}>DATA STATUS</Label>
        <AppText style={{ color: '#F3F4F6', fontSize: 18, fontWeight: '900' }}>
          {dataStatusLabel}
        </AppText>
        <AppText style={{ color: '#9CA3AF', lineHeight: 21, marginTop: 8 }}>
          {dataStatusMessage}
        </AppText>
      </Card>

      <SettingsSection title="WORKSHOP" rows={workshopRows} />

      <SettingsSection title="DOCUMENTATION" rows={documentationRows} />

      <SettingsSection title="DATA AND ACCOUNT" rows={dataRows} />

      <SettingsSection title="SHOP HELP" rows={shopHelpRows} />
      <Pressable
  onPress={async () => {
    try {
      await signOut();
    } catch {
      Alert.alert(
        'Could not sign out',
        'Check your connection and try again.'
      );
    }
  }}
  style={{
    backgroundColor: '#2A1612',
    borderColor: '#D97706',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
  }}
>
  <AppText
    style={{
      color: '#F59E0B',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 1,
    }}
  >
    LOG OUT
  </AppText>
</Pressable>
      
   </Screen>
  );
}
