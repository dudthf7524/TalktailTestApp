import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { deviceStore } from '../../store/deviceStore';

interface FindPasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

const FindPasswordModal = ({ visible, onClose }: FindPasswordModalProps) => {
    const {
        findPassword,
        findPasswordSuccess,
        findPasswordError,
        changePassword
    } = deviceStore();
    const [deviceCode, setDeviceCode] = useState('');
    const [id, setId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const resetForm = () => {
        setDeviceCode('');
        setId('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (deviceCode.trim() && id.trim()) {
            try {
                await findPassword({ deviceCode, id });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword.trim() && confirmPassword.trim() && newPassword === confirmPassword) {
            try {
                await changePassword({ deviceCode, id, newPassword });
                handleClose();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {findPasswordSuccess ? (
                        <>
                            <Text style={styles.title}>비밀번호 변경</Text>
                            <Text style={styles.description}>
                                새로운 비밀번호를 입력해주세요.
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>새로운 비밀번호</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="새로운 비밀번호를 입력하세요"
                                    placeholderTextColor="#999999"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>비밀번호 확인</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    placeholderTextColor="#999999"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                                    <Text style={styles.cancelButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handlePasswordChange}>
                                    <Text style={styles.submitButtonText}>변경</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>비밀번호 찾기</Text>
                            <Text style={styles.description}>
                                등록된 디바이스 코드와 아이디를 입력해주세요.
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>디바이스 코드</Text>
                                <TextInput
                                    style={styles.input}
                                    value={deviceCode}
                                    onChangeText={setDeviceCode}
                                    placeholder="디바이스 코드를 입력하세요"
                                    placeholderTextColor="#999999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>아이디</Text>
                                <TextInput
                                    style={styles.input}
                                    value={id}
                                    onChangeText={setId}
                                    placeholder="아이디를 입력하세요"
                                    placeholderTextColor="#999999"
                                />
                            </View>
                            {
                                findPasswordError ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>{findPasswordError}</Text>
                                    </View>
                                ) : (
                                    <></>
                                )
                            }

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                                    <Text style={styles.cancelButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                    <Text style={styles.submitButtonText}>확인</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#F0663F',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FFE0E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        width: '100%',
    },
    errorText: {
        color: '#F0663F',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default FindPasswordModal; 
