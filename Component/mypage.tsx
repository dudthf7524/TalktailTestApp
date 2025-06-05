import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import Header from './header';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConfirmModal from './modal/confirmModal';
import MessageModal from './modal/messageModal';
import { orgStore } from '../store/orgStore';
import { removeToken } from '../utils/token';

type RootStackParamList = {
  MypageChangeInfo: undefined;
  MypageChangePW: undefined;
  Login: undefined;
  // Add other screens as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Mypage = () => {
  const navigation = useNavigation<NavigationProp>();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const { logout } = orgStore();
  const handleLogout = async() => {
    try {
      await logout();
      await removeToken();
      setOpenMessageModal(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header title="마이페이지"/>
      <SafeAreaView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={require('../assets/images/profile_icon.png')}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.profileName}>홍길동님</Text>
              <TouchableOpacity onPress={() => setOpenConfirmModal(true)}>
                <Text style={styles.logoutText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileEmail}>hong123@gmail.com</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>나의 정보</Text>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MypageChangeInfo')}>
            <Text style={styles.menuText}>회원정보 수정</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MypageChangePW')}>
            <Text style={styles.menuText}>비밀번호 변경</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MypageAgree')}>
            <Text style={styles.menuText}>알림 설정</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow}/>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.supportTitle}>고객지원</Text>
        <View style={styles.supportSection}>
          <Text style={styles.supportEmail}>talktail@creamoff.co.kr</Text>
          <Text style={styles.supportPhone}>010-4898-5955</Text>
        </View>
      </SafeAreaView>
      <ConfirmModal
        visible={openConfirmModal}
        title="로그아웃"
        content="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleLogout}
      />
      <MessageModal
        visible={openMessageModal}
        title="로그아웃 완료"
        content="로그인 화면으로 이동됩니다."
        onClose={() => setOpenMessageModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
    width: '90%',
    maxWidth: 400,
  },
  profileImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
    color: "black",
  },
  logoutText: {
    fontSize: 13,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
    width: '90%',
    maxWidth: 400,
  },
  sectionTitle: {
    color: '#F0663F',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    width: '90%',
    maxWidth: 400,
  },
  menuSection: {
    marginBottom: 8,
    width: '90%',
    maxWidth: 400,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 16,
    color: 'black',
  },
  menuArrow: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  supportTitle: {
    color: '#F0663F',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    width: '90%',
    maxWidth: 400,
  },
  supportSection: {
    marginBottom: 24,
    width: '90%',
    maxWidth: 400,
  },
  supportEmail: {
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
  },
  supportPhone: {
    fontSize: 15,
    color: '#222',
  },
  logout_btn: {
    width: '90%',
    maxWidth: 400,
    height: 35,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0663F",
    borderRadius: 6,
    marginTop: 60,
    marginBottom: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logout_btn_text: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#F0663F",
  }
});

export default Mypage; 