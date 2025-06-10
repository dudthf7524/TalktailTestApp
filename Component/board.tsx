import React, {useEffect, useState} from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from './header';
import { boardStore } from '../store/boardStore';
import dayjs from 'dayjs';

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

const POSTS_PER_PAGE = 10;

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
      <Header title="게시판" />
      <SafeAreaView style={styles.container}>
        <View style={styles.decorationContainer}>
          <View style={styles.decorationLine} />ㄴ
          <View style={styles.decorationDot} />
          <View style={styles.decorationLine} />
        </View>
        <View style={styles.boardHeader}>
          <Text style={[styles.headerText, styles.numberColumn]}>번호</Text>
          <Text style={[styles.headerText, styles.titleColumn]}>제목</Text>
          <Text style={[styles.headerText, styles.dateColumn]}>작성일</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.boardList}>
            {currentPosts.map((list, index) => {
              const displayNumber = boardLists.length - (startIndex + index);
              return (
                <TouchableOpacity 
                  key={list.board_code}
                  style={styles.boardRow}
                  onPress={() => navigation.navigate('BoardDetail', { board_code: list.board_code })}
                >
                  <Text style={[styles.rowText, styles.numberColumn]}>{displayNumber}</Text>
                  <Text style={[styles.rowText, styles.titleColumn]}>{list.title}</Text>
                  <Text style={[styles.rowText, styles.dateColumn]}>{dayjs(list.createdAt).format("YYYY-MM-DD")}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
        <View style={styles.paginationContainer}>
          {renderPageNumbers()}
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
  decorationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  decorationLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0663F',
    opacity: 0.3,
  },
  decorationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0663F',
    marginHorizontal: 8,
  },
  boardHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F5B75C',
    borderBottomWidth: 1,
    borderBottomColor: '#F5B75C',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  titleColumn: {
    flex: 4,
    textAlign: 'left',
    paddingLeft: 16,
  },
  boardList: {
    flex: 1,
  },
  boardRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5B75C',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  numberColumn: {
    width: 50,
  },
  dateColumn: {
    width: 90,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  pageNumber: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 8,
  },
  navButton: {
    backgroundColor: '#F5B75C',
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