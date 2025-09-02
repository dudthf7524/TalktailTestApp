import React from 'react';
import { View, Pressable, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  Dashboard: undefined;
  ConnectBle: undefined;
  PetLists: undefined;
  Record: undefined;
  LocalFiles: undefined;
  Mypage: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NavigationBar: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { marginBottom: insets.bottom }]}>
      <Pressable 
        style={styles.button}
        onPress={() => navigation.navigate('PetLists')}
      >
        {/* <Text style={styles.buttonText}>반려동물목록</Text> */}
        <Image source={require("../assets/images/nav_icon1.png")} style={styles.icon_img} />
      </Pressable>
      <Pressable 
        style={styles.button}
        onPress={() => navigation.navigate('Record')}
      >
        {/* <Text style={styles.buttonText}>데이터목록</Text> */}
        <Image source={require("../assets/images/nav_icon2.png")} style={styles.icon_img} />
      </Pressable>
      <Pressable 
        style={styles.button}
        onPress={() => navigation.navigate('LocalFiles')}
      >
        <Text style={styles.buttonText}>로컬파일</Text>
      </Pressable>
      <Pressable 
        style={styles.button}
        onPress={() => navigation.navigate('Mypage')}
      >
        {/* <Text style={styles.buttonText}>마이페이지</Text> */}
        <Image source={require("../assets/images/nav_icon3.png")} style={styles.icon_img} />
      </Pressable>
     
      {/* <Pressable 
        style={styles.button}
        onPress={() => navigation.navigate('PetList')}
      >
        <Text style={styles.buttonText}></Text>
      </Pressable>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}></Text>
      </Pressable>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}></Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
  },
  button: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    color: '#666',
  },
  icon_img: {
    width: 40,
    height: 40,
  }
});

export default NavigationBar; 