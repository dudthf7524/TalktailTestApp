import React, {useEffect, useState} from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from './header';
import dayjs from 'dayjs';
import { boardStore } from '../store/boardStore';

type RootStackParamList = {
  BoardDetail: {
    board_code: string;
  };
};

type BoardDetailRouteProp = RouteProp<RootStackParamList, 'BoardDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BoardDetail = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BoardDetailRouteProp>();
  const { board_code } = route.params;
  const { board, loadBoard } = boardStore();

  useEffect(() => {
    loadBoard(board_code);
  }, []);

  return (
    <>
      <Header title="게시글" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{board?.title}</Text>
              <Text style={styles.date}>{dayjs(board?.createdAt).format('YYYY.MM.DD HH:mm:ss')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contentBox}>
              <Text style={styles.content}>
                {board?.content}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>게시판 가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5B75C',
    marginBottom: 20,
  },
  contentBox: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    minHeight: 200,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F0663F',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoardDetail;
