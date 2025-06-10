import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Header from './header';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Mypage: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CustomerService = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleEmailPress = () => {
    Linking.openURL('mailto:talktail@creamoff.co.kr');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:010-4898-5955');
  };

  return (
    <>
      <Header title="고객센터" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상담문의</Text>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Text style={styles.contactLabel}>이메일</Text>
              <Text style={styles.contactValue}>talktail@creamoff.co.kr</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Text style={styles.contactLabel}>전화번호</Text>
              <Text style={styles.contactValue}>010-4898-5955</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Text style={styles.contactLabel}>운영시간</Text>
              <Text style={styles.contactValue}>09:00 - 18:00 (주말 및 공휴일 휴무)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>사업자 정보</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>대표</Text>
              <Text style={styles.infoValue}>권도혁</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>사업자등록번호</Text>
              <Text style={styles.infoValue}>514-87-03021</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>통신판매업</Text>
              <Text style={styles.infoValue}>2025-경북경산-0073</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>경상북도 경산시 삼풍로 27, 309호</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5B75C',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactLabel: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  contactValue: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    width: 120,
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
});

export default CustomerService; 