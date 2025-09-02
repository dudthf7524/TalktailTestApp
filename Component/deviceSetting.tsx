import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import { useBLE } from './BLEContext';
import dayjs from 'dayjs';

const DeviceSetting = () => {
  const { state } = useBLE();

  // 설정값 상태 (UI에서 선택한 값)
  const [deviceName, setDeviceName] = useState('');
  const [selectedAdc, setSelectedAdc] = useState('4096');
  const [selectedFifo, setSelectedFifo] = useState('1');
  const [selectedSampling, setSelectedSampling] = useState('50');
  const [selectedGreen, setSelectedGreen] = useState('on');

  // 실제 디바이스에 적용된 설정값 (전송 완료된 값)
  const [appliedName, setAppliedName] = useState('');
  const [appliedAdc, setAppliedAdc] = useState('4096');
  const [appliedFifo, setAppliedFifo] = useState('1');
  const [appliedSampling, setAppliedSampling] = useState('50');
  const [appliedGreen, setAppliedGreen] = useState('on');

  // 모달 상태
  const [showAdcModal, setShowAdcModal] = useState(false);
  const [showFifoModal, setShowFifoModal] = useState(false);
  const [showSamplingModal, setShowSamplingModal] = useState(false);

  // 선택 옵션들
  const adcOptions = ['2048', '4096', '8192', '16384'];
  const fifoOptions = ['1', '2', '4', '8', '16', '32', '64', '128'];
  const samplingOptions = ['50', '100', '200', '400', '800', '1000', '1600', '3200'];
  const greenOptions = ['on', 'off'];

  const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const CHARACTERISTIC_UUID_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  const CHARACTERISTIC_UUID_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

  const sendTextToESP32 = async (type : string, value : string): Promise<boolean> => {
    try {

      const sendText = `${type}:${value}`
      const textBytes: number[] = Array.from(sendText, (char: string) => char.charCodeAt(0));
      const deviceId = state.deviceId;
      // BLE Write 실행 (TX characteristic 사용)
      if(deviceId) {
        await BleManager.write(
          deviceId,                    // 연결된 디바이스 ID
          SERVICE_UUID,               // 서비스 UUID
          CHARACTERISTIC_UUID_TX,     // 쓰기용 특성 UUID
          textBytes                   // 전송할 데이터 (바이트 배열)
        );
      }

      console.log('✅ 텍스트 전송 성공!');
      Alert.alert('✅ 설정 전송 완료', `${type}: ${value}`);
      
      // 전송 성공 시 적용된 설정값 업데이트
      switch (type) {
        case 'name':
          setAppliedName(value);
          break;
        case 'adc':
          setAppliedAdc(value);
          break;
        case 'fifo':
          setAppliedFifo(value);
          break;
        case 'sampling':
          setAppliedSampling(value);
          break;
        case 'green':
          setAppliedGreen(value);
          break;
      }
      
      return true;

    } catch (error) {
      console.error('❌ 텍스트 전송 실패:', error);
      Alert.alert('❌ 텍스트 전송 실패!');
      return false;
    }
  };

    return (
    <View style={styles.container}>
      {/* 현재 설정값 표시 */}
      <View style={styles.currentSettingsContainer}>
        <Text style={styles.currentSettingsTitle}>현재 설정값</Text>
        <Text style={styles.currentSettingsText}>
          {appliedName && `name: ${appliedName}, `}adc: {appliedAdc}, fifo: {appliedFifo}, sampling: {appliedSampling}, green: {appliedGreen}
        </Text>
      </View>
 

      {/* ADC 설정 */}
      <View style={styles.settingCard}>
        <View style={styles.singleLineRow}>
          <Text style={styles.settingLabel}>ADC</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowAdcModal(true)}
          >
            <Text style={styles.selectButtonText}>{selectedAdc}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.inlineSendButton}
            onPress={() => sendTextToESP32('adc', selectedAdc)}
          >
            <Text style={styles.inlineSendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>

            {/* FIFO 설정 */}
      <View style={styles.settingCard}>
        <View style={styles.singleLineRow}>
          <Text style={styles.settingLabel}>FIFO</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowFifoModal(true)}
          >
            <Text style={styles.selectButtonText}>{selectedFifo}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.inlineSendButton}
            onPress={() => sendTextToESP32('fifo', selectedFifo)}
          >
            <Text style={styles.inlineSendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sampling 설정 */}
      <View style={styles.settingCard}>
        <View style={styles.singleLineRow}>
          <Text style={styles.settingLabel}>Sampling</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowSamplingModal(true)}
          >
            <Text style={styles.selectButtonText}>{selectedSampling}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.inlineSendButton}
            onPress={() => sendTextToESP32('sampling', selectedSampling)}
          >
            <Text style={styles.inlineSendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Green 설정 */}
      <View style={styles.settingCard}>
        <View style={styles.singleLineRow}>
          <Text style={styles.settingLabel}>Green</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, selectedGreen === 'on' && styles.toggleButtonActive]}
              onPress={() => setSelectedGreen('on')}
            >
              <Text style={[styles.toggleButtonText, selectedGreen === 'on' && styles.toggleButtonTextActive]}>
                ON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, selectedGreen === 'off' && styles.toggleButtonActive]}
              onPress={() => setSelectedGreen('off')}
            >
              <Text style={[styles.toggleButtonText, selectedGreen === 'off' && styles.toggleButtonTextActive]}>
                OFF
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.inlineSendButton}
            onPress={() => sendTextToESP32('green', selectedGreen)}
          >
            <Text style={styles.inlineSendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Name 설정 */}
      {/* <View style={styles.settingCard}>
        <View style={styles.singleLineRow}>
          <Text style={styles.settingLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="디바이스 이름 입력"
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={styles.inlineSendButton}
            onPress={() => sendTextToESP32('name', deviceName)}
          >
            <Text style={styles.inlineSendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* ADC 선택 모달 */}
      <Modal
        visible={showAdcModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdcModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADC 값 선택</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAdcModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={adcOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedAdc === item && styles.selectedItem
                  ]}
                  onPress={() => {
                    setSelectedAdc(item);
                    setShowAdcModal(false);
                  }}
                >
                  <Text style={[
                    styles.listItemText,
                    selectedAdc === item && styles.selectedItemText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* FIFO 선택 모달 */}
      <Modal
        visible={showFifoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFifoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>FIFO 값 선택</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFifoModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={fifoOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedFifo === item && styles.selectedItem
                  ]}
                  onPress={() => {
                    setSelectedFifo(item);
                    setShowFifoModal(false);
                  }}
                >
                  <Text style={[
                    styles.listItemText,
                    selectedFifo === item && styles.selectedItemText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Sampling 선택 모달 */}
      <Modal
        visible={showSamplingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSamplingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sampling 값 선택</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSamplingModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={samplingOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedSampling === item && styles.selectedItem
                  ]}
                  onPress={() => {
                    setSelectedSampling(item);
                    setShowSamplingModal(false);
                  }}
                >
                  <Text style={[
                    styles.listItemText,
                    selectedSampling === item && styles.selectedItemText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#262626',
    textAlign: 'center',
    marginBottom: 18,
  },
  currentSettingsContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 9,
    padding: 13,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#12B6D1',
  },
  currentSettingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#12B6D1',
    marginBottom: 7,
  },
  currentSettingsText: {
    fontSize: 13,
    color: '#262626',
    lineHeight: 18,
  },
  settingCard: {
    backgroundColor: 'white',
    padding: 13,
    marginBottom: 13,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  singleLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#262626',
    flex: 1,
    minWidth: 60,
  },
  textInput: {
    flex: 2,
    backgroundColor: '#f8f8f8',
    borderRadius: 7,
    padding: 11,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 13,
    color: '#262626',
  },
  selectButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 7,
    padding: 11,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectButtonText: {
    fontSize: 13,
    color: '#262626',
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 11,
    color: '#12B6D1',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flex: 2,
    flexDirection: 'row',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#12B6D1',
  },
  toggleButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  individualSendButton: {
    backgroundColor: '#12B6D1',
    borderRadius: 7,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  individualSendButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  inlineSendButton: {
    backgroundColor: '#12B6D1',
    borderRadius: 7,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  inlineSendButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 9,
    width: '80%',
    maxHeight: '70%',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 9,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#12B6D1',
    fontWeight: 'bold',
  },
  listItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#12B6D1',
    borderRadius: 4,
  },
  listItemText: {
    fontSize: 14,
    color: '#262626',
  },
  selectedItemText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DeviceSetting;