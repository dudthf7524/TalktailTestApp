import {create} from 'zustand';
import axios from 'axios';
import {API_URL} from '../Component/constant/contants';
import {getToken} from '../utils/storage';
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
}

interface CsvData {
  file_name: string;
  date: string;
  time: string;
  pet_code: string;
  device_code: string;
}

interface DataStore {
  csvLists: CsvData[];
  createLoading: boolean;
  createError: string | null;
  loadLoading: boolean;
  loadError: string | null;
  downCsvLoading: boolean;
  downCsvError: string | null;
  downCsvSuccess: boolean;
  deleteCsvLoading: boolean;
  deleteCsvError: string | null;
  deleteCsvSuccess: boolean;
  createCSV: (
    date: string,
    time: string,
    pet_code: string,
    device_code: string,
  ) => Promise<void>;
  loadData: (date: string, pet_code: string) => Promise<void>;
  sendData: (
    data: DataPoint[],
    deviceInfo: {
      startDate: string;
      startTime: string;
      deviceCode: string;
      petCode: string;
    },
  ) => Promise<void>;
  downCSV: (file_name: string, label: string) => Promise<void>;
  deleteCSV: (file_name: string) => Promise<void>;
  resetDownCsvSuccess: () => void;
  offDownCsvSuccess: () => void;
  offDownCsvError: () => void;
  offDeleteCsvSuccess: () => void;
  offDeleteCsvError: () => void;
}

export const dataStore = create<DataStore>((set, get) => ({
  csvLists: [],
  createLoading: false,
  createError: null,
  loadLoading: false,
  loadError: null,
  downCsvLoading: false,
  downCsvError: null,
  downCsvSuccess: false,
  deleteCsvLoading: false,
  deleteCsvError: null,
  deleteCsvSuccess: false,
  createCSV: async (
    date: string,
    time: string,
    pet_code: string,
    device_code: string,
  ) => {
    try {
      set({createLoading: true, createError: null});
      const response = await axios.post(`${API_URL}/data/create`, {
        date,
        time,
        pet_code,
        device_code,
      });
      if (response.status === 200) {
        set({createLoading: false, createError: null});
      } else {
        set({createError: 'CSV 생성에 실패했습니다.', createLoading: false});
      }
    } catch (error) {
      set({
        createError:
          error instanceof Error ? error.message : 'CSV 생성에 실패했습니다.',
        createLoading: false,
      });
    }
  },
  sendData: async (
    data: DataPoint[],
    deviceInfo: {
      startDate: string;
      startTime: string;
      deviceCode: string;
      petCode: string;
    },
  ) => {
    console.log(`sendData 진입 시간 : ${dayjs().format('mm:ss:SSS')}`);
    try {
      const response = await axios.post(`${API_URL}/data/send`, {
        data,
        connectedDevice: deviceInfo,
      });
      // console.log('Data : ', data);
      if (response.status === 200) {
        // console.log('데이터 전송 성공');
        console.log(`데이터 전송 성공 : ${dayjs().format('mm:ss:SSS')}`);
      } else {
        console.error('데이터 전송 실패');
      }
    } catch (error) {
      console.error('데이터 전송 에러:', error);
      set({
        createError:
          error instanceof Error
            ? error.message
            : '데이터 전송에 실패했습니다.',
      });
    }
  },
  loadData: async (date: string, pet_code: string) => {
    try {
      set({loadLoading: true, loadError: null});
      const token = await getToken();
      const device_code = token?.device_code;

      const response = await axios.post(`${API_URL}/data/load`, {
        date,
        pet_code,
        device_code,
      });
      if (response.status === 200) {
        set({
          csvLists: response.data.dataLists,
          loadLoading: false,
          loadError: null,
        });
      } else {
        set({loadError: '데이터 로드에 실패했습니다.', loadLoading: false});
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        set({
          loadError: '잘못된 디바이스 코드입니다.',
          loadLoading: false,
        });
      } else {
        set({
          loadError:
            error instanceof Error
              ? error.message
              : '디바이스 코드 검증에 실패했습니다.',
          loadLoading: false,
        });
      }
      throw error;
    }
  },
  downCSV: async (file_name: string, label: string) => {
    try {
      set({downCsvLoading: true, downCsvError: null, downCsvSuccess: false});
      const date_time = file_name.split('_')[2].replace(/\.csv$/i, '');
      const extIndex = file_name.lastIndexOf('.');
      const ext = extIndex !== -1 ? file_name.substring(extIndex) : '.csv';
      let baseFileName = `${label}_${date_time}`;
      let downloadPath = `${RNFS.DownloadDirectoryPath}/${baseFileName}${ext}`;

      let count = 1;
      while (await RNFS.exists(downloadPath)) {
        downloadPath = `${RNFS.DownloadDirectoryPath}/${baseFileName}(${count})${ext}`;
        count++;
      }

      const response = await axios({
        url: `${API_URL}/data/downloadCSV`,
        method: 'POST',
        data: {filename: file_name},
        responseType: 'text',
      });

      await RNFS.writeFile(downloadPath, response.data, 'utf8');
      set({downCsvSuccess: true, downCsvLoading: false, downCsvError: null});
    } catch (error) {
      set({
        downCsvError:
          error instanceof Error
            ? error.message
            : 'CSV 다운로드에 실패했습니다.',
        downCsvLoading: false,
        downCsvSuccess: false,
      });
      throw error;
    }
  },
  deleteCSV: async (file_name: string) => {
    try {
      set({
        deleteCsvLoading: true,
        deleteCsvError: null,
        deleteCsvSuccess: false,
      });
      const response = await axios.post(`${API_URL}/data/deleteCSV`, {
        filename: file_name,
      });
      if (response.status === 200) {
        set({
          deleteCsvLoading: false,
          deleteCsvError: null,
          deleteCsvSuccess: true,
        });
      } else {
        set({
          deleteCsvError: 'CSV 삭제에 실패했습니다.',
          deleteCsvLoading: false,
        });
      }
    } catch (error) {
      set({
        deleteCsvError:
          error instanceof Error ? error.message : 'CSV 삭제에 실패했습니다.',
        deleteCsvLoading: false,
      });
    }
  },
  resetDownCsvSuccess: () => set({downCsvSuccess: false}),
  offDownCsvSuccess: () => set({downCsvSuccess: false}),
  offDownCsvError: () => set({downCsvError: null}),
  offDeleteCsvSuccess: () => set({deleteCsvSuccess: false}),
  offDeleteCsvError: () => set({deleteCsvError: null}),
}));