import React from 'react';
import PropTypes from 'prop-types';

/**
 * 검색 결과 헤더 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.hasSearched - 검색 수행 여부
 * @param {boolean} props.hasActiveFilters - 활성화된 필터 여부
 * @param {Array} props.displayedProjects - 표시된 프로젝트 목록
 * @param {number} props.currentPage - 현재 페이지
 * @param {number} props.totalPagesInBatch - 배치 내 총 페이지 수
 * @param {number} props.currentBatch - 현재 배치
 * @param {string} props.searchQuery - 검색 쿼리
 * @param {string} props.selectedLanguage - 선택된 언어
 * @param {string} props.selectedLicense - 선택된 라이선스
 * @param {string} props.selectedCommitDate - 선택된 커밋 날짜
 * @param {Object} props.filterOptions - 필터 옵션들
 * @param {Function} props.onClearFilters - 필터 초기화 핸들러
 * @param {React.Ref} props.containerRef - 컨테이너 참조
 */
const SearchResultsHeader = ({
    hasSearched,
    hasActiveFilters,
    displayedProjects,
    currentPage,
    totalPagesInBatch,
    currentBatch,
    searchQuery,
    selectedLanguage,
    selectedLicense,
    selectedCommitDate,
    filterOptions,
    onClearFilters,
    containerRef
}) => {
    if (!hasSearched && !hasActiveFilters) {
        return null;
    }

    return (
        <div className="mb-8">
            {/* 활성 필터 표시 */}
            {hasActiveFilters && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-800">
                            <strong>활성 필터:</strong> {searchQuery && `"${searchQuery}"`}
                            {selectedLanguage && ` • ${selectedLanguage}`}
                            {selectedLicense && ` • ${selectedLicense}`}
                            {selectedCommitDate && ` • ${filterOptions.commitDates.find(opt => opt.value === selectedCommitDate)?.label}`}
                        </div>
                        <button 
                            onClick={onClearFilters}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg transition-colors duration-200"
                        >
                            ✕ 필터 초기화
                        </button>
                    </div>
                </div>
            )}

            {/* 검색 결과 헤더 */}
            <div ref={containerRef} className="mb-6">
                <h2 className="text-2xl font-bold mb-2">검색 결과</h2>
                <p className="text-gray-600">
                    {displayedProjects.length}개의 프로젝트를 찾았습니다 (배치 {currentBatch}, 페이지 {currentPage}/{totalPagesInBatch})
                </p>
            </div>
        </div>
    );
};

SearchResultsHeader.propTypes = {
    hasSearched: PropTypes.bool.isRequired,
    hasActiveFilters: PropTypes.bool.isRequired,
    displayedProjects: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPagesInBatch: PropTypes.number.isRequired,
    currentBatch: PropTypes.number.isRequired,
    searchQuery: PropTypes.string.isRequired,
    selectedLanguage: PropTypes.string.isRequired,
    selectedLicense: PropTypes.string.isRequired,
    selectedCommitDate: PropTypes.string.isRequired,
    filterOptions: PropTypes.shape({
        commitDates: PropTypes.arrayOf(PropTypes.object).isRequired
    }).isRequired,
    onClearFilters: PropTypes.func.isRequired,
    containerRef: PropTypes.object
};

export default SearchResultsHeader;
