import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platformp,
} from 'react-native';
import { dataStore } from '../store/dataStore';
import AlertModal from './modal/alertModal';
import ConfirmModal from './modal/confirmModal';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import RNFS from 'react-native-fs';
dayjs.extend(customParseFormat);

const RecordLists = ({selectedDate, selectedPetCode, label}: {selectedDate: string, selectedPetCode: string, label: string}) => {
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');
  const [confirmModalProps, setConfirmModalProps] = useState({
    title: '',
    content: '',
    confirmText: '',
    onConfirm: () => {},
  });
  const { 
    csvLists, 
    downCSV, 
    downCsvSuccess, 
    downCsvError,
    offDownCsvSuccess,
    offDownCsvError,
    deleteCSV,
    deleteCsvError,
    deleteCsvSuccess,
    offDeleteCsvSuccess,
    offDeleteCsvError,
  } = dataStore();


  const date_time = csvLists.map((list)=> list.file_name.split("_")[2].split(".")[0].split("-"));
  const dates = date_time.map((list)=> list[0]);
  const times = date_time.map((list)=> list[1]);
  const formattedTimes = times.map(time => 
    dayjs(time, "HHmmss").format("HH:mm:ss")
  );

  const handleDownload = async(list: {file_name: string}) => {
    try {
      await downCSV(list.file_name, label);
    } catch(e) {
      console.error(e);
      setAlertTitle("다운로드 실패");
      setAlertContent("파일 저장 중 오류가 발생했습니다.");
      setOpenAlertModal(true);
    }
  };

  const handleDelete = async (fileName : string) => {
    try {
      await deleteCSV(fileName);
    } catch(e) {
      console.error(e);
    }
  };

  const showDeleteConfirm = (fileName: string) => {
    setSelectedFile(fileName);
    setConfirmModalProps({
      title: "기록 삭제",
      content: "정말로 이 기록을 삭제하시겠습니까?",
      confirmText: "삭제",
      onConfirm: () => handleDelete(fileName),
    });
    setOpenConfirmModal(true);
  };

  const showDownloadConfirm = (list) => {
    setConfirmModalProps({
      title: "다운로드",
      content: "이 기록을 다운로드 하시겠습니까?",
      confirmText: "다운로드",
      onConfirm: () => handleDownload(list),
    });
    setOpenConfirmModal(true);
  };

  useEffect(() => {
    if (downCsvSuccess) {
      setAlertTitle("다운로드 완료");
      setAlertContent("Downloads 폴더에서 확인하세요.");
      setOpenAlertModal(true);
      offDownCsvSuccess();
    }
  }, [downCsvSuccess]);

  useEffect(() => {
    if (downCsvError) {
      setAlertTitle("다운로드 실패");
      setAlertContent(downCsvError);
      setOpenAlertModal(true);
      offDownCsvError();
    }
  }, [downCsvError]);

  useEffect(() => {
    if (deleteCsvSuccess) {
      setAlertTitle("삭제 완료");
      setAlertContent("기록이 삭제되었습니다.");
      setOpenAlertModal(true);
      setOpenConfirmModal(false);
      dataStore.getState().loadData(selectedDate, selectedPetCode);
      offDeleteCsvSuccess();
    }
  }, [deleteCsvSuccess]);

  useEffect(() => {
    if (deleteCsvError) {
      setAlertTitle("삭제 실패");
      setAlertContent(deleteCsvError);
      setOpenAlertModal(true);
      setOpenConfirmModal(false);
      offDeleteCsvError();
    }
  }, [deleteCsvError]);

  return (
    <>
    <ScrollView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.listContainer}>
          {csvLists.map((list, index) => (
            <View
              key={index}
              style={styles.listItem}
            >
              <View style={styles.listInfo}>
                <Text style={styles.listDate}>수집 시작 일시 : {dayjs(dates[index]).format('YYYY-MM-DD')} {formattedTimes[index]}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => showDeleteConfirm(list.file_name)}
                  >
                    <Image source={require("../assets/images/btn_delete.png")} style={styles.actionIcon}/>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => showDownloadConfirm(list)}
                  >
                    <Image source={require("../assets/images/download_btn.png")} style={styles.actionIcon}/>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
    <AlertModal
      visible={openAlertModal}
      onClose={() => setOpenAlertModal(false)}
      title={alertTitle}
      content={alertContent}
    />
    <ConfirmModal
      visible={openConfirmModal}
      onCancel={() => setOpenConfirmModal(false)}
      onConfirm={() => {
        setOpenConfirmModal(false);
        confirmModalProps.onConfirm();
      }}
      title={confirmModalProps.title}
      confirmText={confirmModalProps.confirmText}
      cancelText="취소"
      content={confirmModalProps.content}
    />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  scrollView: {
    width: '100%',
    height: 'auto',
    overflow: 'scroll',
  },
  listContainer: {
    width: '100%',
    height: '100%',
    padding: 16,
  },
  listItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    height: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  listDate: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
});

export default RecordLists;