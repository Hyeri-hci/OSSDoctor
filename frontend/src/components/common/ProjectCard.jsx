import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, Badge } from './index';
import { formatNumber, formatDate } from '../../features/Ecosystem/utils/ecosystemUtils';
import { StarIcon, CodeBracketIcon, CalendarIcon } from '@heroicons/react/24/outline';

/**
 * 공통 프로젝트 카드 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.project - 프로젝트 데이터
 * @param {Function} props.onProjectClick - 프로젝트 클릭 핸들러 (선택사항)
 * @param {string} props.layout - 레이아웃 타입 ('vertical' | 'horizontal')
 * @param {boolean} props.showImage - 이미지 표시 여부 (horizontal 레이아웃에서만)
 */
const ProjectCard = ({ 
    project, 
    onProjectClick, 
    layout = 'vertical',
    showImage = false 
}) => {
    const handleClick = useCallback((e) => {
        if (onProjectClick) {
            e.preventDefault();
            onProjectClick(project);
        }
    }, [project, onProjectClick]);

    // URL 생성 로직
    const projectUrl = project.html_url || 
        (project.owner?.login && project.name ? `https://github.com/${project.owner.login}/${project.name}` :
        `https://github.com/search?q=${encodeURIComponent(project.name)}&type=repositories`);

    // 통합된 데이터 접근 (모든 데이터 소스 통합)
    const stars = project.stars || project.stargazers_count || 0;
    const forks = project.forks || project.forks_count || 0;
    const language = project.language || project.tech || 'Unknown';
    const description = project.description || '설명이 없습니다.';
    const lastCommit = project.lastCommit || project.updated_at || project.pushed_at || project.updatedAt;
    const goodFirstIssues = project.goodFirstIssues || 0;

    // 언어 색상 결정
    const languageColor = project.languageColor || '#586069';

    // 공통 카드 콘텐츠
    const commonCardContent = (
        <>
            {/* 프로젝트 헤더 */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 break-words leading-tight">
                        {project.name}
                    </h3>
                    {/* 초보자 난이도 배지 */}
                    {(goodFirstIssues >= 3 || project.difficulty === 'Beginner') && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            쉬운 기여
                        </span>
                    )}
                    {/* 기타 난이도 배지 - 개선된 표시 로직 */}
                    {project.difficulty && project.difficulty !== 'Beginner' && goodFirstIssues < 3 && (
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                            project.difficulty === 'Intermediate' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {project.difficulty === 'Intermediate' ? '중급자용' : '고급자용'}
                        </span>
                    )}
                </div>
            </div>
            
            {/* 설명 */}
            <div className="flex-grow mb-4">
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Good First Issues 정보 강조 */}
            {goodFirstIssues > 0 && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <div className="text-green-700 font-medium">
                        💡 Good First Issues: {goodFirstIssues}개
                    </div>
                    <div className="text-green-600 text-xs mt-1">
                        초보자도 쉽게 시작할 수 있는 이슈들이 있어요!
                    </div>
                </div>
            )}

            {/* 메타 정보 */}
            <div className="text-xs text-gray-500 mb-4">
                <div>최근 업데이트: {lastCommit ? formatDate(lastCommit) : formatDate(new Date())}</div>
            </div>

            {/* 하단 통계 */}
            <div className="flex items-center justify-between text-xs">
                {/* 언어 */}
                <div className="flex items-center gap-1">
                    <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: languageColor }}
                    />
                    <span className="text-gray-700 font-medium">{language}</span>
                </div>
                
                {/* Stars와 Forks */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-yellow-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium">{formatNumber(stars)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{formatNumber(forks)}</span>
                    </div>
                </div>
            </div>
        </>
    );

    // Vertical 레이아웃 (Ecosystem 페이지용)
    if (layout === 'vertical') {
        return (
            <a 
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                onClick={handleClick}
            >
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                    {commonCardContent}
                </div>
            </a>
        );
    }

    // Horizontal 레이아웃 (MainPage용) - 동일한 스타일로 통합
    return (
        <a 
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            onClick={handleClick}
        >
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col md:flex-row gap-4">
                {/* Project Information - 동일한 콘텐츠 구조 사용 */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {commonCardContent}
                </div>
            </div>
        </a>
    );
};

ProjectCard.propTypes = {
    project: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        html_url: PropTypes.string,
        language: PropTypes.string,
        stars: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        stargazers_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        forks: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        forks_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        topics: PropTypes.arrayOf(PropTypes.string),
        difficulty: PropTypes.string,
        lastCommit: PropTypes.string,
        updated_at: PropTypes.string,
        pushed_at: PropTypes.string,
        owner: PropTypes.shape({
            login: PropTypes.string
        })
    }).isRequired,
    onProjectClick: PropTypes.func,
    layout: PropTypes.oneOf(['vertical', 'horizontal']),
    showImage: PropTypes.bool
};

export default ProjectCard;
