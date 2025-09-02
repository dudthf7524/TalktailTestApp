import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import { useBLE } from './BLEContext';
import dayjs from 'dayjs';

const PASelector = () => {
  const { state, setErrorMarked, setCurrentPA, insertSeparator } = useBLE();
  const [currentPAIndex, setCurrentPAIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const PAData = [
    { name: 'PA1', hex1: '24', hex2: '48', decimal: '36/72' },
    { name: 'PA2', hex1: '28', hex2: '4C', decimal: '40/76' },
    { name: 'PA3', hex1: '2C', hex2: '50', decimal: '44/80' },
    { name: 'PA4', hex1: '30', hex2: '54', decimal: '48/84' },
    { name: 'PA5', hex1: '34', hex2: '58', decimal: '52/88' },
    { name: 'PA6', hex1: '38', hex2: '5C', decimal: '56/92' },
    { name: 'PA7', hex1: '3C', hex2: '60', decimal: '60/96' },
    { name: 'PA8', hex1: '40', hex2: '64', decimal: '64/100' },
    { name: 'PA9', hex1: '44', hex2: '68', decimal: '68/104' },
    { name: 'PA10', hex1: '48', hex2: '6C', decimal: '72/108' },
    { name: 'PA11', hex1: '4C', hex2: '70', decimal: '76/112' },
    { name: 'PA12', hex1: '50', hex2: '74', decimal: '80/116' },
    { name: 'PA13', hex1: '54', hex2: '78', decimal: '84/120' },
    { name: 'PA14', hex1: '58', hex2: '7C', decimal: '88/124' },
    { name: 'PA15', hex1: '5C', hex2: '80', decimal: '92/128' },
    { name: 'PA16', hex1: '60', hex2: '84', decimal: '96/132' },
    { name: 'PA17', hex1: '64', hex2: '88', decimal: '100/136' },
    { name: 'PA18', hex1: '68', hex2: '8C', decimal: '104/140' },
    { name: 'PA19', hex1: '6C', hex2: '90', decimal: '108/144' },
    { name: 'PA20', hex1: '70', hex2: '94', decimal: '112/148' },
    { name: 'PA21', hex1: '74', hex2: '98', decimal: '116/152' },
    { name: 'PA22', hex1: '78', hex2: '9C', decimal: '120/156' },
    { name: 'PA23', hex1: '7C', hex2: 'A0', decimal: '124/160' },
    { name: 'PA24', hex1: '80', hex2: 'A4', decimal: '128/164' },
    { name: 'PA25', hex1: '84', hex2: 'A8', decimal: '132/168' },
    { name: 'PA26', hex1: '88', hex2: 'AC', decimal: '136/172' },
    { name: 'PA27', hex1: '8C', hex2: 'B0', decimal: '140/176' },
    { name: 'PA28', hex1: '90', hex2: 'B4', decimal: '144/180' },
    { name: 'PA29', hex1: '94', hex2: 'B8', decimal: '148/184' },
    { name: 'PA30', hex1: '98', hex2: 'BC', decimal: '152/188' },
    { name: 'PA31', hex1: '9C', hex2: 'C0', decimal: '156/192' },
    { name: 'PA32', hex1: 'A0', hex2: 'C4', decimal: '160/196' },
    { name: 'PA33', hex1: 'A4', hex2: 'C8', decimal: '164/200' },
    { name: 'PA34', hex1: 'A8', hex2: 'CC', decimal: '168/204' },
    { name: 'PA35', hex1: 'AC', hex2: 'D0', decimal: '172/208' },
    { name: 'PA36', hex1: 'B0', hex2: 'D4', decimal: '176/212' },
    { name: 'PA37', hex1: 'B4', hex2: 'D8', decimal: '180/216' },
    { name: 'PA38', hex1: 'B8', hex2: 'DC', decimal: '184/220' },
    { name: 'PA39', hex1: 'BC', hex2: 'E0', decimal: '188/224' },
    { name: 'PA40', hex1: 'C0', hex2: 'E4', decimal: '192/228' },
    { name: 'PA41', hex1: 'C4', hex2: 'E8', decimal: '196/232' },
    { name: 'PA42', hex1: 'C8', hex2: 'EC', decimal: '200/236' },
    { name: 'PA43', hex1: 'CC', hex2: 'F0', decimal: '204/240' },
    { name: 'PA44', hex1: 'D0', hex2: 'F4', decimal: '208/244' },
    { name: 'PA45', hex1: 'D4', hex2: 'F8', decimal: '212/248' },
    { name: 'PA46', hex1: 'D8', hex2: 'FC', decimal: '216/252' },
    { name: 'PA47', hex1: 'DC', hex2: 'FF', decimal: '220/255' },
    { name: 'PA48', hex1: 'E0', hex2: 'FF', decimal: '224/255' },
    { name: 'PA49', hex1: 'E4', hex2: 'FF', decimal: '228/255' },
    { name: 'PA50', hex1: 'E8', hex2: 'FF', decimal: '232/255' },
    { name: 'PA51', hex1: 'EC', hex2: 'FF', decimal: '236/255' },
    { name: 'PA52', hex1: 'F0', hex2: 'FF', decimal: '240/255' },
    { name: 'PA53', hex1: 'F4', hex2: 'FF', decimal: '244/255' },
    { name: 'PA54', hex1: 'F8', hex2: 'FF', decimal: '248/255' },
    { name: 'PA55', hex1: 'FC', hex2: 'FF', decimal: '252/255' },
    { name: 'PA56', hex1: 'FF', hex2: 'FF', decimal: '255/255' },
  ];


  const handleUpPress = () => {
    setCurrentPAIndex(prev =>
      prev > 0 ? prev - 1 : PAData.length - 1
    );
  };

  const handleDownPress = () => {
    setCurrentPAIndex(prev =>
      prev < PAData.length - 1 ? prev + 1 : 0
    );
  };

  const handleSendPress = () => {
    const currentPA = PAData[currentPAIndex];
    console.log(`PA ${currentPAIndex + 1} 전송:`, currentPA.hex1, currentPA.hex2);

    // BLEContext에서 deviceId 가져와서 사용
    if (state.deviceId) {
      // 두 HEX 값을 하나의 문자열로 합쳐서 전송
      const combinedHex = `${currentPA.hex1},${currentPA.hex2}`;
      sendTextToESP32(state.deviceId, combinedHex).then((success) => {
        if (success) {
          // 전송 성공 시 현재 PA 값 저장
          setCurrentPA({
            name: currentPA.name,
            value: currentPA.decimal,
            timestamp: dayjs().format('HH:mm:ss')
          });
        }
      });
    } else {
      console.log('⚠️ 디바이스가 연결되지 않았습니다.');
    }
  };

  const handleErrorCheck = () => {
    const newErrorState = !state.isErrorMarked;
    console.log('newErrorState', newErrorState);
    setErrorMarked(newErrorState);
    Alert.alert(
      newErrorState ? '이상 데이터로 표시됩니다' : '정상 데이터로 표시됩니다',
      newErrorState
        ? '엑셀 저장 시 모든 항목이 X로 표시됩니다.'
        : '엑셀 저장 시 정상 값으로 저장됩니다.'
    );
  };

  const handleSeparatorInsert = () => {
    insertSeparator();
    Alert.alert('구분선 삽입', 'CSV 파일에 구분선이 삽입되었습니다.');
  };

  const handleValuePress = () => {
    setIsModalVisible(true);
  };

  const handleSelectPA = (index) => {
    setCurrentPAIndex(index);
    setIsModalVisible(false);
  };

  const currentPA = PAData[currentPAIndex];


  const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const CHARACTERISTIC_UUID_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // 읽기용 (Notify)
  const CHARACTERISTIC_UUID_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // 쓰기용 (Write)

  const sendTextToESP32 = async (deviceId: string, text: string): Promise<boolean> => {
    try {
      console.log('📤 ESP32로 텍스트 전송:', text);
      console.log('📤 ESP32로 deviceId 전송:', deviceId);

      // 문자열을 바이트 배열로 변환
      const textBytes: number[] = Array.from(text, (char: string) => char.charCodeAt(0));

      // BLE Write 실행 (TX characteristic 사용)
      await BleManager.write(
        deviceId,                    // 연결된 디바이스 ID
        SERVICE_UUID,               // 서비스 UUID
        CHARACTERISTIC_UUID_TX,     // 쓰기용 특성 UUID
        textBytes                   // 전송할 데이터 (바이트 배열)
      );
      console.log('✅ 텍스트 전송 성공!');
      Alert.alert('✅ 텍스트 전송 성공!');
      return true;

    } catch (error) {
      console.error('❌ 텍스트 전송 실패:', error);
      Alert.alert('❌ 텍스트 전송 실패!');
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpPress}>
          <Text style={styles.buttonText}>▲</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.valueDisplay} onPress={handleValuePress}>
          <Text style={styles.paText}>
            {currentPA.name} ({currentPA.decimal})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleDownPress}>
          <Text style={styles.buttonText}>▼</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
        <Text style={styles.sendButtonText}>전송</Text>
      </TouchableOpacity>

      {state.currentPA && (
        <View style={styles.afterSendContainer}>
          <Text style={styles.afterSendLabel}>전송 후 데이터:</Text>
          <Text style={styles.afterSendValue}>
            PA: {state.currentPA.name} ({state.currentPA.value}) - {state.currentPA.timestamp}
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.errorButton, state.isErrorMarked && styles.errorButtonActive]}
          onPress={handleErrorCheck}
        >
          <Text style={[styles.errorButtonText, state.isErrorMarked && styles.errorButtonTextActive]}>
            {state.isErrorMarked ? '✓ 이상 데이터 표시' : '이상 데이터 체크'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.separatorButton}
          onPress={handleSeparatorInsert}
        >
          <Text style={styles.separatorButtonText}>구분</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PA 값 선택</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={PAData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    index === currentPAIndex && styles.selectedItem
                  ]}
                  onPress={() => handleSelectPA(index)}
                >
                  <Text style={[
                    styles.listItemText,
                    index === currentPAIndex && styles.selectedItemText
                  ]}>
                    {item.name} ({item.decimal})
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#12B6D1',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valueDisplay: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: '#12B6D1',
    minWidth: 120,
    alignItems: 'center',
  },
  paText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
  },
  sendButton: {
    backgroundColor: '#F5B75C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  afterSendContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#12B6D1',
  },
  afterSendLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  afterSendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#12B6D1',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  errorButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  errorButtonActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  errorButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorButtonTextActive: {
    color: 'white',
  },
  separatorButton: {
    flex: 1,
    backgroundColor: '#F0663F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#F0663F',
  },
  separatorButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#12B6D1',
    fontWeight: 'bold',
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#12B6D1',
    borderRadius: 5,
  },
  listItemText: {
    fontSize: 16,
    color: '#262626',
  },
  selectedItemText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PASelector;