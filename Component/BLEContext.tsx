import React, {createContext, useContext, useReducer, useRef, useState} from 'react';
import {dataStore} from '../store/dataStore';
import dayjs from 'dayjs';

// 상태 타입 정의
interface DataPoint {
  timestamp: number;
  ir: number;
  red: number;
  green: number;
  spo2: number;
  hr: number;
  temp: number;
  battery: number;
}

interface BLEState {
  connectedDevice: {
    startDate: string;
    startTime: string;
    deviceCode: string;
    petCode: string;
  } | null;
  deviceId: string | null;
  chartData: number[];
  collectedData: DataPoint[];
  currentHR: number | null;
  currentSpO2: number | null;
  currentTemp: {value: number; timestamp: number} | null;
  tempChartData: Array<{value: number; timestamp: number}>;
  irChartData: number[];
  currentBattery: number | null;
  isErrorMarked: boolean;
  currentPA: {name: string; value: string; timestamp: string} | null;
}

// 액션 타입 정의
type BLEAction =
  | {
      type: 'CONNECT_DEVICE';
      payload: {
        startDate: string;
        startTime: string;
        deviceCode: string;
        petCode: string;
      } | null;
    }
  | {type: 'SET_DEVICE_ID'; payload: string | null}
  | {type: 'UPDATE_CHART_DATA'; payload: number; skipAnimation: boolean}
  | {type: 'COLLECT_DATAS'; payload: DataPoint[]}
  | {type: 'CLEAR_COLLECTED_DATA'}
  | {type: 'UPDATE_HR'; payload: number}
  | {type: 'UPDATE_SPO2'; payload: number}
  | {type: 'UPDATE_SPO2_HR'; payload: {spo2: number; hr: number}}
  | {type: 'UPDATE_TEMP'; payload: {value: number; timestamp: number}}
  | {type: 'UPDATE_BATTERY'; payload: number}
  | {type: 'UPDATE_DATAS'; payload: {hr?: number; spo2?: number; temp?: number; battery?: number; tempChartData?: {value: number; timestamp: number}; irChartData?: number[]} }
  | {type: 'SET_ERROR_MARKED'; payload: boolean}
  | {type: 'SET_CURRENT_PA'; payload: {name: string; value: string; timestamp: string} | null}
  | {type: 'INSERT_SEPARATOR'};

// 초기 상태
const initialState: BLEState = {
  connectedDevice: null,
  deviceId: null,
  chartData: [],
  collectedData: [],
  currentHR: null,
  currentSpO2: null,
  currentTemp: null,
  tempChartData: [],
  irChartData: [],
  currentBattery: null,
  isErrorMarked: false,
  currentPA: null,
};

// 리듀서 함수
const bleReducer = (state: BLEState, action: BLEAction): BLEState => {
  switch (action.type) {
    case 'CONNECT_DEVICE':
      return {...state, connectedDevice: action.payload};
    case 'SET_DEVICE_ID':
      return {...state, deviceId: action.payload};
    case 'UPDATE_CHART_DATA':
      const newData = [...state.chartData, action.payload];
      if (newData.length > 500) {
        newData.shift();
      }
      return {...state, chartData: newData};
    case 'COLLECT_DATAS':
      return {
        ...state,
        collectedData: [...state.collectedData, ...action.payload],
      };
    case 'CLEAR_COLLECTED_DATA':
      return {
        ...state,
        collectedData: [],
      };
    case 'UPDATE_DATAS':
      let newTempData = state.tempChartData;
      let newIrData = state.irChartData;
      if (action.payload.tempChartData) {
        // 중복 체크: 같은 timestamp가 이미 있는지 확인
        const isDuplicate = state.tempChartData.some(
          item => item.timestamp === action.payload.tempChartData!.timestamp
        );
        
        // 중복이 아닌 경우에만 추가
        if (!isDuplicate) {
          newTempData = [...state.tempChartData, action.payload.tempChartData];
        }
      }
    
      if (action.payload.irChartData) {
        newIrData = [...state.irChartData, ...action.payload.irChartData];
        
        // 최대 150개 데이터 포인트 유지 (3초치 데이터)
        if (newIrData.length > 150) {
          newIrData = newIrData.slice(-150);
        }
      }

      if (newTempData.length > 60) {
        // 최대 60개 데이터 포인트 유지
        newTempData.shift();
      }
      
      return {
        ...state,
        currentHR: action.payload.hr ?? state.currentHR,
        currentSpO2: action.payload.spo2 ?? state.currentSpO2,
        currentTemp: action.payload.temp ? {value: action.payload.temp, timestamp: Date.now()} : state.currentTemp,
        currentBattery: action.payload.battery ?? state.currentBattery,
        tempChartData: newTempData,
        irChartData: newIrData,
      };
    case 'SET_ERROR_MARKED':
      return {...state, isErrorMarked: action.payload};
    case 'SET_CURRENT_PA':
      return {...state, currentPA: action.payload};
    case 'INSERT_SEPARATOR':
      const separatorData: DataPoint = {
        timestamp: Date.now(),
        ir: -1,
        red: -1,
        green: -1,
        spo2: -1,
        hr: -1,
        temp: -1,
        battery: -1,
      };
      return {
        ...state,
        collectedData: [...state.collectedData, separatorData],
      };
    default:
      return state;
  }
};

