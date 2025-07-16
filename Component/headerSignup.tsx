import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { orgStore } from '../store/orgStore';
import { deviceStore } from '../store/deviceStore';
import { SafeAreaView } from 'react-native-safe-area-context';
interface HeaderProps {
  title: string;
}


const HeaderSignup: React.FC<HeaderProps> = ({ title }) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = orgStore();
  const { offCheckSuccess } = deviceStore();
  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <SafeAreaView edges={['top',]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton
          ]}
          onPress={() => {
            offCheckSuccess();
            navigation.goBack()
          }}
        >
          <Image
            source={require('../assets/images/arrow_left.png')}
            style={styles.backButtonImage}
          />
        </Pressable>
        <Text style={styles.title}>{title}</Text>

        {/* 메뉴바 모달 */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.menuBarContainer}>
            <Pressable style={styles.menuBar} onPress={handleLogout}>
              <Text style={styles.menuText}>로그아웃</Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0663F',
    position: 'relative',
    paddingLeft: 16,
    paddingRight: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  pressedButton: {
    opacity: 0.7,
  },
  backButtonImage: {
    width: 29.4,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFF',
    position: 'absolute',
    left: '45%',
    top: '35%',
    // transform: [{ translateX: -100 }],
  },
  right_btn_text: {
    fontSize: 40,
    fontWeight: '400',
    color: '#fff',
  },
  menuBarContainer: {
    position: 'absolute',
    top: 72,
    right: 16,
    zIndex: 100,
    width: '100%',
    height: '100%',
  },
  menuBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  rightButton: {
    padding: 8,
  },
});

export default HeaderSignup; 