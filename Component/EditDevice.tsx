import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "./header";

export default function EditDevice() {
    const navigation = useNavigation();
    const [deviceName, setDeviceName] = useState("기존 디바이스 이름");
    const [deviceList, setDeviceList] = useState([
        { id: "1", name: "우리집 디바이스" },
        { id: "2", name: "캠핑장 디바이스" },
    ]);

    const handleSave = () => {
        console.log("디바이스 이름 저장됨:", deviceName);
        navigation.goBack();
    };

    const handleDelete = () => {
        console.log("디바이스 삭제됨:", deviceName);
        navigation.goBack();
    };

    const renderDeviceItem = ({ item }) => (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderBottomWidth: 1,
                borderColor: "#e5e7eb",
            }}
        >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            <TouchableOpacity
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                onPress={() => {
                    setDeviceName(item.name);
                }}
            >
                <Text style={{ color: "#4f46e5" }}>수정</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <Header title="디바이스 수정" />
            <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
                
                <Text style={{ fontSize: 16, marginBottom: 6 }}>디바이스 이름</Text>
                <TextInput
                    value={deviceName}
                    onChangeText={setDeviceName}
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20,
                    }}
                    placeholder="디바이스 이름 입력"
                />

                <TouchableOpacity
                    onPress={handleSave}
                    style={{
                        backgroundColor: "#4f46e5",
                        padding: 14,
                        borderRadius: 8,
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>저장</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                        backgroundColor: "#ef4444",
                        padding: 14,
                        borderRadius: 8,
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>디바이스 삭제</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
                    등록된 디바이스 목록
                </Text>
                <FlatList
                    data={deviceList}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDeviceItem}
                />
            </View>
        </>
    );
}
