import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select } from '../../../components/common';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { SortingGuideModal } from './index';

/**
 * 프로젝트 검색 섹션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.searchQuery - 검색어
 * @param {string} props.selectedLanguage - 선택된 언어
 * @param {string} props.selectedLicense - 선택된 라이선스
 * @param {string} props.selectedCommitDate - 선택된 커밋 날짜
 * @param {string} props.sortBy - 정렬 기준
 * @param {boolean} props.loading - 로딩 상태
 * @param {Object} props.filterOptions - 필터 옵션들
 * @param {boolean} props.hasActiveFilters - 활성화된 필터 여부
 * @param {number} props.activeFiltersCount - 활성화된 필터 개수
 * @param {boolean} props.onlyTimeFilterSelected - 시간 필터만 선택된 상태
 * @param {Function} props.onSearchChange - 검색어 변경 핸들러
 * @param {Function} props.onLanguageChange - 언어 변경 핸들러
 * @param {Function} props.onLicenseChange - 라이선스 변경 핸들러
 * @param {Function} props.onCommitDateChange - 커밋 날짜 변경 핸들러
 * @param {Function} props.onSortChange - 정렬 변경 핸들러
 * @param {Function} props.onClearFilters - 필터 초기화 핸들러
 * @param {Function} props.onSearch - 검색 실행 핸들러
 */
const ProjectSearchSection = ({
    searchQuery,
    selectedLanguage,
    selectedLicense,
    selectedCommitDate,
    sortBy,
    loading,
    filterOptions,
    hasActiveFilters,
    activeFiltersCount,
    onlyTimeFilterSelected,
    onSearchChange,
    onLanguageChange,
    onLicenseChange,
    onCommitDateChange,
    onSortChange,
    onClearFilters,
    onSearch
}) => {
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

    const handleGuideModalOpen = () => {
        setIsGuideModalOpen(true);
    };

    const handleGuideModalClose = () => {
        setIsGuideModalOpen(false);
    };

    // 로컬 검색어 변경 처리
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="space-y-6">
                {/* 필터 옵션들 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            프로그래밍 언어
                        </label>
                        <Select
                            value={selectedLanguage}
                            onChange={onLanguageChange}
                            options={filterOptions.languages}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            라이선스
                        </label>
                        <Select
                            value={selectedLicense}
                            onChange={onLicenseChange}
                            options={filterOptions.licenses}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            최근 업데이트
                        </label>
                        <Select
                            value={selectedCommitDate}
                            onChange={onCommitDateChange}
                            options={filterOptions.commitDates}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                정렬 기준
                            </label>
                            <button
                                onClick={handleGuideModalOpen}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="정렬 기준 가이드"
                            >
                                <QuestionMarkCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <Select
                            value={sortBy}
                            onChange={onSortChange}
                            options={filterOptions.sortOptions}
                        />
                    </div>
                </div>

                {/* 검색창 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        프로젝트 검색
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="프로젝트 이름 또는 설명으로 검색"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* 검색 안내 메시지 - 최근 업데이트만 선택되었을 때만 표시 */}
                    <div className="mt-3 min-h-0 transition-all duration-200">
                        {onlyTimeFilterSelected && (
                            <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="font-medium">💡 검색 도움말</p>
                                <p className="mt-1"><strong>최근 업데이트</strong>는 다른 검색 조건과 함께 사용할 수 있는 필터입니다.</p>
                                <p className="mt-2 text-xs text-orange-500 bg-orange-100 rounded px-2 py-1">
                                    <strong>검색하려면:</strong> 프로젝트 이름을 검색하시거나 프로그래밍 언어, 라이선스 중 하나 이상을 선택해주세요.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 검색 버튼과 필터 상태 */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            onClick={onSearch}
                            variant="primary"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    검색중...
                                </>
                            ) : (
                                <>
                                    <MagnifyingGlassIcon className="w-4 h-4" />
                                    프로젝트 검색
                                </>
                            )}
                        </Button>

                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={onClearFilters}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors duration-200 whitespace-nowrap"
                                >
                                    ✕ 필터 초기화
                                </button>
                            )}
                            
                            {!loading && hasActiveFilters && (
                                <div className="text-sm text-green-600 whitespace-nowrap flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    필터 적용됨
                                </div>
                            )}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="text-sm text-gray-600 text-center sm:text-right">
                            {activeFiltersCount}개 필터 적용됨
                        </div>
                    )}
                </div>
            </div>

            {/* 정렬 기준 가이드 모달 */}
            <SortingGuideModal 
                isOpen={isGuideModalOpen}
                onClose={handleGuideModalClose}
            />
        </div>
    );
};
ProjectSearchSection.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    selectedLanguage: PropTypes.string.isRequired,
    selectedLicense: PropTypes.string.isRequired,
    selectedCommitDate: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    filterOptions: PropTypes.shape({
        languages: PropTypes.array.isRequired,
        licenses: PropTypes.array.isRequired,
        commitDates: PropTypes.array.isRequired,
        sortOptions: PropTypes.array.isRequired
    }).isRequired,
    hasActiveFilters: PropTypes.bool.isRequired,
    activeFiltersCount: PropTypes.number.isRequired,
    onlyTimeFilterSelected: PropTypes.bool.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onLanguageChange: PropTypes.func.isRequired,
    onLicenseChange: PropTypes.func.isRequired,
    onCommitDateChange: PropTypes.func.isRequired,
    onSortChange: PropTypes.func.isRequired,
    onClearFilters: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired
};

export default ProjectSearchSection;
