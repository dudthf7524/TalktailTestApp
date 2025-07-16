import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Header from './header';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConfirmModal from './modal/confirmModal';
import MessageModal from './modal/messageModal';
import PasswordConfirmModal from './modal/passwordConfirmModal';
import { orgStore } from '../store/orgStore';
import { removeToken } from '../utils/token';
import axios from 'axios';
import { API_URL } from './constant/contants';
import { getToken } from '../utils/storage';

type RootStackParamList = {
  MypageChangeInfo: undefined;
  MypageChangePW: undefined;
  MypageAgree: undefined;
  Login: undefined;
  Board: undefined;
  MypageOut: undefined;
  CustomerService: undefined;
  BatteryTest: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Mypage = () => {
  const navigation = useNavigation<NavigationProp>();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { org, logout, loadOrg, verifyPassword } = orgStore();

  useEffect(() => {
    loadOrg();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      await removeToken();
      setOpenMessageModal(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    console.log(password)
    const token = await getToken();
    console.log(token)

    try {
      const response = await axios.post(`${API_URL}/user/check/password`, { token, password })
      console.log(response.status)
      if (response.status === 200) {
        console.log(response.data.message)
        setPasswordError('');
        navigation.navigate('MypageChangeInfo')
        setOpenPasswordModal(false)
      } else {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error(error);
      setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Header title="마이페이지" />
      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={require('../assets/images/profile_icon.png')}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.profileName}>{org.org_name}님</Text>
            </View>
            <Text style={styles.profileEmail}>{org.org_email}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View>
          <Text style={styles.sectionTitle}>정보</Text>
        </View>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setOpenPasswordModal(true)}>
            <Text style={styles.menuText}>회원정보 수정</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MypageChangePW')}>
            <Text style={styles.menuText}>비밀번호 변경</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Board')}>
            <Text style={styles.menuText}>공지 사항</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BatteryTest')}>
            <Text style={styles.menuText}>배터리 표시</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.divider} />
        <View>
          <Text style={styles.sectionTitle}>설정</Text>
        </View>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MypageAgree')}>
            <Text style={styles.menuText}>수신 동의 설정</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MypageOut')}>
            <Text style={styles.menuText}>개인 설정</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CustomerService')}>
            <Text style={styles.menuText}>고객센터</Text>
            <Image source={require('../assets/images/right_btn.png')} style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView >
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
      <PasswordConfirmModal
        visible={openPasswordModal}
        title="비밀번호 확인"
        content="비밀번호를 입력해주세요."
        confirmText="확인"
        cancelText="취소"
        onClose={() => {
          setOpenPasswordModal(false);
          setPasswordError('');
        }}
        onConfirm={handlePasswordConfirm}
        errorMessage={passwordError}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
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
  },
  sectionTitle: {
    color: '#F0663F',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  menuSection: {
    marginBottom: 8,
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
  },
  supportSection: {
    marginBottom: 24,
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
    width: "50%",
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
  },
  businessInfoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#222',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Mypage; 