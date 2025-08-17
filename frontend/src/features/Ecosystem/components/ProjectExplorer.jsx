import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../components/common';
import { ProjectSearchSection, ProjectCardList, SearchResultsHeader, ProjectPagination, ProjectExplorationModal } from './';
import useProjectPagination from '../hooks/useProjectPagination';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ProjectExplorer = ({ onBack, initialSearchQuery = '' }) => {
    // 모달 상태 관리
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // 페이지 상단 참조 (페이지 진입 시 상단 유지용)
    const pageTopRef = useRef(null);
    // 프로젝트 카드 섹션 참조 (페이지네이션 시 스크롤용)
    const projectCardsRef = useRef(null);
    // 검색 결과 섹션 참조 (페이지네이션 시 스크롤용)
    const searchResultsRef = useRef(null);

    const {
        // 페이지네이션 상태
        displayedProjects,
        currentPage,
        currentBatch,
        maxBatchReached,
        totalPagesInBatch,
        hasMoreInBatch,
        canLoadMoreBatches,

        // API 상태
        loading,
        loadingNextBatch,
        error,
        hasSearched,

        // 검색 필터 상태
        searchQuery,
        setSearchQuery,
        selectedLanguage,
        setSelectedLanguage,
        selectedLicense,
        setSelectedLicense,
        selectedCommitDate,
        setSelectedCommitDate,
        sortBy,
        setSortBy,

        // 페이지네이션 액션
        goToPage,
        loadNextBatch,
        goToBatch,

        // 필터 관련
        filterOptions,
        hasActiveFilters,
        clearAllFilters,
        performSearch
    } = useProjectPagination();

    // 컴포넌트 마운트 시 페이지 상단으로 스크롤
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // 초기 검색어 실행 여부를 추적하는 ref
    const hasExecutedInitialSearch = useRef(false);

    // 초기 검색어가 있으면 자동으로 검색 실행 (한 번만)
    useEffect(() => {
        if (initialSearchQuery.trim() && !hasExecutedInitialSearch.current) {
            setSearchQuery(initialSearchQuery);
            hasExecutedInitialSearch.current = true;
            // 검색어가 설정된 후 검색 실행
            setTimeout(() => {
                performSearch();
            }, 100);
        }
    }, [initialSearchQuery, setSearchQuery, performSearch]);

    // 페이지 변경 시 검색 결과 부분으로 스크롤
    const handlePageChange = (page) => {
        goToPage(page);
        // 검색 결과 헤더로 부드럽게 스크롤 (약간의 딜레이로 DOM 업데이트 후 스크롤)
        setTimeout(() => {
            if (searchResultsRef.current) {
                searchResultsRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 100);
    };

    // 검색 가능한 상태인지 확인 (최근 업데이트와 정렬 기준은 제외)
    const canSearch = searchQuery.trim() || selectedLanguage || selectedLicense;

    // 최근 업데이트만 선택된 상황 감지 (실제 검색 조건 없이)
    const onlyTimeFilterSelected = selectedCommitDate && !canSearch;

    // 검색 실행 함수
    const handleSearch = async () => {
        if (!canSearch) {
            alert('검색하려면 프로젝트 이름을 입력하거나 프로그래밍 언어, 라이선스 중 하나 이상을 선택해주세요.');
            return;
        }

        try {
            await performSearch();
        } catch (error) {
            console.error('프로젝트 검색 에러:', error);
        }
    };

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto">
                {/* 페이지 상단 앵커 */}
                <div ref={pageTopRef} className="absolute -top-4" />
                {/* 뒤로가기 버튼 */}
                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="mb-6"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    뒤로가기
                </Button>

                {/* 페이지 제목 */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4">OSS 프로젝트 검색 및 필터링</h1>
                    <p className="text-gray-600 mb-2">
                        기여하고 싶은 오픈소스 프로젝트를 찾아보세요
                    </p>
                    <p className="text-sm text-blue-600">
                        💡 검색하려면 프로그래밍 언어를 선택하거나 프로젝트명을 입력해주세요
                    </p>
                </div>

                {/* 검색 및 필터 섹션 */}
                <ProjectSearchSection
                    searchQuery={searchQuery}
                    selectedLanguage={selectedLanguage}
                    selectedLicense={selectedLicense}
                    selectedCommitDate={selectedCommitDate}
                    sortBy={sortBy}
                    loading={loading}
                    filterOptions={filterOptions}
                    hasActiveFilters={hasActiveFilters}
                    onlyTimeFilterSelected={onlyTimeFilterSelected}
                    onSearchChange={setSearchQuery}
                    onLanguageChange={setSelectedLanguage}
                    onLicenseChange={setSelectedLicense}
                    onCommitDateChange={setSelectedCommitDate}
                    onSortChange={setSortBy}
                    onClearFilters={clearAllFilters}
                    onSearch={handleSearch}
                />

                {/* 에러 메시지 표시 */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="text-red-600 font-medium">검색 중 오류가 발생했습니다</div>
                        </div>
                        <div className="text-red-500 text-sm mt-1">{error}</div>
                    </div>
                )}

                {/* 검색 결과가 있으면 필터링 및 검색 내역 표시 */}
                {hasSearched && (
                    <div className="transition-all duration-300 ease-in-out">
                        {/* 검색 결과 헤더 */}
                        <SearchResultsHeader
                            hasSearched={hasSearched}
                            hasActiveFilters={hasActiveFilters}
                            displayedProjects={displayedProjects}
                            currentPage={currentPage}
                            totalPagesInBatch={totalPagesInBatch}
                            currentBatch={currentBatch}
                            searchQuery={searchQuery}
                            selectedLanguage={selectedLanguage}
                            selectedLicense={selectedLicense}
                            selectedCommitDate={selectedCommitDate}
                            filterOptions={filterOptions}
                            onClearFilters={clearAllFilters}
                            containerRef={searchResultsRef}
                        />

                        {/* 검색된 프로젝트 목록 */}
                                <ProjectCardList
                                    projects={displayedProjects}
                                    onClearFilters={clearAllFilters}
                                    containerRef={projectCardsRef}
                                />

                                {/* 페이지네이션 및 배치 컨트롤 */}
                                <ProjectPagination
                                    displayedProjects={displayedProjects}
                                    currentPage={currentPage}
                                    totalPagesInBatch={totalPagesInBatch}
                                    currentBatch={currentBatch}
                                    maxBatchReached={maxBatchReached}
                                    hasMoreInBatch={hasMoreInBatch}
                                    canLoadMoreBatches={canLoadMoreBatches}
                                    onPageChange={handlePageChange}
                                    onOpenExplorationModal={() => setIsProjectModalOpen(true)}
                                />

                    {/* 프로젝트 탐색 모달 */}
                    <ProjectExplorationModal
                        isOpen={isProjectModalOpen}
                        onClose={() => setIsProjectModalOpen(false)}
                        currentBatch={currentBatch}
                        maxBatchReached={maxBatchReached}
                        canLoadMoreBatches={canLoadMoreBatches}
                        loadingNextBatch={loadingNextBatch}
                        onGoToBatch={goToBatch}
                        onLoadNextBatch={loadNextBatch}
                    />
                </div>
                )}
            </div>
        </div>
    );
};

ProjectExplorer.propTypes = {
    onBack: PropTypes.func.isRequired,
    initialSearchQuery: PropTypes.string
};

export default ProjectExplorer;