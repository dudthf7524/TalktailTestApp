import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Header from './header';
import { orgStore } from '../store/orgStore';
import AlertModal from './modal/alertModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import ConfirmModal from './modal/confirmModal';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MypageAgree = () => {
  const navigation = useNavigation<NavigationProp>();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const { agree, loadAgree, changeAgree, loadAgreeLoading, loadAgreeError, loadAgreeSuccess, offLoadAgreeSuccess, changeAgreeLoading, changeAgreeError, changeAgreeSuccess, offChangeAgreeSuccess } = orgStore();
  const [marketingAgreed, setMarketingAgreed] = useState(agree.agree_marketing);
  const [smsAgreed, setSmsAgreed] = useState(agree.agree_sms);
  const [emailAgreed, setEmailAgreed] = useState(agree.agree_email);
  const [pushAgreed, setPushAgreed] = useState(agree.agree_push);
  const [showMarketingFull, setShowMarketingFull] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    loadAgree();
  }, []);

  useEffect(() => {
    setMarketingAgreed(agree.agree_marketing);
    setSmsAgreed(agree.agree_sms);
    setEmailAgreed(agree.agree_email);
    setPushAgreed(agree.agree_push);
  }, [agree]);

  useEffect(() => {
    if (changeAgreeSuccess) {
      setShowAlert(true);
      offChangeAgreeSuccess();
    }
  }, [changeAgreeSuccess]);

  const handleAlertClose = () => {
    setShowAlert(false);
    offLoadAgreeSuccess();
    loadAgree();
  };

  const marketingPolicy = `마케팅 목적의 개인정보 수집 및 이용 동의

1. 수집하는 개인정보 항목

- 필수항목: 디바이스 코드, 기관명, 기관 주소, 아이디, 비밀번호, 담당자 이메일, 담당자 연락처
- 동물 등록 정보 (필수): 환자명, 생년월일, 체중, 성별, 종, 품종, 중성화 여부, 진단명
- 선택항목: 입원일자, 주치의, 과거병력

2. 수집 및 이용 목적

- Tailing 디바이스 기반 Talktail 솔루션의 안내 및 기능 업데이트
- 기관 맞춤형 마케팅 및 프로모션 정보 제공
- 기술 지원 및 서비스 개선을 위한 통계 분석
- 제품 연구 개발을 위한 비식별화된 데이터 활용

3. 보유 및 이용 기간

- 회원 탈퇴 또는 동의 철회 시까지 보유
- 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보유

4. 동의 거부 시 불이익 안내

- 동의를 거부하셔도 서비스 이용에는 제한이 없으며, 마케팅 및 프로모션 정보 제공이 제한됩니다.`;

  const handleSubmit = async () => {
    setOpenConfirmModal(false);
    await changeAgree({
      agree_marketing: marketingAgreed,
      agree_sms: smsAgreed,
      agree_email: emailAgreed,
      agree_push: pushAgreed
    });
  }
  return (
   <>
      <Header title="알림 설정" />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* 마케팅 목적 동의 */}
          <Text style={styles.sectionTitle}>
            마케팅 목적의 개인정보 수집 및 이용 동의
            <Text
              style={styles.link}
              onPress={() => setShowMarketingFull(!showMarketingFull)}
            >
              {showMarketingFull ? ' 닫기' : ' 전문보기'}
            </Text>
          </Text>
          {showMarketingFull && (
            <View style={styles.fullTextBox}>
              <Text style={styles.fullText}>
                {marketingPolicy}
              </Text>
            </View>
          )}
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, marketingAgreed && styles.checkboxChecked]}
              onPress={() => setMarketingAgreed(!marketingAgreed)}
            >
              {marketingAgreed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              (선택) 마케팅 목적의 개인정보 수집 및 이용에 동의합니다.
            </Text>
          </View>

          {/* 광고성 정보 수신 동의 */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>광고성 정보 수신 동의</Text>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, smsAgreed && styles.checkboxChecked]}
              onPress={() => setSmsAgreed(!smsAgreed)}
            >
              {smsAgreed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>(선택) SMS 수신 동의</Text>
          </View>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, emailAgreed && styles.checkboxChecked]}
              onPress={() => setEmailAgreed(!emailAgreed)}
            >
              {emailAgreed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>(선택) 이메일 수신 동의</Text>
          </View>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, pushAgreed && styles.checkboxChecked]}
              onPress={() => setPushAgreed(!pushAgreed)}
            >
              {pushAgreed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>(선택) 앱푸시 수신 동의</Text>
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
        <View style={styles.bottomButtonWrapper}>
          <TouchableOpacity style={styles.saveButton} onPress={() => setOpenConfirmModal(true)}>
            <Text style={styles.saveButtonText}>변경</Text>
          </TouchableOpacity>
        </View>
        <AlertModal
          visible={showAlert}
          title="알림"
          content="변경되었습니다."
          onClose={handleAlertClose}
        />
        <ConfirmModal
          visible={openConfirmModal}
          onCancel={() => setOpenConfirmModal(false)}
          onConfirm={handleSubmit}
          title="알림"
          content="설정을 변경하시겠습니까?"
          confirmText="변경"
          cancelText="취소"
        />
      </View>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex1: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  sectionTitle: {
    color: '#F5B75C',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  link: {
    color: '#1976D2',
    fontWeight: 'normal',
    fontSize: 14,
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  fullTextBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  fullText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#F5B75C',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#F5B75C',
    backgroundColor: '#FFF8E1',
  },
  checkmark: {
    color: '#F5B75C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  bottomButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,

  },
  saveButton: {
    backgroundColor: '#F0663F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MypageAgree;
