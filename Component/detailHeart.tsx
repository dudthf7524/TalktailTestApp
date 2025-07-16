import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { useBLE } from './BLEContext';

type IRDataPoint = {
  timestamp: number;
  value: number;
};

const DetailHeart = ({ screen }: { screen: string }) => {
  const { state } = useBLE();
  const { irChartData } = state;
  const [data, setData] = useState<IRDataPoint[]>([]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const screenWidth = Dimensions.get('window').width;
  const pointsPerView = 100;
  const pointWidth = screenWidth / pointsPerView;
  const chartWidth = Math.max(screenWidth, pointsPerView * pointWidth);
  const chartHeight = 200;
  const padding = 40; // Y축 레이블을 위한 패딩 추가
  const graphHeight = chartHeight - padding;

  // Y축 범위 계산
  const getYAxisRange = () => {
    try {
      if (!data || data.length === 0) {
        return { min: 0, max: 20000 };
      }

      const values = data
        .map(point => point.value)
        .filter(value => typeof value === 'number' && !isNaN(value) && isFinite(value));

      if (values.length === 0) {
        return { min: 0, max: 20000 };
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // 최소값과 최대값이 같은 경우 처리
      if (min === max) {
        return { min: Math.max(0, min - 1000), max: max + 1000 };
      }

      const padding = (max - min) * 0.1; // 10% 패딩
      return {
        min: Math.max(0, min - padding),
        max: max + padding
      };
    } catch (error) {
      console.error('Error in getYAxisRange:', error);
      return { min: 0, max: 20000 };
    }
  };

  // BLE 데이터를 그래프 데이터로 변환
  useEffect(() => {
    try {
      if (!isAutoScrolling || !irChartData || !Array.isArray(irChartData) || irChartData.length === 0) return;

      // 데이터 포인트 수를 줄임 (모든 포인트를 사용하지 않고 일부만 사용)
      const step = Math.max(1, Math.floor(irChartData.length / 100));
      const newDataPoints: IRDataPoint[] = irChartData
        .filter((_, index) => index % step === 0) // 데이터 포인트 샘플링
        .filter(value => typeof value === 'number' && !isNaN(value) && isFinite(value))
        .map((value, index) => ({
          timestamp: Date.now() + index * 20,
          value: value
        }));

      setData(prevData => {
        const updatedData = [...prevData, ...newDataPoints];
        // 최대 100개의 데이터 포인트만 유지
        return updatedData.slice(-100);
      });
    } catch (error) {
      console.error('Error processing BLE data:', error);
    }
  }, [irChartData, isAutoScrolling]);

  // 자동 스크롤 효과 - 애니메이션 제거
  useEffect(() => {
    if (!isAutoScrolling) return;

    const scrollInterval = setInterval(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false }); // 애니메이션 비활성화
      }
    }, 500); // 500ms로 변경하여 콜백 누적 방지

    return () => {
      clearInterval(scrollInterval);
    };
  }, [isAutoScrolling]);

  // Y축 레이블 생성
  const getYLabels = () => {
    try {
      const { min, max } = getYAxisRange();
      const range = max - min;
      if (range <= 0) return ['0', '5000', '10000', '15000', '20000'];

      const step = range / 4;
      return Array.from({ length: 5 }, (_, i) => 
        Math.round(min + step * i).toString()
      ).reverse();
    } catch (error) {
      console.error('Error generating Y labels:', error);
      return ['0', '5000', '10000', '15000', '20000'];
    }
  };

  // SVG Path 생성 - 최적화
  const createPath = () => {
    try {
      if (!data || data.length === 0) return '';
      
      const { min, max } = getYAxisRange();
      const range = max - min;
      
      if (range <= 0) return '';

      // 데이터 포인트 수를 줄임 (모든 포인트를 사용하지 않고 일부만 사용)
      const step = Math.max(1, Math.floor(data.length / 100));
      const points = data
        .filter((_, index) => index % step === 0) // 데이터 포인트 샘플링
        .filter(point => typeof point.value === 'number' && !isNaN(point.value) && isFinite(point.value))
        .map((item, index) => {
          const x = index * pointWidth * step + padding;
          const y = chartHeight - padding - ((item.value - min) / range) * graphHeight;
          return `${x},${y}`;
        });

      return points.length > 0 ? `M ${points.join(' L ')}` : '';
    } catch (error) {
      console.error('Error creating path:', error);
      return '';
    }
  };

  const yLabels = getYLabels();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chart_container}>
        <View style={styles.chart_wrapper}>
          <View style={styles.yAxisLabels}>
            {yLabels.map((label, index) => (
              <Text key={index} style={styles.yAxisLabel}>
                {label}
              </Text>
            ))}
          </View>
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.graphContainer}
          >
            <Svg width={chartWidth} height={chartHeight}>
              {/* 그리드 라인 */}
              {yLabels.map((_, index) => (
                <Line
                  key={index}
                  x1={padding}
                  y1={padding + (graphHeight * index) / 4}
                  x2={chartWidth}
                  y2={padding + (graphHeight * index) / 4}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                />
              ))}
              
              {/* 데이터 라인 */}
              {data.length > 0 && (
                <Path
                  d={createPath()}
                  stroke="#F5B75C"
                  strokeWidth="2"
                  fill="none"
                />
              )}
            </Svg>
          </ScrollView>
        </View>
        
        {/* 자동 스크롤 제어 버튼 */}
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => setIsAutoScrolling(!isAutoScrolling)}
        >
          <Text style={styles.playButtonText}>
            {isAutoScrolling ? '정지' : '재생'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '98%',
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  chart_container: {
    paddingHorizontal: 0, 
    paddingVertical: 12, 
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 0, 
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart_wrapper: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'center',
  },
  graphContainer: {
    flex: 1,
  },
  yAxisLabels: {
    width: 50,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginRight: 5,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    paddingRight: 5,
  },
  playButton: {
    backgroundColor: '#F5B75C',
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 16,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DetailHeart;