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
  Image
} from 'react-native';
import Header from './header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { userStore } from '../store/userStore';
import { getToken } from '../utils/storage';
import MessageModal from './modal/messageModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AlertModal from './modal/alertModal';
import ConfirmModal from './modal/confirmModal';

type RootStackParamList = {
  PetLists: undefined;
  EditPet: { pet: any };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const EditPet = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { pet } = route.params as { pet: any };
  const { 
    updatePet, 
    updateLoading,
    updateSuccess, 
    updateError,
    offUpdateSuccess,
    offUpdateError
  } = userStore();
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [formData, setFormData] = useState<PetData>({
    name: pet.name,
    birth: new Date(pet.birth),
    breed: pet.breed,
    gender: pet.gender,
    neutered: pet.neutered,
    disease: pet.disease || '',
    weight: pet.weight || '',
    vet: pet.vet || '',
    history: pet.history || '',
    species: pet.species || '',
    admission: pet.admission ? new Date(pet.admission) : new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'birth' | 'admission'>('birth');
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  useEffect(() => {
    if (updateSuccess) {
      setOpenConfirmModal(false);
      setModalContent({
        title: "동물 수정 완료",
        content: "등록된 동물의 정보가 수정되었습니다."
      });
      setOpenMessageModal(true);
      offUpdateSuccess();
      setTimeout(() => {
        navigation.navigate('PetLists');
      }, 1500);
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      setOpenConfirmModal(false);
      setModalContent({
        title: "오류",
        content: updateError
      });
      setOpenAlertModal(true);
      offUpdateError();
    }
  }, [updateError]);

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

  const handleUpdate = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setModalContent({
          title: "오류",
          content: "로그인해주세요."
        });
        setOpenAlertModal(true);
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
        return;
      }

      const { device_code } = token;
      if (!device_code) {
        setModalContent({
          title: "오류",
          content: "디바이스 코드를 찾을 수 없습니다. 다시 로그인해주세요."
        });
        setOpenAlertModal(true);
        return;
      }

      const petData = {
        ...formData,
        birth: formData.birth.getFullYear().toString() + '-' +
               (formData.birth.getMonth() + 1).toString().padStart(2, '0') + '-' +
               formData.birth.getDate().toString().padStart(2, '0'),
        admission: formData.admission.getFullYear().toString() + '-' +
                  (formData.admission.getMonth() + 1).toString().padStart(2, '0') + '-' +
                  formData.admission.getDate().toString().padStart(2, '0'),
        device_code,
        pet_code: pet.pet_code
      };

      await updatePet(petData);
    } catch (error) {
      console.error('Error updating pet:', error);
      setModalContent({
        title: "수정 실패",
        content: "동물 정보 수정에 실패했습니다. 다시 시도해주세요."
      });
      setOpenAlertModal(true);
    }
  };

  return (
    <>
      <Header title="반려동물 정보 수정" />
      <SafeAreaView style={styles.container}>
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
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="환자명을 입력하세요"
                  placeholderTextColor="#999999"
                />
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
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>체중</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                  placeholder="체중을 입력하세요"
                  placeholderTextColor="#999999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>종</Text>
                <TextInput
                  style={styles.input}
                  value={formData.species}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, species: text }))}
                  placeholder="종을 입력하세요(ex : 개, 고양이)"
                  placeholderTextColor="#999999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>품종</Text>
                <TextInput
                  style={styles.input}
                  value={formData.breed}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, breed: text }))}
                  placeholder="품종을 입력하세요(ex : 말티즈, 푸들)"
                  placeholderTextColor="#999999"
                />
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
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>주치의</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vet}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, vet: text }))}
                  placeholder="주치의를 입력하세요"
                  placeholderTextColor="#999999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>진단명</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.disease}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, disease: text }))}
                  placeholder="진단명을 입력하세요"
                  placeholderTextColor="#999999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>과거병력</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.history}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, history: text }))}
                  placeholder="과거병력을 입력하세요"
                  placeholderTextColor="#999999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, updateLoading && styles.submitButtonDisabled]} 
                onPress={() => setOpenConfirmModal(true)}
                disabled={updateLoading}
              >
                <Text style={styles.submitButtonText}>
                  {updateLoading ? '수정 중...' : '수정하기'}
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
      <ConfirmModal
        visible={openConfirmModal}
        title="동물 정보 수정"
        content="등록된 동물의 정보를 수정하시겠습니까?"
        confirmText="수정"
        cancelText="취소"
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleUpdate}
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

export default EditPet; 