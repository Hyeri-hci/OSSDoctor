import React from 'react';
import PropTypes from 'prop-types';
import { Card, Badge, EmptyState } from '../../../components/common';
import { StarIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

/**
 * 프로젝트 카드 리스트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.projects - 프로젝트 목록
 * @param {Function} props.onClearFilters - 필터 초기화 핸들러 (선택사항)
 * @param {React.Ref} props.containerRef - 컨테이너 참조 (선택사항)
 */
const ProjectCardList = ({ projects, onClearFilters, containerRef }) => {
    if (!projects || projects.length === 0) {
        return (
            <div className="col-span-full">
                <EmptyState
                    icon="🔍"
                    title="검색 결과가 없습니다"
                    description="다른 검색 조건으로 시도해보세요."
                    action={
                        onClearFilters ? (
                            <button 
                                onClick={onClearFilters}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg transition-colors duration-200"
                            >
                                ✕ 필터 초기화
                            </button>
                        ) : null
                    }
                />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {projects.map((project) => (
                <a 
                    key={project.id}
                    href={
                        project.html_url || 
                        (project.owner && project.name ? `https://github.com/${project.owner}/${project.name}` :
                        `https://github.com/search?q=${encodeURIComponent(project.name)}&type=repositories`)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <Card className="p-6 hover:shadow-lg transition-shadow break-words cursor-pointer h-full">
                        <div className="flex flex-col h-full space-y-4">
                            {/* 프로젝트 헤더 */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 break-words leading-tight">{project.name}</h3>
                                    <Badge variant="secondary" className="mt-1">
                                        {project.difficulty}
                                    </Badge>
                                </div>
                            </div>

                            {/* 프로젝트 설명 */}
                            <div className="flex-grow">
                                <p className="text-gray-600 text-sm line-clamp-3 break-words leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            {/* 프로젝트 메타 정보 - 토픽/태그 */}
                            <div className="flex flex-wrap gap-2">
                                {project.topics && project.topics.slice(0, 3).map((topic) => (
                                    <Badge key={topic} variant="outline" size="sm" className="text-xs break-words">
                                        {topic}
                                    </Badge>
                                ))}
                                {project.topics && project.topics.length > 3 && (
                                    <Badge variant="outline" size="sm" className="text-xs">
                                        +{project.topics.length - 3}
                                    </Badge>
                                )}
                            </div>

                            {/* 프로젝트 통계 - Stars, Forks, Language */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                {/* 언어 */}
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <CodeBracketIcon className="w-4 h-4 flex-shrink-0" />
                                    <span className="break-words font-medium">{project.language}</span>
                                </div>
                                
                                {/* Stars & Forks */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-yellow-600">
                                        <StarIcon className="w-4 h-4" />
                                        <span className="font-medium">
                                            {typeof project.stars === 'number' ? project.stars.toLocaleString() : project.stars}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">
                                            {typeof project.forks === 'number' ? project.forks.toLocaleString() : project.forks}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </a>
            ))}
        </div>
    );
};
ProjectCardList.propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClearFilters: PropTypes.func,
    containerRef: PropTypes.object
};

export default ProjectCardList;
