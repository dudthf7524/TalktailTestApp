import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { deviceStore } from '../../store/deviceStore';

interface FindIdModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (deviceCode: string) => void;
}

const FindIdModal = ({ visible, onClose, onSubmit }: FindIdModalProps) => {
  const [deviceCode, setDeviceCode] = useState('');
  const {
    findIDSuccess,
    findIDError,
    offFindIDError,
  } = deviceStore();
  
  const handleSubmit = () => {
    if (deviceCode.trim()) {
      onSubmit(deviceCode);
    }
  };

  const handleClose = () => {
    setDeviceCode('');
    onClose();
    offFindIDError();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>


          {!findIDSuccess ? (
            <>
              <Text style={styles.title}>아이디 찾기</Text>
              <Text style={styles.description}>
                등록된 디바이스 코드를 입력해주세요.
              </Text>

              <TextInput
                style={styles.input}
                value={deviceCode}
                onChangeText={setDeviceCode}
                placeholder="디바이스 코드를 입력하세요"
                placeholderTextColor="#999999"
              />
              {
                findIDError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{findIDError}</Text>
                  </View>
                ) : (
                  <></>
                )
              }

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.successTitle}>아이디 찾기 성공</Text>
              <Text style={styles.description}>
                아이디를 확인 해주세요
              </Text>
              <View style={styles.idContainer}>
                <Text style={styles.foundId}>{findIDError}</Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#F0663F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#F0663F',
    marginBottom: 15,
  },
  successDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  idContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  foundId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#F0663F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#F0663F',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FindIdModal; 