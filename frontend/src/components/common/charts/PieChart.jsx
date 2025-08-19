import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const PieChart = ({ data, width = 300, height = 300 }) => {
    const svgRef = useRef();
    const containerRef = useRef();
    const [containerWidth, setContainerWidth] = useState(0);

    // 컨테이너 크기 감지
    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            setContainerWidth(containerRef.current.offsetWidth);
        }

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (containerWidth === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const actualWidth = typeof width === 'string' ? Math.min(containerWidth, 300) : width;
        const radius = Math.min(actualWidth, height) / 2 - 20;

        const g = svg
            .attr('width', actualWidth)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${actualWidth / 2}, ${height / 2})`);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const arcs = g.selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .style('opacity', 0)
            .transition()
            .duration(1000)
            .style('opacity', 1);

        // 레이블 추가
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(d => d.data.value > 5 ? `${d.data.value}%` : '')
            .transition()
            .delay(500)
            .duration(500)
            .style('opacity', 1);

    }, [data, width, height, containerWidth]);

    return (
        <div ref={containerRef} className="flex justify-center">
            <svg ref={svgRef}></svg>
        </div>
    );
};

PieChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired,
            color: PropTypes.string.isRequired
        })
    ).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number
};

export default PieChart;
