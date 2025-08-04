import { useState, useMemo } from 'react';

const useProjectFilters = (projects = []) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLicense, setSelectedLicense] = useState('');
    const [selectedCommitDate, setSelectedCommitDate] = useState('');

    const filteredProjects = useMemo(() => {
        if (!projects || projects.length === 0) return [];

        return projects.filter(project => {
            // 검색어 필터링
            const matchesSearch = !searchQuery ||
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes(searchQuery.toLowerCase());

            // 언어 필터링
            const matchesLanguage = !selectedLanguage || project.language === selectedLanguage;

            // 라이선스 필터링
            const matchesLicense = !selectedLicense || project.license === selectedLicense;

            // 커밋 날짜 필터링 (실제 구현 시 날짜 계산 필요)
            const matchesCommitDate = !selectedCommitDate; // TODO: 실제 날짜 필터링 구현

            return matchesSearch && matchesLanguage && matchesLicense && matchesCommitDate;
        });
    }, [projects, searchQuery, selectedLanguage, selectedLicense, selectedCommitDate]);


    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedLanguage('');
        setSelectedLicense('');
        setSelectedCommitDate('');
    };

    const filterOptions = {
        languages: [
            { value: '', label: '언어 선택' },
            { value: 'JavaScript', label: 'JavaScript' },
            { value: 'Python', label: 'Python' },
            { value: 'Java', label: 'Java' },
            { value: 'C++', label: 'C++' },
            { value: 'TypeScript', label: 'TypeScript' },
            { value: 'Go', label: 'Go' },
            { value: 'Rust', label: 'Rust' }
        ],
        licenses: [
            { value: '', label: '라이선스 선택' },
            { value: 'MIT', label: 'MIT' },
            { value: 'Apache-2.0', label: 'Apache 2.0' },
            { value: 'GPL-3.0', label: 'GPL 3.0' },
            { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
            { value: 'ISC', label: 'ISC' }
        ],
        commitDates: [
            { value: '', label: '커밋 날짜 선택' },
            { value: 'week', label: '지난 1주일' },
            { value: 'month', label: '지난 1개월' },
            { value: 'quarter', label: '지난 3개월' },
            { value: 'year', label: '지난 1년' }
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

        // 필터 설정 함수들
        setSearchQuery,
        setSelectedLanguage,
        setSelectedLicense,
        setSelectedCommitDate,

        // 결과 및 유틸리티
        filteredProjects,
        clearAllFilters,
        filterOptions,
        activeFiltersCount,
        hasActiveFilters: activeFiltersCount > 0
    };
};

export default useProjectFilters;
