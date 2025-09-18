import { useState, useEffect, useCallback } from 'react';
import { searchProjectsWithPagination } from '../api/project-service';

const useProjectPagination = () => {
    // 페이지네이션 상태들
    const [allProjects, setAllProjects] = useState([]);        // 현재 검색의 모든 프로젝트 (최대 30개)
    const [displayedProjects, setDisplayedProjects] = useState([]); // 현재 화면에 표시된 프로젝트 (6개)
    const [currentPage, setCurrentPage] = useState(1);         // 현재 페이지 (1~5)
    
    // 배치 시스템 상태 추가
    const [currentBatch, setCurrentBatch] = useState(1);
    const [canLoadMoreBatches, setCanLoadMoreBatches] = useState(false);
    const [loadingNextBatch, setLoadingNextBatch] = useState(false);
    const [batchHistory, setBatchHistory] = useState({}); // 배치별 데이터 저장
    const [maxBatchReached, setMaxBatchReached] = useState(1); // 도달한 최대 배치 번호
    
    // API 상태들
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    
    // 검색 필터 상태들
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLicense, setSelectedLicense] = useState('');
    const [selectedCommitDate, setSelectedCommitDate] = useState('');
    const [sortBy, setSortBy] = useState('beginner-friendly');
    
    // 설정값들
    const PROJECTS_PER_PAGE = 6;   // 한 번에 표시할 프로젝트 수 (10 → 6)
    const PROJECTS_PER_BATCH = 30; // 한 번에 가져올 프로젝트 수 (50 → 30)
    
    // 계산된 상태들
    const totalPagesInBatch = Math.ceil(allProjects.length / PROJECTS_PER_PAGE);
    const hasMoreInBatch = currentPage < totalPagesInBatch;
    
    // 실제 검색 함수
    const performSearch = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const filters = {
                searchQuery,
                language: selectedLanguage,
                license: selectedLicense,
                timeFilter: selectedCommitDate,
                sortBy,
                limit: PROJECTS_PER_BATCH,
                offset: 0
            };

            // 검색 API 호출
            const result = await searchProjectsWithPagination(
                filters, 
                PROJECTS_PER_BATCH, 
                1
            );
            
            if (result.projects && result.projects.length > 0) {
                setAllProjects(result.projects);
                
                // 🎯 첫 6개만 표시
                const firstPageProjects = result.projects.slice(0, PROJECTS_PER_PAGE);
                setDisplayedProjects(firstPageProjects);
                
                // 📊 상태 초기화
                setCurrentPage(1);
                setCurrentBatch(1);
                setHasSearched(true);
                
                // 배치 히스토리에 저장
                setBatchHistory(prev => ({
                    ...prev,
                    1: result.projects
                }));
                setMaxBatchReached(1);
                
                // 배치 정보 업데이트
                setCanLoadMoreBatches(result.batchInfo?.hasMoreBatches || false);
            } else {
                setAllProjects([]);
                setDisplayedProjects([]);
                setCanLoadMoreBatches(false);
            }
            
        } catch (err) {
            setError(err.message || '검색 중 오류가 발생했습니다.');
            console.error('프로젝트 검색 에러:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, sortBy]);

    // 다음 배치 로딩 함수 추가
    const loadNextBatch = useCallback(async () => {
        if (!canLoadMoreBatches || loadingNextBatch) return;
        
        setLoadingNextBatch(true);
        setError(null);
        
        try {
            const filters = {
                searchQuery,
                language: selectedLanguage,
                license: selectedLicense,
                timeFilter: selectedCommitDate,
                sortBy,
                limit: PROJECTS_PER_BATCH,
                offset: 0
            };

            const nextBatchNumber = currentBatch + 1;

            const result = await searchProjectsWithPagination(
                filters, 
                PROJECTS_PER_BATCH, 
                nextBatchNumber
            );
            
            if (result.projects && result.projects.length > 0) {
                // 새로운 배치로 교체 (기존 데이터 덮어쓰기)
                setAllProjects(result.projects);
                
                // 배치 히스토리에 저장
                setBatchHistory(prev => ({
                    ...prev,
                    [nextBatchNumber]: result.projects
                }));
                setMaxBatchReached(nextBatchNumber);
                
                // 첫 6개 표시
                const firstPageProjects = result.projects.slice(0, PROJECTS_PER_PAGE);
                setDisplayedProjects(firstPageProjects);
                
                // 페이지를 1로 리셋하고 배치 번호 증가
                setCurrentPage(1);
                setCurrentBatch(nextBatchNumber);
                
                // 다음 배치 가능 여부 업데이트
                setCanLoadMoreBatches(result.batchInfo?.hasMoreBatches || false);
            } else {
                setCanLoadMoreBatches(false);
            }
            
        } catch (err) {
            setError(`다음 배치 로딩 실패: ${err.message}`);
            console.error('다음 배치 로딩 에러:', err);
        } finally {
            setLoadingNextBatch(false);
        }
    }, [currentBatch, canLoadMoreBatches, loadingNextBatch, searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, sortBy]);

    // 특정 배치로 이동하는 함수 (히스토리에 있는 배치만 가능)
    const goToBatch = useCallback((batchNumber) => {
        if (batchNumber < 1 || batchNumber > maxBatchReached) {
            return;
        }
        
        const batchData = batchHistory[batchNumber];
        if (!batchData) {
            return;
        }
        
        // 배치 이동 (다음/이전 배치)
        // 배치 데이터 로드
        setAllProjects(batchData);
        setCurrentBatch(batchNumber);
        
        // 첫 페이지로 이동
        setCurrentPage(1);
        const firstPageProjects = batchData.slice(0, PROJECTS_PER_PAGE);
        setDisplayedProjects(firstPageProjects);
    }, [batchHistory, maxBatchReached]);

    // 다음 페이지 이동
    const goToNextPage = useCallback(() => {
        if (!hasMoreInBatch) return;
        
        const nextPage = currentPage + 1;
        const startIndex = (nextPage - 1) * PROJECTS_PER_PAGE;
        const endIndex = startIndex + PROJECTS_PER_PAGE;
        
        const nextPageProjects = allProjects.slice(startIndex, endIndex);
        
        setCurrentPage(nextPage);
        setDisplayedProjects(nextPageProjects);
    }, [currentPage, hasMoreInBatch, allProjects, totalPagesInBatch]);

    // 이전 페이지 이동
    const goToPrevPage = useCallback(() => {
        if (currentPage <= 1) return;
        
        const prevPage = currentPage - 1;
        const startIndex = (prevPage - 1) * PROJECTS_PER_PAGE;
        const endIndex = startIndex + PROJECTS_PER_PAGE;
        
        const prevPageProjects = allProjects.slice(startIndex, endIndex);
        
        setCurrentPage(prevPage);
        setDisplayedProjects(prevPageProjects);
    }, [currentPage, allProjects, totalPagesInBatch]);

    // 특정 페이지 바로 이동
    const goToPage = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPagesInBatch) return;
        
        const startIndex = (pageNumber - 1) * PROJECTS_PER_PAGE;
        const endIndex = startIndex + PROJECTS_PER_PAGE;
        
        const pageProjects = allProjects.slice(startIndex, endIndex);
        
        setCurrentPage(pageNumber);
        setDisplayedProjects(pageProjects);
    }, [allProjects, totalPagesInBatch]);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedLanguage('');
        setSelectedLicense('');
        setSelectedCommitDate('');
        setSortBy('beginner-friendly');
        
        // 📊 페이지네이션 상태도 초기화
        setAllProjects([]);
        setDisplayedProjects([]);
        setCurrentPage(1);
        setCurrentBatch(1);
        setCanLoadMoreBatches(false);
        setBatchHistory({});
        setMaxBatchReached(1);
        setHasSearched(false);
        setError(null);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // 프로젝트 이름, 언어, 라이선스 중 하나 이상이 있어야 검색
            if (searchQuery || selectedLanguage || selectedLicense) {
                performSearch(); // 검색 실행
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, sortBy, performSearch]);

    const filterOptions = {
        languages: [
            { value: '', label: '언어 선택' },
            { value: 'JavaScript', label: 'JavaScript' },
            { value: 'Python', label: 'Python' },
            { value: 'Java', label: 'Java' },
            { value: 'C++', label: 'C++' },
            { value: 'TypeScript', label: 'TypeScript' },
            { value: 'Go', label: 'Go' },
            { value: 'Rust', label: 'Rust' },
            { value: 'React', label: 'React' },
            { value: 'Vue.js', label: 'Vue.js' },
            { value: 'Node.js', label: 'Node.js' }
        ],
        licenses: [
            { value: '', label: '라이선스 선택' },
            { value: 'MIT', label: 'MIT License' },
            { value: 'Apache-2.0', label: 'Apache License 2.0' },
            { value: 'GPL-3.0', label: 'GNU GPL v3.0' },
            { value: 'GPL-2.0', label: 'GNU GPL v2.0' },
            { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
            { value: 'ISC', label: 'ISC License' },
            { value: 'LGPL-3.0', label: 'GNU LGPL v3.0' },
            { value: 'MPL-2.0', label: 'Mozilla Public License 2.0' }
        ],
        commitDates: [
            { value: '', label: '활동 기간 선택' },
            { value: '1week', label: '최근 1주' },
            { value: '1month', label: '최근 1개월' },
            { value: '3months', label: '최근 3개월' },
            { value: '6months', label: '최근 6개월' },
            { value: '1year', label: '최근 1년' },
            { value: 'anytime', label: '전체 기간' }
        ],
        sortOptions: [
            { value: 'beginner-friendly', label: '초보자 친화적' },
            { value: 'stars', label: '인기순 (Stars)' },
            { value: 'updated', label: '최근 업데이트순' },
            { value: 'good-first-issues', label: 'Good First Issues 많은 순' },
            { value: 'easy-contribution', label: '쉬운 기여 (Beginner)' }
        ]
    };


    const activeFiltersCount = [
        searchQuery,
        selectedLanguage,
        selectedLicense,
        selectedCommitDate
    ].filter(Boolean).length;


    return {
        // 데이터 상태
        displayedProjects,           // 현재 화면에 표시되는 6개 프로젝트
        allProjects,                 // 현재 검색의 모든 프로젝트 (최대 30개)
        
        // 페이지네이션 정보
        currentPage,                 // 현재 페이지 (1~5)
        currentBatch,                // 현재 배치 번호
        maxBatchReached,             // 도달한 최대 배치 번호
        totalPagesInBatch,           // 총 페이지 수
        hasMoreInBatch,              // 더 페이지가 있는지
        canLoadMoreBatches,          // 다음 배치 로딩 가능 여부
        
        // 페이지 이동 함수들
        goToNextPage,                // 다음 페이지
        goToPrevPage,                // 이전 페이지  
        goToPage,                    // 특정 페이지로 이동
        loadNextBatch,               // 다음 배치 로딩
        goToBatch,                   // 특정 배치로 이동
        
        // 필터 상태들
        searchQuery,
        selectedLanguage,
        selectedLicense,
        selectedCommitDate,
        sortBy,
        
        // 필터 설정 함수들
        setSearchQuery,
        setSelectedLanguage,
        setSelectedLicense,
        setSelectedCommitDate,
        setSortBy,
        
        // API 상태들
        loading,
        loadingNextBatch,            // 다음 배치 로딩 상태
        error,
        hasSearched,
        
        // 유틸리티
        performSearch,               // 수동 검색 실행
        clearAllFilters,             // 모든 필터 초기화
        filterOptions,               // 드롭다운 옵션들
        activeFiltersCount,          // 활성 필터 개수
        hasActiveFilters: activeFiltersCount > 0,
        
        // 통계 정보
        totalProjectsInBatch: allProjects.length,    // 현재 배치의 총 프로젝트 수
        displayedProjectsCount: displayedProjects.length, // 현재 표시된 프로젝트 수
    };
};

export default useProjectPagination;
