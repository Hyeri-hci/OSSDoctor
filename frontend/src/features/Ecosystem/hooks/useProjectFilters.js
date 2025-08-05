import { useState, useMemo, useCallback, useEffect } from 'react';
import { searchProjectsService } from '../api/project-service.js';

const useProjectFilters = (initialProjects = []) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLicense, setSelectedLicense] = useState('');
    const [selectedCommitDate, setSelectedCommitDate] = useState('');
    const [sortBy, setSortBy] = useState('beginner-friendly');
    
    // API 호출 관련 상태
    const [projects, setProjects] = useState(initialProjects);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [autoSearch] = useState(true); // 자동 검색 활성화

    // 실제 API 검색 함수
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
                limit: 50
            };

            const result = await searchProjectsService(filters);
            setProjects(result.projects);
            setHasSearched(true);
        } catch (err) {
            setError(err.message || '검색 중 오류가 발생했습니다.');
            console.error('프로젝트 검색 에러:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, sortBy]);

    // 필터가 변경될 때 자동으로 검색 실행 (디바운스 적용)
    useEffect(() => {
        if (!autoSearch) return;

        const timeoutId = setTimeout(() => {
            // 필터가 하나라도 설정되어 있으면 검색 실행
            if (searchQuery || selectedLanguage || selectedLicense || selectedCommitDate) {
                performSearch();
            }
        }, 500); // 500ms 디바운스

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, sortBy, autoSearch, performSearch]);

    // API에서 이미 필터링이 완료되므로 클라이언트 측에서는 단순히 프로젝트 반환
    const filteredProjects = useMemo(() => {
        if (!projects || projects.length === 0) return [];
        
        console.log('클라이언트 측 filteredProjects:', {
            projectsLength: projects.length,
            hasSearched,
            filters: { searchQuery, selectedLanguage, selectedLicense, selectedCommitDate }
        });
        
        // API에서 이미 모든 필터링이 처리되었으므로 그대로 반환
        return projects;
    }, [projects, searchQuery, selectedLanguage, selectedLicense, selectedCommitDate, hasSearched]);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedLanguage('');
        setSelectedLicense('');
        setSelectedCommitDate('');
        setSortBy('beginner-friendly');
        setProjects(initialProjects);
        setHasSearched(false);
        setError(null);
    }, [initialProjects]);

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
            { value: 'week', label: '최근 1주' },
            { value: 'month', label: '최근 1개월' },
            { value: '3months', label: '최근 3개월' },
            { value: '6months', label: '최근 6개월' },
            { value: 'year', label: '최근 1년' },
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
        // 필터 상태
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

        // API 관련 상태
        loading,
        error,
        hasSearched,

        // 결과 및 유틸리티
        filteredProjects,
        clearAllFilters,
        performSearch,
        filterOptions,
        activeFiltersCount,
        hasActiveFilters: activeFiltersCount > 0
    };
};

export default useProjectFilters;
