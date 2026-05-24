import { View, Pressable } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';

const workshopRows = [
  'Default dashboard preset',
  'Preferred project category',
  'Units configuration',
  'Auto-save status',
];

const documentationRows = [
  'Timeline activity preferences',
  'Photo quality',
  'Milestone photo defaults',
  'Cover photo behavior',
];

const creatorRows = [
  'Build recaps',
  'Export progress',
  'Social/content workflow',
];

const accountRows = [
  'Email/account',
  'Cloud sync',
];

const futureRows = [
  'Cloud backup',
  'AI build summaries',
  'Shop collaborator access',
  'Project export',
];

function SettingsRow({ title, disabled = false }: { title: string; disabled?: boolean }) {
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
            backgroundColor: disabled ? '#5B6168' : '#D97706',
          }}
        />
        <AppText style={{ color: disabled ? '#7C828A' : '#F3F4F6', fontSize: 15 }}>
          {title}
        </AppText>
      </View>

      <AppText style={{ color: '#7C828A' }}>
        {disabled ? 'Unavailable' : 'Active'}
      </AppText>
    </View>
  );
}

function SettingsSection({
  title,
  rows,
  disabled = false,
}: {
  title: string;
  rows: string[];
  disabled?: boolean;
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
        <View
          key={row}
          style={{
            borderBottomWidth: index === rows.length - 1 ? 0 : 1,
            borderBottomColor: '#2A2E33',
          }}
        >
          <SettingsRow title={row} disabled={disabled} />
        </View>
      ))}
    </Card>
  );
}

export function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <Screen>
      <View style={{ marginBottom: 24 }}>
        <Label style={{ color: '#D97706', letterSpacing: 2 }}>
          FABRICATOR
        </Label>

        <Title style={{ fontSize: 32, marginTop: 8 }}>
          Workshop Settings
        </Title>

        <AppText style={{ color: '#9CA3AF', marginTop: 10, lineHeight: 22 }}>
          Built for fabrication, restoration, and creator builds.
        </AppText>

        <AppText style={{ color: '#6B7280', marginTop: 6 }}>
          Version 0.2.0
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
        <Label style={{ color: '#D97706', marginBottom: 12 }}>
          PLATFORM STATUS
        </Label>

        <AppText style={{ color: '#E5E7EB', lineHeight: 22 }}>
          Fabricator supports project documentation, activity tracking,
          milestone management, creator workflows, and organized build
          history across fabrication and restoration projects.
        </AppText>
      </Card>

      <SettingsSection title="WORKSHOP" rows={workshopRows} />

      <SettingsSection title="DOCUMENTATION" rows={documentationRows} />

      <SettingsSection title="CREATOR TOOLS" rows={creatorRows} />

      <SettingsSection title="ACCOUNT" rows={accountRows} />

      <SettingsSection title="FUTURE TOOLS" rows={futureRows} disabled />

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
        <Label style={{ color: '#D97706', marginBottom: 12 }}>
          BUILD HISTORY
        </Label>

        <AppText style={{ color: '#C9CDD2', lineHeight: 22 }}>
          Activity tracking focuses on long-term project documentation,
          milestone progression, fabrication workflows, and creator-oriented
          build management.
        </AppText>
      </Card>

      <Pressable
        onPress={async () => {
          await signOut();
        }}
        style={{
          backgroundColor: '#2A1612',
          borderColor: '#D97706',
          borderWidth: 1,
          borderRadius: 18,
          paddingVertical: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 120,
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
