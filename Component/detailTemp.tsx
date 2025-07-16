import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { useBLE } from './BLEContext';

interface TempDataPoint {
  value: number;
  timestamp: number;
}

const DetailTemp = ({ tempData, screen }: { tempData: number, screen: string }) => {
  const { state } = useBLE();
  const { tempChartData } = state;
  const [data, setData] = useState<TempDataPoint[]>([]);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 40, data.length * 50);
  const chartHeight = 200;
  const padding = 20;
  const rightMargin = 20; // 데이터 오른쪽 여유공간
  const graphHeight = chartHeight - padding * 2;

  // BLE 데이터를 차트 데이터로 변환
  useEffect(() => {
    console.log('tempChartData : ', tempChartData);
    if (!isAutoScrolling || !tempChartData || tempChartData.length === 0) return;

    // 유효한 데이터만 필터링 (timestamp가 0이 아니고 value가 0이 아닌 데이터)
    const validData = tempChartData.filter(item => 
      item.timestamp > 0 && item.value > 0
    );
    
    setData(validData);
  }, [tempChartData, isAutoScrolling]);

  // 데이터가 업데이트될 때마다 스크롤을 오른쪽 끝으로 이동 (자동 스크롤이 활성화된 경우에만)
  useEffect(() => {
    if (scrollViewRef.current && isAutoScrolling && data.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: false }); // 애니메이션 비활성화로 성능 최적화
    }
  }, [data, isAutoScrolling]);

  // 데이터 정규화 - 더 안전한 계산
  const values = data.map(item => item.value).filter(val => val > 0);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 40; // 기본 온도 범위
  const valueRange = Math.max(maxValue - minValue, 1); // 최소값을 1로 설정

  // SVG Path 생성
  const createPath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => {
      const value = item.value;
      const x = data.length === 1 
        ? chartWidth / 2 
        : (index / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2 - rightMargin) + padding;
      const y = padding + ((maxValue - value) / valueRange) * graphHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Y축 레이블 생성
  const yLabels = Array.from({ length: 6 }, (_, i) => {
    const value = maxValue - (valueRange * i) / 5; // 큰 값부터 작은 값 순서로
    return value.toFixed(1);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chart_container}>
        <View style={styles.chart_wrapper}>
          {/* Y축 레이블 */}
          <View style={styles.yAxis}>
            {yLabels.map((label, index) => (
              <Text key={index} style={styles.yAxisLabel}>
                {label}
              </Text>
            ))}
          </View>
          
          {/* 그래프 영역 */}
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
                  y1={padding + (graphHeight * index) / 5}
                  x2={chartWidth - padding}
                  y2={padding + (graphHeight * index) / 5}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                />
              ))}
              
              {/* 데이터 라인 */}
              <Path
                d={createPath()}
                stroke="#F5B75C"
                strokeWidth="2"
                fill="none"
              />
              
              {/* 데이터 포인트 */}
              {data.length > 0 && data.map((item, index) => {
                const value = item.value;
                
                // 유효하지 않은 데이터는 건너뛰기
                if (value <= 0 || item.timestamp <= 0) {
                  return null;
                }
                
                // x 좌표 계산 수정
                const x = data.length === 1 
                  ? chartWidth / 2 
                  : (index / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2 - rightMargin) + padding;
                
                // y 좌표 계산 수정
                const y = padding + ((maxValue - value) / valueRange) * graphHeight;
                
                // NaN 체크 추가
                if (isNaN(x) || isNaN(y)) {
                  return null;
                }
                
                return (
                  <View key={index}>
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          left: x - 6,
                          top: y - 6,
                        },
                      ]}
                    />
                    {/* X축 레이블 */}
                    <Text
                      style={[
                        styles.xAxisLabel,
                        {
                          position: 'absolute',
                          left: x - 20,
                          top: chartHeight - 20,
                        },
                      ]}
                    >
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </Text>
                  </View>
                );
              })}
              
              {/* 데이터가 없을 때 메시지 */}
              {data.length === 0 && (
                <Text
                  style={{
                    position: 'absolute',
                    left: chartWidth / 2 - 50,
                    top: chartHeight / 2,
                    fontSize: 14,
                    color: '#666',
                    textAlign: 'center'
                  }}
                >
                  온도 데이터를 기다리는 중...
                </Text>
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
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#262626',
    textAlign: 'right',
    paddingRight: 5,
  },
  graphContainer: {
    flex: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5B75C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#262626',
    width: 40,
    textAlign: 'center',
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

export default DetailTemp;