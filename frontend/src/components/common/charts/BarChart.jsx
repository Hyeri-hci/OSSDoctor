import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const BarChart = ({ data, width = "100%", height = 300 }) => {
    const svgRef = useRef();      // SVG 요소 참조
    const containerRef = useRef(); // 컨테이너 div 참조
    const [containerWidth, setContainerWidth] = useState(0); // 반응형을 위한 컨테이너 너비

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width); // 새로운 너비로 상태 업데이트
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current); // 컨테이너 감시 시작
            // 초기 크기 설정
            setContainerWidth(containerRef.current.offsetWidth);
        }

        // Cleanup: 컴포넌트 언마운트 시 observer 해제
        return () => resizeObserver.disconnect();
    }, []);


    useEffect(() => {
        if (containerWidth === 0) return; // 크기가 결정되지 않은 경우 대기

        // D3로 SVG 요소 선택 및 초기화
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // 기존 차트 내용 모두 제거

        // 반응형 너비 계산
        const actualWidth = width === "100%" ? containerWidth : width;

        // 차트 여백 설정 (축 라벨, 제목 등을 위한 공간)
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const innerWidth = actualWidth - margin.left - margin.right;   // 실제 차트 너비
        const innerHeight = height - margin.top - margin.bottom;       // 실제 차트 높이

        // SVG 그룹 요소 생성 (transform으로 여백만큼 이동)
        const g = svg
            .attr('width', actualWidth)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // D3 스케일 설정
        // X축은 범주형 데이터 (막대의 라벨들)
        // Y축은 연속형 데이터 (값들)
        // 스케일은 입력 도메인과 출력 범위를 정의하여 데이터와 화면 좌표를 매핑
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.label))  // 입력 도메인: 데이터의 라벨들
            .range([0, innerWidth])          // 출력 범위: 0부터 차트 너비까지
            .padding(0.1);                   // 막대 사이 간격 (전체 너비의 10%)

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]) // 0부터 데이터의 최대값까지
            .nice()                                   // 축 값을 깔끔하게 조정 (예: 97 → 100)
            .range([innerHeight, 0]);                 // Y축은 뒤집어야 함 (SVG는 위가 0)

        // X축 그리기
        g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`) // 차트 하단으로 이동
            .call(d3.axisBottom(xScale))                       // D3 축 함수 사용
            .selectAll('text')
            .style('font-size', '12px');

        // Y축 그리기
        g.append('g')
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .style('font-size', '12px');


        // 막대 그리기 (기존 애니메이션 포함)
        g.selectAll('.bar')
            .data(data)                                    // 데이터 바인딩
            .enter()                                       // 새 데이터 포인트들
            .append('rect')                                // 각 데이터에 사각형 생성
            .attr('class', 'bar')
            .attr('x', d => xScale(d.label))              // X 위치: 라벨에 따라
            .attr('width', xScale.bandwidth())             // 너비: 스케일이 계산한 막대 너비
            .attr('y', innerHeight)                        // 초기 Y 위치: 차트 하단 (애니메이션용)
            .attr('height', 0)                             // 초기 높이: 0 (애니메이션용)
            .attr('fill', '#3B82F6')                       // 막대 색상 (TailwindCSS blue-500)
            .transition()                                  // 애니메이션 시작
            .duration(1000)                                // 1초 동안
            .attr('y', d => yScale(d.value))              // 최종 Y 위치
            .attr('height', d => innerHeight - yScale(d.value)); // 최종 높이

    }, [data, width, height, containerWidth]); // 의존성 배열: 이 값들이 변경되면 차트 다시 그리기

    /**
     * JSX 반환
     * - containerRef로 크기 감지
     * - svgRef로 D3가 조작할 SVG 요소 제공
     */
    return (
        <div ref={containerRef} className="w-full">
            <svg ref={svgRef} className="w-full"></svg>
        </div>
    );
};

BarChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired
        })
    ).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number
};

export default BarChart;
