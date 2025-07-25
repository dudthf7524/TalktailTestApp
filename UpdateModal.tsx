import React from 'react';
import { Modal, View, Text, StyleSheet, Platform, BackHandler, Alert, Linking } from 'react-native';

interface UpdateModalProps {
  visible: boolean;
  onUpdate: () => void;
  onClose: () => void;
  updateDate: string;
}

const UpdateModal = ({ visible, onUpdate, onClose, updateDate }: UpdateModalProps) => {
  const handleExitApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      Alert.alert('안내', 'iOS에서는 홈 버튼으로 앱을 종료해 주세요.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>업데이트 필요</Text>
          {updateDate && (
            <Text style={styles.dateText}>({new Date(updateDate).toLocaleString()})</Text>
          )}
          <Text style={styles.message}>최신 버전으로 업데이트 해주세요.</Text>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            {/* <Text style={[styles.button, { color: 'gray' }]} onPress={handleExitApp}>닫기</Text> */}
            <Text style={styles.button} onPress={onUpdate}>업데이트</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});

export default UpdateModal;