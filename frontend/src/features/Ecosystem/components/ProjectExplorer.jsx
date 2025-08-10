import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Select, Card, Badge, Input, EmptyState, Modal } from '../../../components/common';
import useProjectPagination from '../hooks/useProjectPagination';
import {
    MagnifyingGlassIcon,
    StarIcon,
    CodeBracketIcon,
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const ProjectExplorer = ({ onBack }) => {
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
            console.error('Project search error:', error);
        }
    };

    // 검색 결과 표시 여부 (필터가 적용되거나 검색이 수행되면 true)
    const showSearchResults = hasSearched || hasActiveFilters;

    return (
        <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-8">
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
                                    onChange={setSelectedLanguage}
                                    options={filterOptions.languages}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    라이선스
                                </label>
                                <Select
                                    value={selectedLicense}
                                    onChange={setSelectedLicense}
                                    options={filterOptions.licenses}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    최근 업데이트
                                </label>
                                <Select
                                    value={selectedCommitDate}
                                    onChange={setSelectedCommitDate}
                                    options={filterOptions.commitDates}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    정렬 기준
                                </label>
                                <Select
                                    value={sortBy}
                                    onChange={setSortBy}
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
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            
                            {/* 검색 안내 메시지 - 최근 업데이트만 선택되었을 때만 표시 */}
                            {onlyTimeFilterSelected && (
                                <div className="mt-3 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="font-medium">💡 검색 도움말</p>
                                    <p className="mt-1"><strong>최근 업데이트</strong>는 다른 검색 조건과 함께 사용할 수 있는 필터입니다.</p>
                                    <p className="mt-2 text-xs text-orange-500 bg-orange-100 rounded px-2 py-1">
                                        <strong>검색하려면:</strong> 프로젝트 이름을 검색하시거나 프로그래밍 언어, 라이선스 중 하나 이상을 선택해주세요.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 검색 버튼과 필터 상태 */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button
                                    onClick={handleSearch}
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
                                            onClick={clearAllFilters}
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
                                    {[searchQuery, selectedLanguage, selectedLicense, selectedCommitDate]
                                        .filter(Boolean).length}개 필터 적용됨
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg transition-colors duration-200"
                                    >
                                        ✕ 필터 초기화
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 검색 결과 헤더 */}
                        <div ref={searchResultsRef} className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">검색 결과</h2>
                            <p className="text-gray-600">
                                {displayedProjects.length}개의 프로젝트를 찾았습니다 (배치 {currentBatch}, 페이지 {currentPage}/{totalPagesInBatch})
                            </p>
                        </div>

                        {/* 검색된 프로젝트 목록 */}
                        <div ref={projectCardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {displayedProjects.length > 0 ? (
                                displayedProjects.map((project) => (
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
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <EmptyState
                                        icon="🔍"
                                        title="검색 결과가 없습니다"
                                        description="다른 검색 조건으로 시도해보세요."
                                        action={
                                            <button 
                                                onClick={clearAllFilters}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg transition-colors duration-200"
                                            >
                                                ✕ 필터 초기화
                                            </button>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* 페이지네이션 및 배치 컨트롤 */}
                        {displayedProjects.length > 0 && (
                            <div className="flex flex-col items-center justify-center gap-6 mt-8">
                                {/* 현재 그룹 정보 */}
                                <div className="text-center">
                                    <p className="text-gray-600 text-sm">
                                        그룹 {currentBatch} • 페이지 {currentPage}/{totalPagesInBatch}
                                    </p>
                                </div>
                                
                                {/* 페이지 번호 */}
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        이전
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPagesInBatch }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                className="min-w-[2.5rem]"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    
                                    <Button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!hasMoreInBatch}
                                        variant="outline"
                                        size="sm"
                                    >
                                        다음
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                {/* 5페이지 도달시 간단한 메시지만 */}
                                {!hasMoreInBatch && (
                                    <div className="text-center">
                                        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                                            이 그룹의 모든 프로젝트를 확인했습니다
                                        </p>
                                        
                                        {/* 첫 번째 그룹이고 더 이상 로드할 데이터가 없을 때 */}
                                        {maxBatchReached === 1 && !canLoadMoreBatches && (
                                            <p className="text-gray-500 text-sm mt-2">
                                                🏁 검색 조건에 맞는 모든 프로젝트를 확인했습니다
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* 플로팅 버튼 - 다른 프로젝트가 있을 때 항상 표시 */}
                        {displayedProjects.length > 0 && (maxBatchReached > 1 || canLoadMoreBatches) && (
                            <div className="fixed bottom-6 right-6 z-50">
                                <Button
                                    onClick={() => setIsProjectModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-sm font-medium rounded-full"
                                >
                                    다른 프로젝트 보기
                                </Button>
                            </div>
                        )}
                        
                        {/* 프로젝트 탐색 모달 */}
                        <Modal
                            isOpen={isProjectModalOpen}
                            onClose={() => setIsProjectModalOpen(false)}
                            title="다른 프로젝트 탐색"
                        >
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        프로젝트 그룹 탐색
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        현재 {currentBatch}번째 그룹을 보고 있습니다 • 각 그룹마다 30개의 서로 다른 프로젝트
                                    </p>
                                </div>
                                
                                {/* 그룹 네비게이션 */}
                                <div className="space-y-4">
                                    {/* 현재까지 탐색한 그룹들 */}
                                    {maxBatchReached > 1 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">이미 본 그룹들</h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({ length: maxBatchReached }, (_, i) => i + 1).map((groupNum) => (
                                                    <Button
                                                        key={groupNum}
                                                        onClick={() => {
                                                            goToBatch(groupNum);
                                                            setIsProjectModalOpen(false);
                                                        }}
                                                        variant={currentBatch === groupNum ? "default" : "outline"}
                                                        size="sm"
                                                        className={`${currentBatch === groupNum 
                                                            ? "bg-blue-600 text-white" 
                                                            : "text-gray-700 hover:bg-gray-50"
                                                        } justify-center`}
                                                    >
                                                        그룹 {groupNum}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 새로운 그룹 탐색 */}
                                    {canLoadMoreBatches && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">새로운 프로젝트 발견하기</h4>
                                            <Button
                                                onClick={() => {
                                                    loadNextBatch();
                                                    setIsProjectModalOpen(false);
                                                }}
                                                disabled={loadingNextBatch}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                                            >
                                                {loadingNextBatch ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        새로운 프로젝트 로딩 중...
                                                    </>
                                                ) : (
                                                    <>
                                                        {maxBatchReached + 1}번째 그룹 탐색하기 (30개의 새로운 프로젝트)
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {/* 안내 메시지 */}
                                    <div className="bg-blue-50 rounded-lg p-4 mt-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-blue-500 text-lg">💡</span>
                                            <div>
                                                <p className="text-blue-800 text-sm font-medium mb-1">탐색 팁</p>
                                                <p className="text-blue-700 text-sm">
                                                    각 그룹은 GitHub에서 실시간으로 가져온 서로 다른 프로젝트들입니다. 
                                                    마음에 드는 프로젝트를 찾을 때까지 계속 탐색해보세요!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                )}
            </div>
        </div>
    );
};

ProjectExplorer.propTypes = {
    onBack: PropTypes.func.isRequired
};

export default ProjectExplorer;