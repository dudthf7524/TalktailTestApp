import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Header from './header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { userStore } from '../store/userStore';
import { getToken } from '../utils/storage';
import AlertModal from './modal/alertModal';
import { SafeAreaView } from 'react-native-safe-area-context';

type PetData = {
  name: string;
  birth: Date;
  breed: string;
  gender: boolean;
  neutered: boolean;
  disease: string;
  weight: string;
  vet: string;
  history: string;
  species: string;
  admission: Date;
};

const RegisterPet = ({ navigation }) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const { registerPet, registerLoading, registerSuccess, registerError, offRegisterSuccess, offRegisterError } = userStore();
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [formData, setFormData] = useState<PetData>({
    name: '',
    birth: new Date(2020, 0, 1),
    breed: '',
    gender: true,
    neutered: false,
    disease: '',
    weight: '',
    vet: '',
    history: '',
    species: '',
    admission: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'birth' | 'admission'>('birth');

  useEffect(() => {
    if (registerSuccess) {
      setModalContent({
        title: '등록 완료',
        content: '동물정보가 등록되었습니다.'
      });
      setOpenAlertModal(true);
      setTimeout(() => {
        navigation.navigate('PetLists');
      }, 1500);
    }
    offRegisterSuccess();
  }, [registerSuccess]);

  useEffect(() => {
    if (registerError) {
      setModalContent({
        title: '등록 실패',
        content: registerError
      });
      setOpenAlertModal(true);
    }
    offRegisterError();
  }, [registerError]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerType === 'birth') {
        setFormData(prev => ({ ...prev, birth: selectedDate }));
      } else {
        setFormData(prev => ({ ...prev, admission: selectedDate }));
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  type FormErrors = {
    [key in keyof PetData]?: string;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name) {
      newErrors.name = '환자명을 입력해주세요.';
    }

    if (!formData.birth) {
      newErrors.birth = '생년월일을 입력해주세요.';
    }

    if (!formData.species) {
      newErrors.species = '종을 입력해주세요.';
    }

    if (!formData.breed) {
      newErrors.breed = '품종을 입력해주세요.';
    }

    if (!formData.weight) {
      newErrors.weight = '체중을 입력해주세요.';
    }

    if (!formData.vet) {
      newErrors.vet = '주치의를 입력해주세요.';
    }

    if (!formData.disease) {
      newErrors.disease = '진단명을 입력해주세요.';
    }

    if (!formData.admission) {
      newErrors.admission = '입원일을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const token = await getToken();
      if (!token) {
        setModalContent({
          title: '오류',
          content: '로그인해주세요.'
        });
        setOpenAlertModal(true);
        navigation.navigate('Login');
        return;
      }

      const { device_code } = token;

      const petData = {
        name: formData.name,
        birth: formData.birth.getFullYear().toString() + '-' +
          (formData.birth.getMonth() + 1).toString().padStart(2, '0') + '-' +
          formData.birth.getDate().toString().padStart(2, '0'),
        admission: formData.admission.getFullYear().toString() + '-' +
          (formData.admission.getMonth() + 1).toString().padStart(2, '0') + '-' +
          formData.admission.getDate().toString().padStart(2, '0'),
        breed: formData.breed,
        gender: formData.gender,
        neutered: formData.neutered,
        disease: formData.disease,
        history: formData.history,
        weight: formData.weight,
        vet: formData.vet,
        species: formData.species, 
        device_code
      };

      await registerPet(petData);
    } catch (error) {
      console.error('Error registering pet:', error);
    }
  };

  return (
    <>
      <Header title="동물 정보 등록" />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>환자명</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, name: text }));
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="환자명을 입력하세요"
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>생년월일</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDatePickerType('birth');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(formData.birth)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && datePickerType === 'birth' && (
                  <DateTimePicker
                    value={formData.birth}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      handleDateChange(event, selectedDate);
                      if (errors.birth) {
                        setErrors(prev => ({ ...prev, birth: undefined }));
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
                {errors.birth && (
                  <Text style={styles.errorText}>{errors.birth}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>체중</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, weight: text }));
                    if (errors.weight) {
                      setErrors(prev => ({ ...prev, weight: undefined }));
                    }
                  }}
                  placeholder="체중을 입력하세요"
                />
                {errors.weight && (
                  <Text style={styles.errorText}>{errors.weight}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>종</Text>
                <TextInput
                  style={styles.input}
                  value={formData.species}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, species: text }));
                    if (errors.species) {
                      setErrors(prev => ({ ...prev, species: undefined }));
                    }
                  }}
                  placeholder="종을 입력하세요(ex : 개, 고양이)"
                />
                {errors.species && (
                  <Text style={styles.errorText}>{errors.species}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>품종</Text>
                <TextInput
                  style={styles.input}
                  value={formData.breed}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, breed: text }));
                    if (errors.breed) {
                      setErrors(prev => ({ ...prev, breed: undefined }));
                    }
                  }}
                  placeholder="품종을 입력하세요(ex : 말티즈, 푸들)"
                />
                {errors.breed && (
                  <Text style={styles.errorText}>{errors.breed}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>성별</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.gender && styles.radioButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, gender: true }))}
                  >
                    {formData.gender ? <Image source={require("../assets/images/gender_white_male.png")} style={styles.gender_icon}/> : <Image source={require("../assets/images/gender_black_male.png")} style={styles.gender_icon}/>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      !formData.gender && styles.radioButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, gender: false }))}
                  >
                    {!formData.gender ? <Image source={require("../assets/images/gender_white_female.png")} style={styles.gender_icon}/> : <Image source={require("../assets/images/gender_black_female.png")} style={styles.gender_icon}/>}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>중성화 여부</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.neutered && styles.radioButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, neutered: true }))}
                  >
                    <Text style={[
                      styles.radioButtonText,
                      formData.neutered && styles.radioButtonTextSelected,
                    ]}>O</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      !formData.neutered && styles.radioButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, neutered: false }))}
                  >
                    <Text style={[
                      styles.radioButtonText,
                      !formData.neutered && styles.radioButtonTextSelected,
                    ]}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>

             

              <View style={styles.inputGroup}>
                <Text style={styles.label}>입원일</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDatePickerType('admission');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(formData.admission)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && datePickerType === 'admission' && (
                  <DateTimePicker
                    value={formData.admission}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      handleDateChange(event, selectedDate);
                      if (errors.admission) {
                        setErrors(prev => ({ ...prev, admission: undefined }));
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
                {errors.admission && (
                  <Text style={styles.errorText}>{errors.admission}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>주치의</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vet}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, vet: text }));
                    if (errors.vet) {
                      setErrors(prev => ({ ...prev, vet: undefined }));
                    }
                  }}
                  placeholder="주치의를 입력하세요"
                />
                {errors.vet && (
                  <Text style={styles.errorText}>{errors.vet}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>진단명</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.disease}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, disease: text }));
                    if (errors.disease) {
                      setErrors(prev => ({ ...prev, disease: undefined }));
                    }
                  }}
                  placeholder="진단명을 입력하세요"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.disease && (
                  <Text style={styles.errorText}>{errors.disease}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>과거병력</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.history}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, history: text }))}
                  placeholder="과거병력을 입력하세요"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, registerLoading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={registerLoading}
              >
                <Text style={styles.submitButtonText}>
                  {registerLoading ? '등록 중...' : '등록하기'}
                </Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#262626',
  },
  dropdownButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#262626',
    textAlign: 'left',
  },
  dropdown: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  dropdownRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownRowText: {
    fontSize: 16,
    color: '#262626',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  gender_icon: {
    width: 20,
    height: 20,
  },
  radioButtonSelected: {
    borderColor: '#F0663F',
    backgroundColor: '#F0663F',
  },
  radioButtonText: {
    fontSize: 16,
    color: '#262626',
  },
  radioButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#262626',
    height: 100,
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
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
});

export default RegisterPet; 