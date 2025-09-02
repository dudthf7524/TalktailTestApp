import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from './header';
import NavigationBar from './navigationBar';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import dayjs from 'dayjs';
import { getLocalFiles, deleteLocalFile, downloadFileToDownloadFolder } from '../utils/localStorageUtils';
import { Platform } from 'react-native';

type RootStackParamList = {
  CsvViewer: {
    filePath: string;
    fileName: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LocalFile {
  name: string;
  path: string;
  size: number;
  mtime: Date;
}

const LocalFiles = () => {
  const navigation = useNavigation<NavigationProp>();
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log("localFiles", localFiles)
  const loadLocalFiles = async () => {
    try {
      setLoading(true);
      const files = await getLocalFiles();
      console.log('files', files)
      setLocalFiles(files);
    } catch (error) {
      console.error('로컬 파일 로드 에러:', error);
      Alert.alert('오류', '로컬 파일을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocalFiles();
    setRefreshing(false);
  };

  const shareFile = async (file: LocalFile) => {
    try {
      await Share.open({
        url: 'file://' + file.path,
        type: 'text/csv',
        filename: file.name,
        failOnCancel: false,
      });
    } catch (error) {
      console.error('파일 공유 에러:', error);
      Alert.alert('오류', '파일 공유에 실패했습니다.');
    }
  };

  const downloadFile = async (file: LocalFile) => {
    try {
      if (Platform.OS === 'android') {
        const downloadPath = await downloadFileToDownloadFolder(file.path, file.name);
        Alert.alert('성공', `파일이 다운로드 폴더에 저장되었습니다.\n${downloadPath}`);
      } else {
        // iOS는 공유 기능 사용
        await shareFile(file);
      }
    } catch (error) {
      console.error('파일 다운로드 에러:', error);
      Alert.alert('오류', '파일 다운로드에 실패했습니다.');
    }
  };

  const deleteFile = async (file: LocalFile) => {
    Alert.alert(
      '파일 삭제',
      `${file.name} 파일을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocalFile(file.path);
              await loadLocalFiles();
              Alert.alert('성공', '파일이 삭제되었습니다.');
            } catch (error) {
              console.error('파일 삭제 에러:', error);
              Alert.alert('오류', '파일 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadLocalFiles();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="로컬 파일" />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>파일을 불러오는 중...</Text>
          </View>
        ) : localFiles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>저장된 파일이 없습니다.</Text>
            <Text style={styles.emptySubText}>
              기기에 저장된 CSV 파일이 여기에 표시됩니다.
            </Text>
          </View>
        ) : (
          localFiles.map((file, index) => (
            <Pressable
              key={index}
              style={styles.fileItem}
              onPress={() => navigation.navigate('CsvViewer', {
                filePath: file.path,
                fileName: file.name,
              })}
            >
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileDetails}>
                  {formatFileSize(file.size)} • {dayjs(file.mtime).format('YYYY-MM-DD HH:mm')}
                </Text>
              </View>

              <View style={styles.fileActions}>
                <Pressable
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                >
                  <Text style={styles.downloadButtonText}>다운로드</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteFile(file);
                  }}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <NavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fileItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: {
    flex: 1,
    marginRight: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 45,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#34C759',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default LocalFiles;