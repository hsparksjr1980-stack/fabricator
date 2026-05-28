import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { AppText } from '@/components/Text';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function EditProjectModal({
  visible,
  onClose,
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
          }}
        >
          <AppText
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '700',
            }}
          >
            Edit Project
          </AppText>

          <AppText>
            Edit form coming next phase.
          </AppText>

          <Pressable onPress={onClose}>
            <AppText>Close</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}