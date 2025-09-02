import RNFS from 'react-native-fs';
import dayjs from 'dayjs';

interface DataPoint {
  timestamp: number;
  cnt: number;
  ir: number;
  red: number;
  green: number;
  spo2: number;
  hr: number;
  temp: number;
  battery: number;
  afterSendTemp?: number; // 전송 후 temp 값
  isErrorMarked?: boolean; // 에러 체크 여부
}

interface DeviceInfo {
  startDate: string;
  startTime: string;
  deviceCode: string;
  petCode: string;
  currentPA?: {name: string; value: string; timestamp: string} | null;
  isErrorMarked?: boolean;
}

export const saveDataToLocal = async (
  data: DataPoint[],
  deviceInfo: DeviceInfo,
  isNewConnection: boolean = false,
  isErrorMarked: boolean = false,
  currentPA?: {name: string; value: string; timestamp: string} | null
): Promise<string> => {
  try {
    // 기존 파일을 찾거나 새 파일 생성
    let fileName: string;
    let filePath: string;
    let shouldAddHeader = true;

    if (isNewConnection) {
      // 새 연결이면 항상 새 파일 생성 (현재 시간으로 타임스탬프 생성)
      const timestamp = dayjs().format('HHmmss');
      fileName = `${deviceInfo.petCode}_${dayjs().format('YYYYMMDD')}-${timestamp}.csv`;
      filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      console.log(`새 연결 - 새 파일 생성: ${fileName}`);
    } else {
      // 같은 세션의 기존 파일 찾기
      const sessionPattern = `${deviceInfo.petCode}_${deviceInfo.startDate}`;
      const documentsPath = RNFS.DocumentDirectoryPath;
      const files = await RNFS.readDir(documentsPath);
      
      const existingFile = files
        .filter(file => file.name.toLowerCase().endsWith('.csv'))
        .find(file => file.name.startsWith(sessionPattern));
      
      if (existingFile) {
        fileName = existingFile.name;
        filePath = existingFile.path;
        shouldAddHeader = false; // 기존 파일에는 헤더 추가하지 않음
        console.log(`기존 파일에 이어서 저장: ${fileName}`);
      } else {
        // 기존 파일이 없으면 새 파일 생성
        const timestamp = deviceInfo.startTime;
        fileName = `${deviceInfo.petCode}_${deviceInfo.startDate}-${timestamp}.csv`;
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        console.log(`새 파일 생성: ${fileName}`);
      }
    }

    // CSV 데이터 변환
    const csvData = data.map(point => {
      const formattedTime = dayjs(point.timestamp).format('YYYY-MM-DD HH:mm:ss');
      
      // 구분선 데이터인지 확인 (모든 값이 -1인 경우)
      if (point.ir === -1 && point.red === -1 && point.green === -1 && 
          point.spo2 === -1 && point.hr === -1 && point.temp === -1 && point.battery === -1) {
        return `${formattedTime},X,X,X,X,X,X,X,X`;
      }
      
      // 에러 마킹이 되어있으면 모든 값을 X로 표시
      if (isErrorMarked) {
        return `${formattedTime},X,X,X,X,X,X,X,X`;
      }
      
      // PA 값이 있으면 추가 (temp 옆에)
      const paValue = currentPA ? `${currentPA.name}(${currentPA.value})` : '';
      
      return `${formattedTime},${point.cnt},${point.ir},${point.red},${point.green},${point.spo2},${point.hr},${point.temp},${paValue}`;
    }).join('\n');

    let csvContent = '';
    
    if (shouldAddHeader) {
      // 새 파일이면 헤더 추가 (temp 옆에 PA 항목 포함)
      const csvHeader = 'time,cnt,ir,red,green,spo2,hr,temp,PA\n';
      csvContent = csvHeader + csvData;
      await RNFS.writeFile(filePath, csvContent, 'utf8');
    } else {
      // 기존 파일에 이어서 저장
      csvContent = '\n' + csvData;
      await RNFS.appendFile(filePath, csvContent, 'utf8');
    }
    
    console.log(`✅ 로컬 CSV 저장 완료: ${fileName}`);
    console.log(`📂 저장 경로: ${filePath}`);
    
    // 파일 생성 확인
    await checkFileExists(filePath);
    
    // 파일 내용 미리보기 (첫 3줄)
    await previewFileContent(filePath, 3);
    
    return fileName;
  } catch (error) {
    console.error('로컬 CSV 저장 에러:', error);
    throw error;
  }
};

export const getLocalFiles = async (): Promise<Array<{
  name: string;
  path: string;
  size: number;
  mtime: Date;
}>> => {
  try {
    const documentsPath = RNFS.DocumentDirectoryPath;
    const files = await RNFS.readDir(documentsPath);
    
    console.log('📁 Document Directory Path:', documentsPath);
    console.log('📄 전체 파일 목록:', files.map(f => f.name));
    
    const csvFiles = files.filter(file => file.name.toLowerCase().endsWith('.csv'));
    console.log('📊 CSV 파일 목록:', csvFiles.map(f => f.name));
    
    return csvFiles
      .map(file => ({
        name: file.name,
        path: file.path,
        size: file.size,
        mtime: file.mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch (error) {
    console.error('로컬 파일 목록 조회 에러:', error);
    return [];
  }
};

// 파일이 실제로 생성되었는지 확인하는 함수
export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    const exists = await RNFS.exists(filePath);
    console.log(`📋 파일 존재 확인 [${filePath}]: ${exists}`);
    
    if (exists) {
      const stats = await RNFS.stat(filePath);
      console.log(`📈 파일 크기: ${stats.size} bytes`);
      console.log(`🕒 파일 수정 시간: ${stats.mtime}`);
    }
    
    return exists;
  } catch (error) {
    console.error('파일 존재 확인 에러:', error);
    return false;
  }
};

// 파일 내용 미리보기 함수 (디버깅용)
export const previewFileContent = async (filePath: string, lines: number = 5): Promise<string> => {
  try {
    const content = await RNFS.readFile(filePath, 'utf8');
    const previewLines = content.split('\n').slice(0, lines).join('\n');
    console.log(`📖 파일 내용 미리보기 [${filePath}]:\n${previewLines}`);
    return previewLines;
  } catch (error) {
    console.error('파일 내용 읽기 에러:', error);
    return '';
  }
};

export const deleteLocalFile = async (filePath: string): Promise<void> => {
  try {
    await RNFS.unlink(filePath);
    console.log('로컬 파일 삭제 완료:', filePath);
  } catch (error) {
    console.error('로컬 파일 삭제 에러:', error);
    throw error;
  }
};

export const downloadFileToDownloadFolder = async (
  sourceFilePath: string,
  fileName: string
): Promise<string> => {
  try {
    // 안드로이드의 경우 다운로드 폴더에 저장
    const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    
    // 파일 복사
    await RNFS.copyFile(sourceFilePath, downloadPath);
    
    console.log('다운로드 폴더에 저장 완료:', downloadPath);
    return downloadPath;
  } catch (error) {
    console.error('다운로드 폴더 저장 에러:', error);
    throw error;
  }
};