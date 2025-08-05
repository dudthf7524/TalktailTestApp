// App.tsx
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, Alert, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orientation from 'react-native-orientation-locker';

import { BLEProvider, useBLE } from './Component/BLEContext';
import AlertModal from './Component/modal/alertModal';
import UpdatePage from './UpdateModal';
import { checkAppVersion } from './checkAppVersion';

import Login from './Component/logIn';
import SignUp from './Component/sign';
import Dashboard from './Component/dashboard';
import DetailTemp from './Component/detailTemp';
import DetailHeart from './Component/detailHeart';
import Intro from './Component/intro';
import RegisterPet from './Component/registerPet';
import PetLists from './Component/petLists';
import ConnectBle from './Component/connectBle';
import EditPet from './Component/editPet';
import Record from './Component/record';
import Mypage from './Component/mypage';
import MypageChangeInfo from './Component/mypageChangeInfo';
import MypageChangePW from './Component/mypageChangePW';
import MypageAgree from './Component/mypageAgree';
import MypageOut from './Component/mypageOut';
import Board from './Component/board';
import BoardDetail from './Component/boardDetail';
import CustomerService from './Component/customerService';
import { RootStackParamList } from './types/navigation';
import DeviceSetup from './Component/DeviceSetup';
import EditDevice from './Component/EditDevice';

export const navigationRef = createNavigationContainerRef();

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [versionChecked, setVersionChecked] = useState(false);
  const { openRetryModal, setOpenRetryModal } = useBLE();
  const [updateDate, setUpdateDate] = useState('');

  const handleRetryConfirm = () => setOpenRetryModal(false);

  const handleUpdate = () => {
    const url = Platform.OS === 'android'
      ? 'https://play.google.com/store/apps/details?id=com.talktail'
      : 'https://apps.apple.com/app/id6746703880';
    Linking.openURL(url);
  };

  useEffect(() => {
    const check = async () => {
      try {
        await checkAppVersion(setShowUpdateModal, setUpdateDate);
      } catch (e) {
        console.error('버전 체크 실패:', e);
      } finally {
        setVersionChecked(true);
      }
    };
    check();
  }, []);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const currentRoute = navigationRef.getCurrentRoute();
      const currentScreen = currentRoute?.name;

      if (currentScreen === 'Login') {
        Orientation.lockToPortrait();
      } else {
        Orientation.unlockAllOrientations();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (openRetryModal && Platform.OS === 'ios') {
      Alert.alert('디바이스 위치 조정', '다시 시도해 주세요', [
        {
          text: '확인',
          onPress: handleRetryConfirm,
        },
      ]);
    }
  }, [openRetryModal]);

  if (!versionChecked || showUpdateModal) {
    return (
      <UpdatePage
        visible={showUpdateModal}
        onUpdate={handleUpdate}
        onClose={() => setShowUpdateModal(false)}
        updateDate={updateDate}
      />
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}
        >
          <Stack.Screen name="Intro" component={Intro} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="DetailTemp" component={DetailTemp} />
          <Stack.Screen name="DetailHeart" component={DetailHeart} />
          <Stack.Screen name="RegisterPet" component={RegisterPet} />
          <Stack.Screen name="PetLists" component={PetLists} />
          <Stack.Screen name="ConnectBle" component={ConnectBle} />
          <Stack.Screen name="EditPet" component={EditPet} />
          <Stack.Screen name="Record" component={Record} />
          <Stack.Screen name="Mypage" component={Mypage} />
          <Stack.Screen name="MypageChangeInfo" component={MypageChangeInfo} />
          <Stack.Screen name="MypageChangePW" component={MypageChangePW} />
          <Stack.Screen name="MypageAgree" component={MypageAgree} />
          <Stack.Screen name="MypageOut" component={MypageOut} />
          <Stack.Screen name="Board" component={Board} />
          <Stack.Screen name="BoardDetail" component={BoardDetail} />
          <Stack.Screen name="CustomerService" component={CustomerService} />
          <Stack.Screen name="DeviceSetup" component={DeviceSetup} />
          <Stack.Screen name="EditDevice" component={EditDevice} />
        </Stack.Navigator>
      </NavigationContainer>

      {Platform.OS === 'android' && (
        <AlertModal
          visible={openRetryModal}
          title="디바이스 위치 조정"
          content="다시 시도해 주세요"
          onClose={handleRetryConfirm}
        />
      )}
    </>
  );
};

const App = () => (
  <SafeAreaProvider>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    <BLEProvider>
      <AppContent />
    </BLEProvider>
  </SafeAreaProvider>
);

export default App;
