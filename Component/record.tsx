import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { userStore } from '../store/userStore';
import Header from './header';
import RecordLists from './recordLists';  
import { dataStore } from '../store/dataStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Record: undefined;
  Dashboard: {
    selectedPet: {
      name: string;
      gender: boolean;
      birth: string;
      breed: string;
      isNeutered: boolean;
      disease: string;
    };
  };
  ConnectBle: {
    selectedPet: {
      device_code: string;
      pet_code: string;
      name: string;
      gender: boolean;
      birth: string;
      breed: string;
      isNeutered: boolean;
      disease: string;
    };
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Record = () => {
  const navigation = useNavigation<NavigationProp>();
  const { pets, fetchPets } = userStore();    
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const { loadData } = dataStore();
  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    loadData(formSendDate(selectedDate), selectedPet);
  }, [selectedPet, selectedDate])

  const nameLists = pets.map((pet) => ({
    label: `${pet.name}(${pet.birth})`,
    value: pet.pet_code
  }));
  console.log("pets", pets)
  console.log("nameLists", nameLists)
  const formatDate = (date: Date) => {
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    // return `${year}-${month}-${day}`;
    return date.toISOString().split('T')[0];
  };

  const formSendDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <>
      <Header title="기록"/>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>날짜</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>동물</Text>
              <SelectDropdown
                data={nameLists}
                onSelect={(selectedItem) => {
                  setSelectedPet(selectedItem.value);
                  setSelectedLabel(selectedItem.label);
                }}
                defaultButtonText="동물을 선택하세요"
                buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                rowTextForSelection={(item) => item.label}
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
                dropdownStyle={styles.dropdown}
                rowStyle={styles.dropdownRow}
                rowTextStyle={styles.dropdownRowText}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
      <RecordLists selectedDate={formSendDate(selectedDate)} selectedPetCode={selectedPet} label={selectedLabel}/>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  dateButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'left',
  },
  dropdown: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownRow: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownRowText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default Record;
