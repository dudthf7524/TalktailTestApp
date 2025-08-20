import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import Header from './header';
import NavigationBar from './navigationBar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
  PeripheralInfo,
} from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';
import MessageModal from './modal/messageModal';
import AlertModal from "./modal/alertModal";
import { Buffer } from 'buffer';
import { useBLE } from './BLEContext';
import dayjs from 'dayjs';

// const {BleManager} = NativeModules;

type RootStackParamList = {
  ConnectBle: {
    selectedPet: {
      device_code: string;
      pet_code: string;
      name: string;
      gender: boolean;
      birth: string;
      breed: string;
      isNeutered: boolean;
      disease: string;
      fur_color:string;
    };
  };
  Dashboard: {
    selectedPet: {
      name: string;
      gender: boolean;
      birth: string;
      breed: string;
      isNeutered: boolean;
      disease: string;
    };
  };
};

type ConnectBleScreenRouteProp = RouteProp<RootStackParamList, 'ConnectBle'>;

type Props = {
  route: ConnectBleScreenRouteProp;
};

// BLE 관련 타입 정의 제거 (BleManager에서 가져온 타입 사용)
interface BleManagerEmitter extends NativeEventEmitter {
  addListener(eventType: string, listener: (event: any) => void): EmitterSubscription;
}

const BleManagerModule = NativeModules.BleManager;

// 이벤트 리스너를 직접 BleManager에서 가져오도록 수정
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
console.log("1111bleManagerEmitter : ", bleManagerEmitter);

const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHARACTERISTIC_UUID_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // 읽기용 (Notify)
const CHARACTERISTIC_UUID_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // 쓰기용 (Write)


// 스캔 관련 상수 추가
const SECONDS_TO_SCAN_FOR = 30;
const ALLOW_DUPLICATES = true;