const [openModal, setOpenModal] = useState(false);
// Context 생성
const BLEContext = createContext<
  | {
      state: BLEState;
      dispatch: React.Dispatch<BLEAction>;
      addChartData: (data: number) => void;
      getConnectedDevice: () => BLEState['connectedDevice'];
      openRetryModal: boolean;
      setOpenRetryModal: (open: boolean) => void;
      setErrorMarked: (marked: boolean) => void;
      setCurrentPA: (pa: {name: string; value: string; timestamp: string} | null) => void;
      insertSeparator: () => void;
    }
  | undefined
>(undefined);

let globalGetConnectedDevice: (() => BLEState['connectedDevice']) | null = null;

// Provider 컴포넌트
export const BLEProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bleReducer, initialState);
  const lastUpdateTime = useRef<number>(Date.now());
  const {createCSV} = dataStore();
  const {sendData} = dataStore();
  const cntRef = useRef(0); // cnt를 useRef로 관리
  const [openRetryModal, setOpenRetryModal] = useState(false);
  const isFirstSaveRef = useRef(true); // 새 연결 후 첫 저장인지 추적
 
  globalGetConnectedDevice = () => state.connectedDevice;

  // 데이터 전송 로직을 useEffect로 분리
  React.useEffect(() => {
    // 150개마다 실행 (3초마다 값 업데이트)
    if (state.collectedData.length % 150 === 0 && state.collectedData.length > 0) {
      const json1 = state.collectedData.find((item) => item.spo2 > 0);
      const json2 = state.collectedData.find((item) => item.temp > 0);
      const json3 = state.collectedData.find((item) => item.battery > 0);
      
      console.log("json3", json3?.battery)

      const irDataArray = state.collectedData
        .filter(item => item.ir > 0) // 유효한 ir 값만 필터링
        .map(item => item.ir);

      // temp가 유효한 값일 때만 tempChartData 추가
      if (json2?.temp && json2?.temp > 0 && json2?.timestamp && json2?.timestamp > 0) {
        dispatch({
          type: "UPDATE_DATAS",
          payload: {
            spo2: json1?.spo2 ?? 0,
            hr: json1?.hr ?? 0,
            battery: json3?.battery,
            temp: json2.temp,
            tempChartData: {value: json2.temp, timestamp: json2.timestamp},
            irChartData: irDataArray,
          }
        });
      } else if (json3?.battery && json3?.battery >= 0) {

        dispatch({
          type: "UPDATE_DATAS",
          payload: {
            spo2: json1?.spo2 ?? 0,
            hr: json1?.hr ?? 0,
            battery: json3?.battery,
            temp: json2?.temp ?? 0,
            tempChartData: {value: json2?.temp ?? 0, timestamp: json2?.timestamp ?? 0},
            irChartData: irDataArray,
          }
        });
      }
      else {
        // temp 데이터가 없을 때는 tempChartData 없이 dispatch
        dispatch({
          type: "UPDATE_DATAS",
          payload: {
            spo2: json1?.spo2 ?? 0,
            hr: json1?.hr ?? 0,
            temp: json2?.temp ?? 0,
            irChartData: irDataArray,
          }
        });
      }
    }
    if ((state.collectedData.length + 1) / 500 > 1) {
      const dataToSend = [...state.collectedData];
      dispatch({type: 'CLEAR_COLLECTED_DATA'});
      cntRef.current = 0; // 데이터 전송 시 cnt 초기화

      if (state.connectedDevice) {
        // 비동기로 서버 전송 (메인 스레드 블로킹 방지)
        setTimeout(() => {
          // 타입 캐스팅으로 타입 에러 해결
          sendData(
            dataToSend as any, 
            state.connectedDevice!, 
            isFirstSaveRef.current,
            state.isErrorMarked,
            state.currentPA
          )
            .then(() => {
              console.log('데이터 전송 완료');
              isFirstSaveRef.current = false; // 첫 저장 완료 후 플래그 변경
            })
            .catch(error => {
              console.error('Error sending data:', error);
            });
        }, 0);
      } else {
        console.error('Device information not available');
      }
    }
  }, [state.collectedData.length]);

  // 디바이스 연결 상태 변경 감지
  React.useEffect(() => {
    if (!state.connectedDevice && state.collectedData.length > 0) {
      // 연결이 끊어질 때 남은 데이터가 있으면 저장
      const dataToSend = [...state.collectedData];
      dispatch({type: 'CLEAR_COLLECTED_DATA'});
      cntRef.current = 0;
      
      // 디바이스 정보가 있었다면 저장
      if (globalGetConnectedDevice && globalGetConnectedDevice()) {
        const deviceInfo = globalGetConnectedDevice();
        setTimeout(() => {
          sendData(
            dataToSend as any, 
            deviceInfo!, 
            false,
            state.isErrorMarked,
            state.currentPA
          )
            .then(() => {
              console.log('연결 종료 시 남은 데이터 저장 완료');
            })
            .catch(error => {
              console.error('연결 종료 시 데이터 저장 에러:', error);
            });
        }, 0);
      }
    } else if (!state.connectedDevice) {
      cntRef.current = 0; // 디바이스 연결이 끊어질 때 cnt 초기화
      isFirstSaveRef.current = true; // 새 연결을 위해 플래그 리셋
    } else if (state.connectedDevice) {
      // 새로운 디바이스가 연결될 때 첫 저장 플래그를 true로 설정
      isFirstSaveRef.current = true;
    }
  }, [state.connectedDevice]);

  const addChartData = React.useCallback((data: number) => {
    const now = Date.now();
    if (now - lastUpdateTime.current >= 100) {
      dispatch({
        type: 'UPDATE_CHART_DATA',
        payload: data,
        skipAnimation: true, // 애니메이션 스킵 플래그 추가
      });
      lastUpdateTime.current = now;
    }
  }, []);

  React.useEffect(() => {
    if (state.connectedDevice) {
      createCSV(
        state.connectedDevice.startDate,
        state.connectedDevice.startTime,
        state.connectedDevice.petCode,
        state.connectedDevice.deviceCode,
      );
    }
  }, [state.connectedDevice]);

  const setErrorMarked = React.useCallback((marked: boolean) => {
    dispatch({type: 'SET_ERROR_MARKED', payload: marked});
  }, []);
  
  
  const setCurrentPA = React.useCallback((pa: {name: string; value: string; timestamp: string} | null) => {
    dispatch({type: 'SET_CURRENT_PA', payload: pa});
  }, []);

  const insertSeparator = React.useCallback(() => {
    dispatch({type: 'INSERT_SEPARATOR'});
  }, []);

  return (
    <BLEContext.Provider
      value={{state, dispatch, addChartData, getConnectedDevice, openRetryModal, setOpenRetryModal, setErrorMarked, setCurrentPA, insertSeparator}}>
      {children}
    </BLEContext.Provider>
  );
};

export const getConnectedDevice = () => {
  if (!globalGetConnectedDevice) {
    throw new Error('BLE Provider not initialized');
  }
  return globalGetConnectedDevice();
};

// Custom Hook
export const useBLE = () => {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error('useBLE must be used within a BLEProvider');
  }
  return context;
};