import { Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { API_URL } from './Component/constant/contants';
import axios from 'axios';

export const checkAppVersion = async (
    setShowUpdateModal: (value: boolean) => void,
    setUpdateDate: (value: string) => void
) => {
    try {
        const currentVersion = DeviceInfo.getVersion();
        const currentNumber = DeviceInfo.getBuildNumber();
        const platform = Platform.OS;

        console.log("currentVersion", currentVersion);
        console.log('앱 빌드 번호:', currentNumber);
        console.log("platform", platform);

        // 서버 요청 예시 (현재는 하드코딩)
        console.log(API_URL)

        const result = await axios.get(`${API_URL}/platform/platformOS?platform=${platform}`);
        console.log(result.data.platform_build_number)
        console.log(result.data.platform_version_name)
        console.log(result.data.updated_at)

        // const { data } = await axios.get(`https://your.api.com/app/version?platform=${platform}`);
        // const latestVersion = data.version;

        const latestVersion = result.data.platform_version_name; // 예시용 하드코딩
        const latestNumber = result.data.platform_build_number;
        const updatedAt = result.data.updated_at;
        setUpdateDate(updatedAt);
        
        // if (currentVersion !== latestVersion || currentNumber !== latestNumber) {
        //     setShowUpdateModal(true);
        // }

         if (currentVersion == latestVersion && currentNumber == latestNumber) {
            
        }else{
            setShowUpdateModal(true);
        }
    } catch (error) {
        console.error('버전 확인 실패:', error);
    }
};