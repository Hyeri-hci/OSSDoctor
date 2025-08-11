import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState, ProjectCard } from '../../../components/common';

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
                <ProjectCard
                    key={project.id}
                    project={project}
                    layout="vertical"
                />
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
