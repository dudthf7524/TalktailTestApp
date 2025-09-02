import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Dimensions,
  ScrollView,
  AppState,
  Image,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Header from './header';
import NavigationBar from './navigationBar';
import { Buffer } from 'buffer';
import DashboardInfo from './dashboardInfo';
import DashboardChart from './dashboardChart';
import DashboardData from './dashboardData';
import PASelector from './PASelector';
import { useBLE } from './BLEContext';

type RootStackParamList = {
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
  DetailHeart: {
    hrData: number;
  };
  DetailTemp: {
    tempData: number;
  };
};

type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

const windowWidth = Dimensions.get('window').width;

// BLE 관련 코드는 connectBle.tsx에서만 처리

const Dashboard = ({ route }: { route: DashboardScreenRouteProp }) => {
  const { dispatch, openRetryModal, setOpenRetryModal } = useBLE();
  const { selectedPet } = route.params;
  const { state } = useBLE(); // BLEContext 사용
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [appState, setAppState] = useState(AppState.currentState);

  // BLEContext의 상태를 사용
  const hrData = state.currentHR;
  const spo2Data = state.currentSpO2;
  const tempData = state.currentTemp;
  // BLE 이벤트 리스너는 connectBle.tsx에서만 등록하고, 
  // 대시보드에서는 BLEContext를 통해 데이터를 받음
  useEffect(() => {
    console.log('Dashboard mounted - BLE data will be received via BLEContext');
  }, []);

  // BLE 데이터 처리는 connectBle.tsx에서 담당하므로 제거

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setOrientation(width < height ? 'PORTRAIT' : 'LANDSCAPE');

    try {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setOrientation(window.width < window.height ? 'PORTRAIT' : 'LANDSCAPE');
      });

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error("Dimensions.addEventListener 에러:", error);
    }
  }, []);

  // 화면 회전 감지를 위한 별도의 useEffect
  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setOrientation(width < height ? 'PORTRAIT' : 'LANDSCAPE');
  }, [appState]);

  return (
    <>
      {orientation === 'PORTRAIT' && <Header title="디바이스 모니터링" />}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <DashboardInfo screen={orientation} pet={selectedPet} />
        <DashboardChart screen={orientation} />
        <DashboardData
          screen={orientation}
          data={{
            hrData: hrData,
            spo2Data: spo2Data,
            tempData: tempData?.value || null,
          }}
        />
        <PASelector />
        {orientation === 'PORTRAIT' && Platform.OS === "android" ? (
          <View style={styles.portrait_box}>
          </View>
        ) : (
          ''
        )}
      </ScrollView>
      {orientation === 'PORTRAIT' && <NavigationBar />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    flexGrow: 1,
  },
  ble_box: {
    width: '100%',
    height: 28,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  ble_status: {
    color: '#7b7b7b',
    fontSize: 12,
    fontWeight: '400',
  },
  ble_icon: {
    width: 28,
    height: 28,
  },

  basic_info: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  basic_icon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  basic_text: {
    fontSize: 16,
    fontWeight: '400',
    color: '#262626',
  },
  article_box: {
    width: '100%',
    height: 52,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  icon_box: {
    width: 105,
    height: 24,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  detail: {
    fontSize: 12,
    fontWeight: '400',
    color: '#262626',
    marginLeft: 'auto',
  },
  box_line: {
    width: '100%',
    height: 1,
    backgroundColor: '#F5B75C',
  },
  title: {
    width: '100%',
    marginTop: 40,
    marginLeft: 60,
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    textAlign: 'left',
  },
  img_box: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  ble_touch: {
    width: 300,
    height: 300,
    borderWidth: 1,
    borderColor: 'white',
  },
  ble_img: {
    width: 300,
    height: 300,
  },
  ble_text: {
    fontSize: 15,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  btn_box: {
    paddingTop: 13,
  },
  back_btn: {
    fontSize: 12,
    color: '#12B6D1',
    fontWeight: 'bold',
    marginLeft: 31,
  },
  body: {
    alignItems: 'center',
  },
  scan_button: {
    width: 207,
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12B6D1',
    marginTop: 22,
    borderRadius: 6,
  },
  input_box: {
    width: '80%',
    height: 41,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scan_button_text: {
    fontSize: 20,
    color: 'white',
  },
  list_box: {
    width: '90%',
    height: '25%',
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#2D7C9B',
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 0,
  },
  row: {
    width: windowWidth * 0.8,
    height: 47,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 14,
  },
  touch_box: {
    height: 47,
    marginTop: 15,
    marginBottom: 15,
  },
  icon: {
    width: 30,
    height: 30,
  },
  peripheral_name: {
    width: windowWidth * 0.55,
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  connecting: {
    width: 30,
    height: 30,
  },
  state: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  input_text: {
    width: '70%',
    height: 41,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#12B6D1',
    paddingLeft: 20,
  },
  chart_container: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  split_chart_container: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  half_chart: {
    flex: 1,
    height: '100%',
  },
  play_pause_button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  play_pause_button_text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  portrait_view: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  portrait_box: {
    width: 100,
    height: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 100,
  },
  icon_img: {
    width: '100%',
    height: '100%',
  },
});
export default Dashboard;
