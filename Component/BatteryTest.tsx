import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TouchableOpacity, StyleSheet, Platform } from 'react-native';

import axios from 'axios';
import { API_URL } from './constant/contants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './header';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';

const BatteryTest = () => {
    const [batteryLevel, setBatteryLevel] = useState(50);
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        
        // if ( Platform.OS === 'ios' ) {
        //     firebase.initializeApp({
        //       appId: "1:571094511362:ios:b5969c6ace34a4e7ee1c1b",
        //       projectId: "talktail-5b629",
        //       apiKey: "AIzaSyB4vmt_QSM5EHrnjhQ5KHh2z7EkAh8Dkvk"
              
        //     }).then(res=>{
        //       console.log(res)
        //     }).catch(err=>{
        //       console.log(err)
        //     })
        //   }
        messaging().getToken().then(token => {
            console.log('FCM Token:', token);
            setFcmToken(token);
        });
    }, []);
    const sendPush = async () => {
        console.log('실행')
        console.log(API_URL)
        try {
            const response = await axios.post(`${API_URL}/user/battery/push`, { batteryLevel, fcmToken })
        } catch (e) {
            console.error(e)
        }
        // const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        //     method: 'POST',
        //     headers: {
        //         Authorization: 'key=YOUR_SERVER_KEY_HERE', // 🔐 Firebase 콘솔에서 발급받은 서버 키
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         to: fcmToken,
        //         notification: {
        //             title: '배터리 부족 알림 ⚠️',
        //             body: `배터리 잔량이 ${batteryLevel}% 입니다. 충전이 필요합니다.`,
        //         },
        //     }),
        // });

        // const result = await response.json();
        // console.log('푸시 결과:', result);
    };

    useEffect(() => {
        if (batteryLevel <= 10 && fcmToken || batteryLevel === 100) {
            sendPush();
        }
    }, [batteryLevel]);

    const getBatteryColor = (level: number) => {
        if (level >= 60) return '#4CAF50'; // Green
        if (level >= 30) return '#FFC107'; // Yellow
        return '#F44336'; // Red
    };

    const increaseLevel = () => {
        setBatteryLevel(prev => Math.min(prev + 10, 100));
    };

    const decreaseLevel = () => {
        setBatteryLevel(prev => Math.max(prev - 10, 0));
    };


    

    return (
        <>
            <Header title="배터리 표시" />
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <Text style={styles.label}>🔋 배터리 조절</Text>

                <View style={styles.batteryControl}>
                    <TouchableOpacity onPress={increaseLevel} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>▲</Text>
                    </TouchableOpacity>

                    <View style={styles.batteryContainer}>
                        <View style={styles.batteryBody}>
                            <View
                                style={[
                                    styles.batteryLevel,
                                    {
                                        width: `${Math.min(batteryLevel, 100)}%`,
                                        backgroundColor: getBatteryColor(batteryLevel),
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.batteryCap} />
                        <Text style={styles.batteryText}>{batteryLevel}%</Text>
                    </View>

                    <TouchableOpacity onPress={decreaseLevel} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>▼</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

export default BatteryTest;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    label: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
    batteryControl: {
        alignItems: 'center',
        marginBottom: 30,
        justifyContent: 'center',
    },
    batteryContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    batteryBody: {
        width: 150,
        height: 40,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 6,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    batteryLevel: {
        height: '100%',
    },
    batteryCap: {
        width: 6,
        height: 20,
        backgroundColor: '#000',
        marginTop: -30,
        marginLeft: 150,
        borderRadius: 2,
    },
    batteryText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrowButton: {
        padding: 10,
    },
    arrowText: {
        fontSize: 30,
        color: '#333',
    },
});
