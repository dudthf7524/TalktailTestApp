import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BLEProvider } from './Component/BLEContext';
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

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <BLEProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FFFFFF'
            }
          }}
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
    </BLEProvider>
  );
};

export default App;
