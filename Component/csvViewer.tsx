import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import Header from './header';
import RNFS from 'react-native-fs';
import dayjs from 'dayjs';

type RootStackParamList = {
  CsvViewer: {
    filePath: string;
    fileName: string;
  };
};

type CsvViewerScreenRouteProp = RouteProp<RootStackParamList, 'CsvViewer'>;

interface CsvViewerProps {
  route: CsvViewerScreenRouteProp;
}

interface CsvRow {
  time: string;
  cnt: string;
  ir: string;
  red: string;
  green: string;
  spo2: string;
  hr: string;
  temp: string;
}

const CsvViewer = ({ route }: CsvViewerProps) => {
  const { filePath, fileName } = route.params;
  const navigation = useNavigation();
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("csvData", csvData);
  const loadCsvData = async () => {
    try {
      setLoading(true);
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      // 첫 번째 줄은 헤더이므로 제외
      const dataLines = lines.slice(1).filter(line => line.trim() !== '');
      
      const parsedData: CsvRow[] = dataLines.map(line => {
        const values = line.split(',');
        return {
          time: values[0] || '',
          cnt: values[1] || '',
          ir: values[2] || '',
          red: values[3] || '',
          green: values[4] || '',
          spo2: values[5] || '',
          hr: values[6] || '',
          temp: values[7] || '',
        };
      });
      
      setCsvData(parsedData);
    } catch (error) {
      console.error('CSV 파일 읽기 에러:', error);
      Alert.alert('오류', 'CSV 파일을 읽는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    // 이미 포맷된 시간 문자열이므로 그대로 반환
    return timeString;
  };

  useEffect(() => {
    loadCsvData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="CSV 파일 보기" />
      
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{fileName}</Text>
        <Text style={styles.recordCount}>
          총 {csvData.length}개의 기록
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>파일을 읽는 중...</Text>
        </View>
      ) : csvData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>데이터가 없습니다.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.table}>
            {/* 테이블 헤더 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, styles.headerCell, styles.timeCell]}>시간</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>CNT</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>IR</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>Red</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>Green</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>SpO2</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>심박수</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.dataCell]}>체온</Text>
                </View>
                
                {/* 테이블 데이터 */}
                {csvData.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.cell, styles.timeCell]} numberOfLines={2}>
                      {formatTime(row.time)}
                    </Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.cnt}</Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.ir}</Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.red}</Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.green}</Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.spo2}</Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.hr}</Text>
                    <Text style={[styles.cell, styles.dataCell]}>{row.temp}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      )}
      
      <View style={styles.backButtonContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fileInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  table: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  headerCell: {
    fontWeight: '600',
    color: '#333',
  },
  timeCell: {
    width: 140,
    fontSize: 10,
  },
  dataCell: {
    width: 80,
    fontSize: 11,
  },
  backButtonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CsvViewer;