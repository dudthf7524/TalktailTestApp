import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from './header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConfirmModal from "../Component/modal/confirmModal";
import MessageModal from "../Component/modal/messageModal";
import AlertModal from "../Component/modal/alertModal";
import { orgStore } from '../store/orgStore';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const MypageChangePW = () => {
  const navigation = useNavigation<NavigationProp>();

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const { 
    loadOrg,
    org,
    changePW, 
    changePWSuccess, 
    changePWError,
    offChangePWSuccess,
    offChangePWError,
    logout 
  } = orgStore();

  useEffect(() => {
    loadOrg();
  }, []);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '기존 비밀번호를 입력해주세요.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const sendData = { 
        org_pw: formData.currentPassword, 
        org_new_pw: formData.newPassword 
      };
      await changePW(sendData);
    } catch(e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if(changePWSuccess) {
      setOpenConfirmModal(false);
      setModalContent({
        title: "비밀번호 변경 완료",
        content: "다시 로그인 해주세요."
      });
      setOpenMessageModal(true);
      offChangePWSuccess();
      const handleLogoutAndNavigate = async () => {
        try {
          await logout();
          await new Promise(resolve => setTimeout(resolve, 1500));
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } catch (error) {
          console.error('Logout failed:', error);
        }
      };
      handleLogoutAndNavigate();
    }
  }, [changePWSuccess]);

  useEffect(() => {
    if(changePWError) {
      setOpenConfirmModal(false);
      setModalContent({
        title: "오류",
        content: changePWError
      });
      setOpenAlertModal(true);
      offChangePWError();
    }
  }, [changePWError]);

  return (
    <>
      <Header title="비밀번호 변경" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>아이디</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                  value={org?.org_id}
                  editable={false}
                  placeholder="아이디"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>기존 비밀번호</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currentPassword}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, currentPassword: text }));
                  }}
                  placeholder="기존 비밀번호를 입력하세요"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry
                />
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>새 비밀번호</Text>
                <TextInput
                  style={styles.input}
                  value={formData.newPassword}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, newPassword: text }));
                  }}
                  placeholder="새 비밀번호를 입력하세요"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry
                />
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>새 비밀번호 확인</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, confirmPassword: text }));
                  }}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={() => {
                if (validateForm()) {
                  setOpenConfirmModal(true);
                }
              }}>
                <Text style={styles.submitButtonText}>변경하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <AlertModal
        visible={openAlertModal}
        title={modalContent.title}
        content={modalContent.content}
        onClose={() => setOpenAlertModal(false)}
      />
      <ConfirmModal
        visible={openConfirmModal}
        title="비밀번호 변경"
        content="비밀번호를 변경하시겠습니까?"
        confirmText="변경"
        cancelText="취소"
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleSubmit}
      />
      <MessageModal
        visible={openMessageModal}
        title={modalContent.title}
        content={modalContent.content}
        onClose={() => setOpenMessageModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#F5B75C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#262626',
  },
  submitButton: {
    backgroundColor: '#F0663F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});

export default MypageChangePW;