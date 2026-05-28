import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { AppText } from '@/components/Text';

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onReopen: () => void;
};

export function ProjectManagementModal({
  visible,
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

          <Pressable onPress={onComplete}>
            <AppText>Complete Project</AppText>
          </Pressable>

          <Pressable onPress={onArchive}>
            <AppText>Archive Project</AppText>
          </Pressable>

          <Pressable onPress={onReopen}>
            <AppText>Reopen Project</AppText>
          </Pressable>

          <Pressable onPress={onClose}>
            <AppText>Close</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}