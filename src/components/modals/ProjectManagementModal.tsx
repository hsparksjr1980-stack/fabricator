import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { AppText } from '@/components/Text';
import { ProjectStatus } from '@/types/models';

type Props = {
  visible: boolean;
  projectStatus?: ProjectStatus;
  onClose: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onReopen: () => void;
};

export function ProjectManagementModal({
  visible,
  projectStatus,
  onClose,
  onComplete,
  onArchive,
  onReopen,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <View
          style={{
            backgroundColor: '#1b1b1d',
            padding: 24,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            gap: 16,
          }}
        >
          <AppText
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '700',
            }}
          >
            Project Management
          </AppText>

          {projectStatus === 'active' ? (
            <Pressable onPress={onComplete}>
              <AppText>Complete Project</AppText>
            </Pressable>
          ) : null}

          {projectStatus === 'completed' ? (
            <Pressable onPress={onArchive}>
              <AppText>Archive Project</AppText>
            </Pressable>
          ) : null}

          {projectStatus === 'archived' ? (
            <Pressable onPress={onReopen}>
              <AppText>Reopen Project</AppText>
            </Pressable>
          ) : null}

          <Pressable onPress={onClose}>
            <AppText>Close</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
