import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from './header';
import { boardStore } from '../store/boardStore';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BoardData {
  board_code: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

type RootStackParamList = {
  PetLists: undefined;
  RegisterPet: undefined;
  EditPet: {
    pet: {
      pet_code: string;
      name: string;
      birth: string;
      breed: string;
      gender: boolean;
      neutered: boolean;
      disease: string;
      history: string;
      admission: string;
      species: string;
      weight: string;
      vet: string;
    };
  };
  Dashboard: {
    selectedPet: {
      name: string;
      gender: boolean;
      birth: string;
      breed: string;
      neutered: boolean;
      disease: string;
      history: string;
      admission: string;
      species: string;
      weight: string;
      vet: string;
    };
  };
  ConnectBle: undefined;
  Board: undefined;
  BoardDetail: {
    board_code: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const POSTS_PER_PAGE = 5;

const Board = () => {
  const navigation = useNavigation<NavigationProp>();
  const { boardLists, loadAllBoard } = boardStore();
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    loadAllBoard();
  }, []);

  const totalPages = Math.ceil(boardLists.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = [...boardLists].reverse().slice(startIndex, endIndex);

  const renderPageNumbers = () => {
    const pageNumbers: React.ReactElement[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 버튼
    if (currentPage > 1) {
      pageNumbers.push(
        <TouchableOpacity
          key="prev"
          style={[styles.pageNumber, styles.navButton]}
          onPress={() => setCurrentPage(currentPage - 1)}
        >
          <Text style={styles.pageNumberText}>이전</Text>
        </TouchableOpacity>
      );
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageNumber,
            currentPage === i && styles.currentPageNumber
          ]}
          onPress={() => setCurrentPage(i)}
        >
          <Text style={[
            styles.pageNumberText,
            currentPage === i && styles.currentPageNumberText
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // 다음 버튼
    if (currentPage < totalPages) {
      pageNumbers.push(
        <TouchableOpacity
          key="next"
          style={[styles.pageNumber, styles.navButton]}
          onPress={() => setCurrentPage(currentPage + 1)}
        >
          <Text style={styles.pageNumberText}>다음</Text>
        </TouchableOpacity>
      );
    }

    return pageNumbers;
  };

  return (
    <>
      <Header title="공지사항" />
      <SafeAreaView style={styles.noticeContainer} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.noticeList}>
            {currentPosts.map((list) => (
              <TouchableOpacity
                key={list.board_code}
                style={styles.noticeItem}
                onPress={() => navigation.navigate('BoardDetail', { board_code: list.board_code })}
                activeOpacity={0.7}
              >
                <Text style={styles.noticeTitle} numberOfLines={2}>{list.title}</Text>
                <Text style={styles.noticeDate}>{dayjs(list.createdAt).format('YYYY.MM.DD')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.paginationContainer}>{renderPageNumbers()}</View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  noticeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  noticeList: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  noticeItem: {
    width: '90%',
    height: 125,
    borderColor: '#F5B75C',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    justifyContent: 'center',

  },
  noticeTitle: {
    height: 42,
    fontSize: 15,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 8,
  },
  noticeDate: {
    fontSize: 13,
    color: '#888888',
    marginTop: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  pageNumber: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
  },
  navButton: {
    backgroundColor: '#F5F5F5',
  },
  currentPageNumber: {
    backgroundColor: '#F0663F',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#333333',
  },
  currentPageNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Board;