import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import MessageModal from './modal/messageModal';
import AlertModal from './modal/alertModal';
import { deviceStore } from '../store/deviceStore';
import Orientation from 'react-native-orientation-locker';
import TermsModal from './modal/termsModal';
import { getToken } from '../utils/storage';

type RootStackParamList = {
  Login: undefined;
  SignUp: {
    agreementInfo: {
      marketingAgreed: boolean;
      smsAgreed: boolean;
      emailAgreed: boolean;
      pushAgreed: boolean;
    };
  };
  Dashboard: undefined;
  RegisterPet: undefined;
  PetLists: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FormData = {
  id: string;
  password: string;
};

type FormErrors = {
  [key in keyof FormData]?: string;
};

const Login = ({ navigation }: { navigation: NavigationProp }) => {
  const [formData, setFormData] = useState<FormData>({
    id: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [openMessageModal, setOpenMessageModal] = useState<boolean>(false);
  const [openAlertModal, setOpenAlertModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ title: string, content: string }>({
    title: '',
    content: ''
  });
  const [openTermsModal, setOpenTermsModal] = useState<boolean>(false);
  const [termsType, setTermsType] = useState<'privacy' | 'terms' | 'agreement'>('privacy');
  const {
    login,
    loginSuccess,
    loginError,
    offLoginSuccess,
    offLoginError
  } = deviceStore();

  // useFocusEffect로 변경
  useFocusEffect(
    React.useCallback(() => {
      const checkToken = async () => {
        const token = await getToken();
        
        if (token && token.device_code) {
          setModalContent({
            title: "로그인 정보 확인",
            content: "로그아웃 후 로그인이 가능합니다."
          });
          setOpenMessageModal(true);
          setTimeout(() => {
            navigation.navigate('PetLists');
          }, 1500);
        }
      };
      checkToken();
    }, [])
  );

  useEffect(() => {
    if (loginSuccess) {
      setModalContent({
        title: "로그인 성공",
        content: "로그인이 성공적으로 완료되었습니다."
      });
      setOpenMessageModal(true);
      offLoginSuccess();
      setTimeout(() => {
        navigation.navigate('PetLists');
      }, 2000);
    }
  }, [loginSuccess]);

  useEffect(() => {
    if (loginError) {
      setModalContent({
        title: "안내",
        content: loginError
      });
      setOpenAlertModal(true);
      offLoginError();
    }
  }, [loginError]);

  useEffect(() => {
    Orientation.lockToPortrait();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.id) {
      newErrors.id = '아이디를 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignUpPress = () => {
    setTermsType('agreement');
    setOpenTermsModal(true);
  };
  
  const handleTermsAgree = (agreementInfo: {
    marketingAgreed: boolean;
    smsAgreed: boolean;
    emailAgreed: boolean;
    pushAgreed: boolean;
  }) => {
    setOpenTermsModal(false);
    navigation.navigate('SignUp', {
      agreementInfo
    });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <SafeAreaView style={styles.content}>
            <View style={styles.header}>
              <Image source={require('../assets/images/talkTail_logo.png')} style={styles.logo} />
              <Text style={styles.subtitle}>반려동물은 Tail로 소통하고</Text>
              <Text style={styles.subtitle}>우리는 "Talktail"로 소통합니다.</Text>
            </View>

            <SafeAreaView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>아이디</Text>
                <TextInput
                  style={styles.input}
                  value={formData.id}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, id: text }));
                    setErrors(prev => ({ ...prev, id: undefined }));
                  }}
                  placeholder="아이디를 입력하세요"
                  placeholderTextColor="#999999"
                />
                {errors.id && (
                  <Text style={styles.errorText}>{errors.id}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, password: text }));
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#999999"
                  secureTextEntry
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>로그인</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUpPress}
              >
                <Text style={styles.signUpButtonText}>회원가입</Text>
              </TouchableOpacity>

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setTermsType('privacy');
                    setOpenTermsModal(true);
                  }}
                >
                  <Text style={styles.termsText}>개인정보 처리방침</Text>
                </TouchableOpacity>
                <Text style={styles.termsDivider}>|</Text>
                <TouchableOpacity
                  onPress={() => {
                    setTermsType('terms');
                    setOpenTermsModal(true);
                  }}
                >
                  <Text style={styles.termsText}>이용약관</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <MessageModal
        visible={openMessageModal}
        title={modalContent.title}
        content={modalContent.content}
        onClose={() => setOpenMessageModal(false)}
      />
      <AlertModal
        visible={openAlertModal}
        title={modalContent.title}
        content={modalContent.content}
        onClose={() => setOpenAlertModal(false)}
      />
      <TermsModal
        visible={openTermsModal}
        type={termsType}
        onClose={() => setOpenTermsModal(false)}
        onAgree={handleTermsAgree}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  logo: {
    width: '80%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#F5B75C',
    textAlign: 'center',
  },
  form: {
    width: '90%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#F0663F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
    width: '100%',
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
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0663F',
    width: '100%',
  },
  signUpButtonText: {
    color: '#F0663F',
    fontSize: 18,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  termsDivider: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 10,
  },
});

export default Login; 