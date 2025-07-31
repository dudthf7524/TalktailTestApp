import React, { useState, useEffect } from 'react';
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
import AlertModal from '../Component/modal/alertModal';
import ConfirmModal from "../Component/modal/confirmModal";
import MessageModal from "../Component/modal/messageModal";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { orgStore } from '../store/orgStore';


type RootStackParamList = {
  Login: undefined;
  Sign: undefined;
  // ... other screens
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
  deviceCode: string;
  org_name: string;
  org_address: string;
  org_id: string;
  org_pw: string;
  confirmPassword: string;
  org_phone: string;
  org_email: string;
};

type FormErrors = {
  [key in keyof FormData]?: string;
};

const MypageChangeInfo = () => {
  const [formData, setFormData] = useState<FormData>({
    deviceCode: '',
    org_name: '',
    org_address: '',
    org_id: '',
    org_pw: '',
    confirmPassword: '',
    org_phone: '',
    org_email: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const {
    org,
    loadOrg,
    changeInfo,
    changeInfoError,
    changeInfoSuccess,
    offChangeInfoSuccess,
    offChangeInfoError
  } = orgStore();

  useEffect(() => {
    loadOrg();
  }, []);

  useEffect(() => {
    if (org) {
      setFormData({
        deviceCode: org.device_code || '',
        org_name: org.org_name || '',
        org_address: org.org_address || '',
        org_id: org.org_id || '',
        org_pw: '',
        confirmPassword: '',
        org_phone: org.org_phone || '',
        org_email: org.org_email || ''
      });
    }
  }, [org]);

  useEffect(() => {
    if (changeInfoSuccess) {
      setOpenConfirmModal(false);
      setModalContent({
        title: "정보 수정",
        content: "등록된 정보가 수정되었습니다."
      });
      setOpenMessageModal(true);
      offChangeInfoSuccess();
    }
  }, [changeInfoSuccess]);

  useEffect(() => {
    if (changeInfoError) {
      setOpenConfirmModal(false);
      setModalContent({
        title: "오류",
        content: changeInfoError
      });
      setOpenAlertModal(true);
      offChangeInfoError();
    }
  }, [changeInfoError]);

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return text;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.org_name) {
      newErrors.org_name = '기관명을 입력해주세요.';
    }

    if (!formData.org_address) {
      newErrors.org_address = '기관 주소를 입력해주세요.';
    }
    if (!formData.org_phone) {
      newErrors.org_phone = '전화번호를 입력해주세요.';
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.org_phone)) {
      newErrors.org_phone = '올바른 전화번호 형식이 아닙니다.';
    }
    if (!formData.org_email) {
      newErrors.org_email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.org_email)) {
      newErrors.org_email = '올바른 이메일 형식이 아닙니다.';
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
        org_name: formData.org_name,
        org_address: formData.org_address,
        org_phone: formData.org_phone,
        org_email: formData.org_email
      };
      await changeInfo(sendData);
    } catch (error) {
      console.error("error : ", error);
    }
  };

  return (
    <>
      <Header title="정보 수정" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.deviceLabel}>디바이스 코드</Text>
                <View style={styles.idContainer}>
                  <TextInput
                    style={[styles.input, styles.idInput, { backgroundColor: '#f5f5f5' }]}
                    value={formData.deviceCode}
                    editable={false}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, deviceCode: text }));
                    }}
                    placeholder="디바이스 코드를 입력하세요"
                    placeholderTextColor="#999999"

                  />
                </View>
                {errors.deviceCode && (
                  <Text style={styles.errorText}>{errors.deviceCode}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>기관명</Text>
                <TextInput
                  style={styles.input}
                  value={formData.org_name}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, org_name: text }));
                    setErrors(prev => ({ ...prev, org_name: undefined }));
                  }}
                  placeholder="기관 이름을 입력하세요"
                  placeholderTextColor="#999999"

                />
                {errors.org_name && (
                  <Text style={styles.errorText}>{errors.org_name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>기관 주소</Text>
                <TextInput
                  style={styles.input}
                  value={formData.org_address}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, org_address: text }));
                    setErrors(prev => ({ ...prev, org_address: undefined }));
                  }}
                  placeholder="기관 주소를 입력하세요"
                  placeholderTextColor="#999999"

                />
                {errors.org_address && (
                  <Text style={styles.errorText}>{errors.org_address}</Text>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>담당자 전화번호</Text>
                <TextInput
                  style={styles.input}
                  value={formData.org_phone}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    setFormData(prev => ({ ...prev, org_phone: formatted }));
                    setErrors(prev => ({ ...prev, org_phone: undefined }));
                  }}
                  placeholder="010-0000-0000"
                  placeholderTextColor="#999999"

                  keyboardType="phone-pad"
                  maxLength={13}
                />
                {errors.org_phone && (
                  <Text style={styles.errorText}>{errors.org_phone}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>담당자 이메일</Text>
                <TextInput
                  style={styles.input}
                  value={formData.org_email}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, org_email: text }));
                    setErrors(prev => ({ ...prev, org_email: undefined }));
                  }}
                  placeholder="이메일을 입력하세요"
                  placeholderTextColor="#999999"

                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.org_email && (
                  <Text style={styles.errorText}>{errors.org_email}</Text>
                )}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={() => {
                setOpenConfirmModal(true);
              }}>
                <Text style={styles.submitButtonText}>정보수정</Text>
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
        title="정보 수정"
        content="정보를 수정하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleSubmit}
      />
      <MessageModal
        visible={openMessageModal}
        title="정보 수정"
        content="등록된 정보가 수정되었습니다."
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
  deviceLabel: {
    fontSize: 20,
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
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idInput: {
    flex: 1,
    marginRight: 8,
  },
  checkButton: {
    backgroundColor: '#F0663F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
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
  submitButton2: {
    backgroundColor: '#F0663F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  }
});

export default MypageChangeInfo; 