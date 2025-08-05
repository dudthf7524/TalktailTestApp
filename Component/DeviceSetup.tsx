import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from './header';

const DeviceSetup = () => {
    const [deviceList, setDeviceList] = useState([]);
    const [newDeviceName, setNewDeviceName] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchDeviceList();
    }, []);

    const fetchDeviceList = async () => {
        // 임시 데이터로 대체
        const mockData = [
            { device_code: 'D001', device_name: 'Tailing One', device_address: '00:A0:C9:14:C8:29' },
            { device_code: 'D002', device_name: 'Tailing Two', device_address: '00:A0:C9:14:C8:30' },
        ];
        setDeviceList(mockData);
    };

    const handleAddDevice = async () => {
        if (!newDeviceName) return;
        const newDevice = {
            device_code: `D00${deviceList.length + 1}`,
            device_name: newDeviceName,
            device_address: `00:A0:C9:14:C8:${30 + deviceList.length}`,
        };
        setDeviceList(prev => [...prev, newDevice]);
        setNewDeviceName('');
        Alert.alert('디바이스 추가 완료', '디바이스가 성공적으로 등록되었습니다.');
    };

    const handleEditDevice = (device) => {
        navigation.navigate('EditDevice', { device });
    };

    return (
        <>
            <Header title="디바이스 설정" />
            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        value={newDeviceName}
                        onChangeText={setNewDeviceName}
                        placeholder="디바이스 이름 입력"
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
                        <Text style={styles.addButtonText}>등록</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={deviceList}
                    keyExtractor={(item) => item.device_code.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.deviceCard} onPress={() => handleEditDevice(item)}>
                            <Text style={styles.deviceName}>{item.device_name}</Text>
                            <Text style={styles.deviceInfo}>{item.device_address}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
        color: '#F0663F',
    },
    inputGroup: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
        backgroundColor: '#fff',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#F0663F',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deviceCard: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 12,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    deviceInfo: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
});

export default DeviceSetup;