const ConnectBle = ({ route }: Props) => {

  const { selectedPet } = route.params;
  console.log("selectedPet", selectedPet)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { dispatch, openRetryModal, setOpenRetryModal } = useBLE();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peripherals, setPeripherals] = useState(new Map());
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [dataBuffer, setDataBuffer] = useState<number[]>([]);
  const deviceFoundRef = useRef(false);

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
      return true;

    } catch (error) {
      console.error('❌ 텍스트 전송 실패:', error);
      return false;
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    let listeners: any[] = [];

    const initBLE = async () => {
      try {
        // BLE 초기화
        await BleManager.start({ showAlert: false });
        console.log('BLE Manager initialized');

        // 이벤트 리스너 등록
        console.log('Registering BLE event listeners...');

        // BleManager의 이벤트 리스너 등록 방식으로 변경
        listeners = [
          BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
          BleManager.onStopScan(handleStopScan),
          BleManager.onDidUpdateValueForCharacteristic(handleUpdateValueForCharacteristic),
          BleManager.onDisconnectPeripheral(handleDisconnectPeripheral),
        ];

        console.log('BLE event listeners registered successfully');

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
          console.log('Cleaning up BLE listeners...');
          isSubscribed = false;
          listeners.forEach(listener => listener.remove());
          if (selectedDevice) {
            BleManager.disconnect(selectedDevice);
          }
        };
      } catch (error) {
        console.error('BLE initialization error:', error);
      }
    };

    initBLE();
  }, []);

  const handleDiscoverPeripheral = peripheral => {
    if (peripheral.name === 'Tailing') {
      deviceFoundRef.current = true;
      setPeripherals(
        map =>
          new Map(
            map.set(peripheral.id, {
              ...peripheral,
              connected: false,
            }),
          ),
      );
    }
  };

  const handleStopScan = () => {
    console.log('Scan stopped');
    setIsScanning(false);
  };

  const startScan = async () => {
    try {
      // 안드로이드 권한 체크
      if (Platform.OS === 'android') {
        const permissionGranted = await handleAndroidPermissions();
        if (!permissionGranted) {
          return;
        }
      }

      const state = await BleManager.checkState();
      if (state === 'off') {
        setModalContent({
          title: '알림',
          content: '블루투스 연결을 활성화해주세요.',
        });
        setOpenAlertModal(true);
        setIsScanning(false);
        return;
      }

      if (isScanning) {
        BleManager.stopScan();
        setIsScanning(false);
        return;
      }

      // 스캔 시작
      deviceFoundRef.current = false;
      setPeripherals(new Map());
      setIsScanning(true);
      setIsSubscribed(false);
      setSelectedDevice(null);

      console.log('Starting scan...');
      BleManager.scan([], 10, true)
        .then(() => {
          console.log('Scan started');
          // 5초 후에 디바이스가 없으면 알림 표시
          setTimeout(() => {
            if (!deviceFoundRef.current) {
              setModalContent({
                title: '알림',
                content: '디바이스를 찾지 못했습니다.',
              });
              setOpenAlertModal(true);
              BleManager.stopScan();
              setIsScanning(false);
            }
          }, 5000);
        })
        .catch(error => {
          console.error('Scan error:', error);
          setIsScanning(false);
        });
    } catch (error) {
      console.error('Error in startScan:', error);
      setIsScanning(false);
    }
  };

  // const handleAndroidPermissions = async () => {
  //   if (Platform.OS === 'android' && Platform.Version >= 31) {
  //     const result = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  //       PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  //     ]);

  //     if (result) {
  //       console.log('Android 12+ permissions granted');
  //     } else {
  //       console.error('Android 12+ permissions denied');
  //       // 권한 필요 모달 표시
  //       setModalContent({
  //         title: '권한 필요',
  //         content: '블루투스 스캔을 위해 권한이 필요합니다.',
  //       });
  //       setOpenMessageModal(true);
  //     }
  //   } else if (Platform.OS === 'android' && Platform.Version >= 23) {
  //     const result = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //     );

  //     if (result) {
  //       console.log('Android <12 permissions granted');
  //     } else {
  //       console.error('Android <12 permissions denied');
  //       // 권한 필요 모달 표시
  //       setModalContent({
  //         title: '권한 필요',
  //         content: '블루투스 스캔을 위해 위치 권한이 필요합니다.',
  //       });
  //       setOpenMessageModal(true);
  //     }
  //   }
  // };

  const handleAndroidPermissions = async (): Promise<boolean> => {
    console.log('==== Android 권한 체크 시작 ====');

    if (Platform.OS === 'android') {
      try {
        const grantedPermissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        console.log("scanGranted :", grantedPermissions);
        if (grantedPermissions['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          grantedPermissions['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          grantedPermissions['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          Alert.alert(
            '권한 필요',
            '블루투스 스캔 권한이 "다시 묻지 않음"으로 설정되어 있어, 설정에서 직접 허용해야 합니다.',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '설정으로 이동',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return false;
        }
        if (
          grantedPermissions['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          grantedPermissions['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          grantedPermissions['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('모든 권한이 허용되었습니다.');
          return true;
        } else {
          console.log('하나 이상의 권한이 거부됨');
          return false;
        }
      } catch (err) {
        console.warn('권한 요청 중 오류:', err);
        return false;
      }
    }

    return true;
  };


  const handleDeviceSelect = async (deviceId: string) => {
    try {
      // 이전 연결 상태 정리
      if (isSubscribed) {
        try {
          const peripheralInfo = await BleManager.retrieveServices(deviceId);
          if (peripheralInfo.services && peripheralInfo.characteristics) {
            for (const service of peripheralInfo.services) {
              const characteristics =
                peripheralInfo.characteristics[service.uuid];
              if (characteristics) {
                for (const characteristic of characteristics) {
                  if (
                    characteristic.properties.Notify ||
                    characteristic.properties.Indicate
                  ) {
                    await BleManager.stopNotification(
                      deviceId,
                      service.uuid,
                      characteristic.uuid,
                    );
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error cleaning up previous connection:', error);
        }
      }

      // 이전 데이터 초기화
      dispatch({ type: 'CLEAR_COLLECTED_DATA' });
      setIsSubscribed(false);

      // 새 연결 시도
      await BleManager.connect(deviceId);

      // 연결 상태 업데이트
      setIsConnected(true);
      setSelectedDevice(deviceId);
      dispatch({
        type: 'CONNECT_DEVICE',
        payload: {
          startDate: dayjs().format('YYYYMMDD'),
          startTime: dayjs().format('HHmmss'),
          deviceCode: selectedPet.device_code,
          petCode: selectedPet.pet_code,
        },
      });

      // peripherals 맵 업데이트
      setPeripherals(prevPeripherals => {
        const newPeripherals = new Map(prevPeripherals);
        const peripheral = newPeripherals.get(deviceId);
        if (peripheral) {
          newPeripherals.set(deviceId, { ...peripheral, connected: true });
        }
        return newPeripherals;
      });

      // 서비스 및 특성 검색
      const peripheralInfo = await BleManager.retrieveServices(deviceId);

      // 알림 시작
      await BleManager.startNotification(
        deviceId,
        SERVICE_UUID,
        CHARACTERISTIC_UUID_RX,
      )
        .then(() => {
          console.log(
            'Notification started on characteristic:',
            CHARACTERISTIC_UUID_RX,
          );
          console.log("deviceId", deviceId)
          setIsSubscribed(true);
        })
        .catch(error => {
          console.error('Error starting notification:', error);
        });

      setModalContent({
        title: '연결 성공',
        content: '디바이스가 연결되었습니다.',
      });

      setOpenMessageModal(true);

      // 연결 성공 후 약간의 딜레이를 주고 데이터 전송
      setTimeout(() => {
        sendTextToESP32(deviceId, selectedPet.fur_color);
      }, 500);
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      setSelectedDevice(null);
      dispatch({ type: 'CONNECT_DEVICE', payload: null });
      setIsSubscribed(false);
      setModalContent({
        title: '연결 실패',
        content: '디바이스 연결에 실패했습니다.',
      });
      setOpenMessageModal(true);
    }
  };
  let lastTimestamp = performance.now();

  const lastUpdateTime = useRef<number>(Date.now());

  const dataBufferRef = useRef<{ data: number[], timestamp: number }[]>([]);
  const handleUpdateValueForCharacteristic = useCallback((data: any) => {

    const value = data.value;
    const decodedValue = Buffer.from(value, 'base64').toString('utf-8');
    // console.log('🔔 handleUpdateValueForCharacteristic 호출됨:', new Date().toISOString());

    const parsedData = decodedValue.split(',').map(Number);
    // console.log("cnt : ", parsedData[0]);

    console.log("ir : ", parsedData[1]);
    // console.log("red : ", parsedData[2]);
    // console.log("배터리 : ", parsedData[7]);

    // if (parsedData[1] < 110000) {
    //   // 버퍼 비우기
    //   dataBufferRef.current = [];

    //   // 팝업이 이미 표시되지 않은 경우에만 팝업 표시
    //   if (!openRetryModal) {
    //     setOpenRetryModal(true);
    //   }
    //   return; // 함수 종료
    // }

    dataBufferRef.current.push({
      data: parsedData,
      timestamp: Date.now()
    });
    if (dataBufferRef.current.length >= 10) {
      const collectedData = dataBufferRef.current.slice();
      dataBufferRef.current = [];

      const allDataPoints = collectedData.map(({ data, timestamp }) => ({
        timestamp,
        cnt: data[0],
        ir: data[1],
        red: data[2],
        green: data[3],
        spo2: data[4] ?? 0,
        hr: data[5] ?? 0,
        temp: data[6] ?? 0,
        battery: data[7] ?? 0,
      }));

      // 3단계: dispatch
      dispatch({
        type: 'COLLECT_DATAS',
        payload: allDataPoints,
      });
    }
  }, [dispatch, openRetryModal, setOpenRetryModal]);

  const handleDisconnectPeripheral = async (data: any) => {
    console.log('Device disconnected:', data.peripheral);
    dataBufferRef.current = [];

    // 구독 중지
    if (isSubscribed) {
      try {
        const peripheralInfo = await BleManager.retrieveServices(
          data.peripheral,
        );
        if (peripheralInfo.services && peripheralInfo.characteristics) {
          for (const service of peripheralInfo.services) {
            const characteristics =
              peripheralInfo.characteristics[service.uuid];
            if (characteristics) {
              for (const characteristic of characteristics) {
                if (
                  characteristic.properties.Notify ||
                  characteristic.properties.Indicate
                ) {
                  await BleManager.stopNotification(
                    data.peripheral,
                    service.uuid,
                    characteristic.uuid,
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error stopping notifications:', error);
      }
    }

    dispatch({ type: 'CONNECT_DEVICE', payload: null });
    dispatch({ type: 'CLEAR_COLLECTED_DATA' });
    setIsSubscribed(false);
    setIsConnected(false);
    setSelectedDevice(null);

    // peripherals 맵 업데이트
    setPeripherals(map => {
      const newMap = new Map(map);
      const peripheral = newMap.get(data.peripheral);
      if (peripheral) {
        newMap.set(data.peripheral, { ...peripheral, connected: false });
      }
      return newMap;
    });

    // 모달 표시를 setTimeout으로 감싸서 상태 업데이트 후 실행되도록 함
    setTimeout(() => {
      setModalContent({
        title: '연결 끊김',
        content: '디바이스와의 연결이 끊어졌습니다.',
      });
      setOpenMessageModal(true);
    }, 100);
  };

  // 컴포넌트 언마운트 시 남은 데이터 처리
  // useEffect(() => {
  //   return () => {
  //     if (dataBuffer.length > 0) {
  //       collectData(dataBuffer);
  //     }
  //   };
  // }, [dataBuffer]);

  const handleDisconnect = async () => {
    if (selectedDevice) {
      try {
        // 구독 중지
        if (isSubscribed) {
          const peripheralInfo = await BleManager.retrieveServices(
            selectedDevice,
          );
          if (peripheralInfo.services && peripheralInfo.characteristics) {
            for (const service of peripheralInfo.services) {
              const characteristics =
                peripheralInfo.characteristics[service.uuid];
              if (characteristics) {
                for (const characteristic of characteristics) {
                  if (
                    characteristic.properties.Notify ||
                    characteristic.properties.Indicate
                  ) {
                    await BleManager.stopNotification(
                      selectedDevice,
                      service.uuid,
                      characteristic.uuid,
                    );
                  }
                }
              }
            }
          }
          setIsSubscribed(false);
        }

        await BleManager.disconnect(selectedDevice);
        console.log('Disconnected from device:', selectedDevice);

        // 연결 해제 시 상태 업데이트
        setIsConnected(false);
        dispatch({ type: 'CONNECT_DEVICE', payload: null });
        dispatch({ type: 'CLEAR_COLLECTED_DATA' });
        setPeripherals(map => {
          const newMap = new Map(map);
          const peripheral = newMap.get(selectedDevice);
          if (peripheral) {
            newMap.set(selectedDevice, { ...peripheral, connected: false });
          }
          return newMap;
        });
      } catch (error) {
        console.error('Disconnection error:', error);
      }
    }
    setSelectedDevice(null);
  };

  const handleMonitoring = () => {
    // if(!isConnected) {
    //   setModalContent({
    //     title: '알림',
    //     content: '디바이스를 연결해주세요.'
    //   });
    //   setOpenAlertModal(true);
    // } else {
    //   navigation.push('Dashboard', {
    //     selectedPet,
    //   });
    // }
    // navigation.navigate('Dashboard');
    navigation.push('Dashboard', {
      selectedPet,
    });
  };

  return (
    <>
      <Header title="디바이스 연결" />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.monitorBox}>
          <ScrollView
            style={styles.deviceList}
            contentContainerStyle={styles.deviceListContent}>
            {Array.from(peripherals.values()).map(peripheral => (
              <Pressable
                key={peripheral.id}
                style={({ pressed }) => [
                  styles.deviceItem,
                  selectedDevice === peripheral.id && styles.selectedDevice,
                  peripheral.connected && styles.connectedDevice,
                  pressed && styles.pressedDevice,
                ]}
                onPress={() => handleDeviceSelect(peripheral.id)}
                disabled={peripheral.connected}>
                <Text style={styles.deviceName}>
                  {peripheral.name}
                  {peripheral.connected ? ' (연결됨)' : ''}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.scanButton,
            isConnected && styles.disconnectButton,
            pressed && styles.pressedButton,
          ]}
          onPress={isConnected ? handleDisconnect : startScan}>
          <Text style={styles.buttonText}>
            {isConnected
              ? '디바이스 연결 끊기'
              : isScanning
                ? '찾는 중...'
                : '디바이스 찾기'}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.monitoringButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleMonitoring}>
          <Text style={styles.buttonText}>모니터링 하기</Text>
        </Pressable>
       
        {/* <Pressable
          style={({ pressed }) => [
            styles.monitoringButton,
            pressed && styles.pressedButton
          ]}
          onPress={handleMonitoring}
        >
          <Text style={styles.buttonText}>{isConnected ? '연결 중' : '연결 안중'}</Text>
        </Pressable> */}
      </SafeAreaView>
      <NavigationBar />
      <MessageModal
        visible={openMessageModal}
        title={modalContent.title}
        content={modalContent.content}
        onClose={() => setOpenMessageModal(false)}
      />
      <AlertModal
        visible={openAlertModal}
        title={modalContent.title}
        content={modalContent.content}
        onClose={() => setOpenAlertModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  monitorBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5B75C',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 15,
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    alignItems: 'center',
  },
  deviceItem: {
    width: '90%',
    padding: 20,
    height: 70,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowRadius: 0.5,
    elevation: 0.01,
    justifyContent: 'center',
  },
  selectedDevice: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowOpacity: 0.02,
    elevation: 0.8,
  },
  connectedDevice: {
    backgroundColor: '#FF8C6B',
    shadowOpacity: 0.02,
    elevation: 0.8,
  },
  deviceName: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#F0663F',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  disconnectButton: {
    backgroundColor: '#F5B75C',
  },
  monitoringButton: {
    backgroundColor: '#F0663F',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  pressedDevice: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default ConnectBle;