import React, { useEffect, useState } from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BLEProvider } from './Component/BLEContext';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {useBLE} from './Component/BLEContext';
import AlertModal from './Component/modal/alertModal';

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
// import BatteryTest from './Component/BatteryTest';
import { RootStackParamList } from './types/navigation';
// import './backgroundEventHandler';
import Orientation from 'react-native-orientation-locker';
export const navigationRef = createNavigationContainerRef();

const Stack = createNativeStackNavigator<RootStackParamList>();

// async function requestNotificationPermission() {
//   if (Platform.OS === 'android' && Platform.Version >= 33) {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     );
//     if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//       console.log('🔕 알림 권한 거부됨');
//       return false;
//     } else {
//       console.log('🔔 알림 권한 허용됨');
//       return true;
//     }
//   }
//   if (Platform.OS === 'ios') {
//     const authStatus = await messaging().requestPermission();
//     console.log('iOS 권한 상태:', authStatus);
//   }
//   return true;
// }

// async function setupNotifications() {
//   await notifee.createChannel({
//     id: 'riders',
//     name: '앱 전반',
//     sound: 'default',
//     importance: AndroidImportance.HIGH,
//   });

  // await messaging().requestPermission();
  // if (Platform.OS === 'ios') {
  //   await notifee.requestPermission();
  // }

//   const shownMessages = new Set();

//   messaging().setBackgroundMessageHandler(async remoteMessage => {
//     if (shownMessages.has(remoteMessage.messageId)) return;
//     shownMessages.add(remoteMessage.messageId);
//     await notifee.displayNotification({
//       title: remoteMessage.notification?.title,
//       body: remoteMessage.notification?.body,
//       android: {
//         channelId: 'riders',
//         pressAction: {
//           id: 'default', // 반드시 id 지정 (대부분 'default' 사용)
//         },
//       },
//       data: { screen: remoteMessage.data?.screen ?? '' },
//     });
//   });

//   messaging().onMessage(async remoteMessage => {
//     if (shownMessages.has(remoteMessage.messageId)) return;
//     shownMessages.add(remoteMessage.messageId);
//     await notifee.displayNotification({
//       title: remoteMessage.notification?.title,
//       body: remoteMessage.notification?.body,
//       android: {
//         channelId: 'riders',
//         pressAction: {
//           id: 'default', // 반드시 id 지정 (대부분 'default' 사용)
//         },
//       },
//       data: { screen: remoteMessage.data?.screen ?? '' },
//     });
//   });
// }

// function setupNotificationNavigationHandlers() {
//   notifee.onForegroundEvent(({ type, detail }) => {
//     if (type === EventType.PRESS) {
//       const screen = detail.notification?.data?.screen;
//       if (screen && navigationRef.isReady()) {
//         navigationRef.navigate(screen);
//       }
//     }
//   });

//   messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log('aaaa')
//     const screen = remoteMessage?.data?.screen;
//     if (screen && navigationRef.isReady()) {
//       navigationRef.navigate(screen);
//     }
//   });

//   messaging().getInitialNotification().then(remoteMessage => {
//     console.log('aaa')
//     const screen = remoteMessage?.data?.screen;
//     console.log(screen)

//     if (screen) {
//       const interval = setInterval(() => {
//         if (navigationRef.isReady()) {
//           navigationRef.navigate(screen);
//           clearInterval(interval);
//         }
//       }, 300);
//     }
//   });
// }

const AppContent = () => {
  // useEffect(() => {
  //   messaging().setAutoInitEnabled(true);
  //   requestNotificationPermission();
  //   setupNotifications();
  //   setupNotificationNavigationHandlers();


  // }, []);
  const [platform, setPlatform] = useState(Platform.OS); 
  const {openRetryModal, setOpenRetryModal} = useBLE();

  const handleRetryConfirm = () => {
    setOpenRetryModal(false);
  };

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
    if (openRetryModal && platform === "ios") {
      Alert.alert('디바이스 위치 조정', '디바이스를 다른 부위에 대주세요', [
        {
          text: "확인",
          onPress: () => {
            setOpenRetryModal(false);
          }
        }
      ]);
    }
  }, [openRetryModal]);
  return (
    <>
      <NavigationContainer ref={navigationRef}>
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
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* 전역 모달 */}
      {platform === "android" ? (   <AlertModal
        visible={openRetryModal}
        title="디바이스 위치 조정"
        content="디바이스를 다른 부위에 대주세요"
        onClose={handleRetryConfirm}
      />) : ""}
   
    </>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <BLEProvider>
        <AppContent />
      </BLEProvider>
    </SafeAreaProvider>
  );
};

export default App;