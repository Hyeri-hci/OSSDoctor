import { useState, useEffect, useCallback } from 'react';
import { searchProjectsWithPagination } from '../api/project-service';

const useProjectPagination = () => {
    // 페이지네이션 상태들
    const [allProjects, setAllProjects] = useState([]);        // 현재 검색의 모든 프로젝트 (최대 50개)
    const [displayedProjects, setDisplayedProjects] = useState([]); // 현재 화면에 표시된 프로젝트 (10개)
    const [currentPage, setCurrentPage] = useState(1);         // 현재 페이지 (1~5)
    
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
    const PROJECTS_PER_PAGE = 10;  // 한 번에 표시할 프로젝트 수
    const PROJECTS_PER_BATCH = 50; // 한 번에 가져올 프로젝트 수
    
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

            console.log(`🔍 검색 실행`, filters);

            // 검색 API 호출
            const result = await searchProjectsWithPagination(
                filters, 
                PROJECTS_PER_BATCH, 
                1
            );
            
            if (result.projects && result.projects.length > 0) {
                setAllProjects(result.projects);
                
                // 🎯 첫 10개만 표시
                const firstPageProjects = result.projects.slice(0, PROJECTS_PER_PAGE);
                setDisplayedProjects(firstPageProjects);
                
                // 📊 상태 초기화
                setCurrentPage(1);
                setHasSearched(true);
                
                console.log(`✅ 검색 완료: ${result.projects.length}개 프로젝트 로드, ${firstPageProjects.length}개 표시`);
            } else {
                setAllProjects([]);
                setDisplayedProjects([]);
                console.log('📭 검색 결과 없음');
            }
            
        } catch (err) {
            setError(err.message || '검색 중 오류가 발생했습니다.');
            console.error('🔍 프로젝트 검색 에러:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, sortBy]);

    // 다음 페이지 이동
    const goToNextPage = useCallback(() => {
        if (!hasMoreInBatch) return;
        
        const nextPage = currentPage + 1;
        const startIndex = (nextPage - 1) * PROJECTS_PER_PAGE;
        const endIndex = startIndex + PROJECTS_PER_PAGE;
        
        const nextPageProjects = allProjects.slice(startIndex, endIndex);
        
        setCurrentPage(nextPage);
        setDisplayedProjects(nextPageProjects);
        
        console.log(`📄 페이지 이동: ${nextPage}/${totalPagesInBatch} (${nextPageProjects.length}개 표시)`);
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
        
        console.log(`📄 페이지 이동: ${prevPage}/${totalPagesInBatch} (${prevPageProjects.length}개 표시)`);
    }, [currentPage, allProjects, totalPagesInBatch]);

    // 특정 페이지 바로 이동
    const goToPage = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPagesInBatch) return;
        
        const startIndex = (pageNumber - 1) * PROJECTS_PER_PAGE;
        const endIndex = startIndex + PROJECTS_PER_PAGE;
        
        const pageProjects = allProjects.slice(startIndex, endIndex);
        
        setCurrentPage(pageNumber);
        setDisplayedProjects(pageProjects);
        
        console.log(`📄 페이지 이동: ${pageNumber}/${totalPagesInBatch} (${pageProjects.length}개 표시)`);
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
        setHasSearched(false);
        setError(null);
        
        console.log('🧹 모든 필터 및 페이지네이션 초기화');
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // 프로젝트 이름, 언어, 라이선스 중 하나 이상이 있어야 검색
            if (searchQuery || selectedLanguage || selectedLicense) {
                console.log('⚡ 자동 검색 실행 (디바운스 0.5초 후)');
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
            { value: 'good-first-issues', label: '기여 이슈 많은 순' },
            { value: 'stars', label: '인기순 (Stars)' },
            { value: 'recently-active', label: '최근 활발한 순' },
            { value: 'created', label: '생성일순' }
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
        displayedProjects,           // 현재 화면에 표시되는 10개 프로젝트
        allProjects,                 // 현재 검색의 모든 프로젝트 (최대 50개)
        
        // 페이지네이션 정보
        currentPage,                 // 현재 페이지 (1~5)
        totalPagesInBatch,           // 총 페이지 수
        hasMoreInBatch,              // 더 페이지가 있는지
        
        // 페이지 이동 함수들
        goToNextPage,                // 다음 페이지
        goToPrevPage,                // 이전 페이지  
        goToPage,                    // 특정 페이지로 이동
        
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
