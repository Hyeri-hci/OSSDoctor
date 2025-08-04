import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Select, Card, Badge, Input, EmptyState } from '../../../components/common';
import useProjectFilters from '../hooks/useProjectFilters';
import {
    CalendarIcon, StarIcon, CodeBracketIcon, ArrowLeftIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ProjectExplorer = ({ onBack }) => {
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loading, setLoading] = useState(false);

    // 목업 프로젝트 데이터 (실제로는 API에서 가져올 데이터)
    const mockProjects = [
        {
            id: 1,
            name: "awesome-react-components",
            description: "A curated list of awesome React components and libraries. Perfect for developers looking to contribute to React ecosystem.",
            lastCommit: "2024-07-20",
            language: "JavaScript",
            stars: "2.1k",
            forks: "320",
            issues: "45",
            license: "MIT",
            difficulty: "Beginner",
            topics: ["react", "components", "ui", "frontend"],
            goodFirstIssues: 12
        },
        {
            id: 2,
            name: "python-data-science",
            description: "Open source data science tools and tutorials for Python. Great for beginners and experienced developers.",
            lastCommit: "2024-07-18",
            language: "Python",
            stars: "1.8k",
            forks: "280",
            issues: "32",
            license: "Apache-2.0",
            difficulty: "Intermediate",
            topics: ["python", "data-science", "machine-learning"],
            goodFirstIssues: 8
        },
        {
            id: 3,
            name: "vue-ui-toolkit",
            description: "Modern Vue.js UI component library with TypeScript support. Looking for contributors to expand components collection.",
            lastCommit: "2024-07-15",
            language: "TypeScript",
            stars: "956",
            forks: "124",
            issues: "18",
            license: "MIT",
            difficulty: "Intermediate",
            topics: ["vue", "typescript", "ui", "components"],
            goodFirstIssues: 5
        },
        {
            id: 4,
            name: "go-microservices",
            description: "Microservices architecture example in Go with Docker and Kubernetes deployment configurations.",
            lastCommit: "2024-07-12",
            language: "Go",
            stars: "743",
            forks: "156",
            issues: "23",
            license: "BSD-3-Clause",
            difficulty: "Advanced",
            topics: ["go", "microservices", "docker", "kubernetes"],
            goodFirstIssues: 3
        }
    ];

    const {
        searchQuery,
        setSearchQuery,
        selectedLanguage,
        setSelectedLanguage,
        selectedLicense,
        setSelectedLicense,
        selectedCommitDate,
        setSelectedCommitDate,
        filteredProjects,
        filterOptions,
        hasActiveFilters,
        clearAllFilters
    } = useProjectFilters(mockProjects);

    // 프로젝트 검색 핸들러
    const handleSearch = async () => {
        setLoading(true);
        try {
            // TODO: 실제 API 호출 구현
            await new Promise(resolve => setTimeout(resolve, 1000)); // 모의 지연
            setShowSearchResults(true);
        } catch (error) {
            console.error('Project search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-8">
            <div className="max-w-7xl mx-auto">
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
                    <p className="text-gray-600">
                        기여하고 싶은 오픈소스 프로젝트를 찾아보세요
                    </p>
                </div>

                {/* 검색 및 필터 섹션 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="space-y-6">
                        {/* 필터 옵션들 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    최근 커밋
                                </label>
                                <Select
                                    value={selectedCommitDate}
                                    onChange={setSelectedCommitDate}
                                    options={filterOptions.commitDates}
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
                        </div>

                        {/* 검색 버튼과 필터 초기화 */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSearch}
                                    variant="primary"
                                    disabled={loading}
                                    className="flex items-center gap-2"
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

                                {hasActiveFilters && (
                                    <Button
                                        onClick={clearAllFilters}
                                        variant="secondary"
                                    >
                                        필터 초기화
                                    </Button>
                                )}
                            </div>

                            {hasActiveFilters && (
                                <div className="text-sm text-gray-600">
                                    {[searchQuery, selectedLanguage, selectedLicense, selectedCommitDate]
                                        .filter(Boolean).length}개 필터 적용됨
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 검색 결과가 있으면 필터링 및 검색 내역 표시 */}
                {showSearchResults && (
                    <div className="mb-8">
                        {/* 활성 필터 표시 */}
                        {hasActiveFilters && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-blue-800">
                                        <strong>활성 필터:</strong> {searchQuery && `"${searchQuery}"`}
                                        {selectedLanguage && ` • ${selectedLanguage}`}
                                        {selectedLicense && ` • ${selectedLicense}`}
                                        {selectedCommitDate && ` • ${selectedCommitDate}`}
                                    </div>
                                    <Button onClick={clearAllFilters} variant="ghost" size="sm">
                                        필터 초기화
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 검색 결과 헤더 */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">검색 결과</h2>
                            <p className="text-gray-600">
                                {filteredProjects.length}개의 프로젝트를 찾았습니다
                            </p>
                        </div>

                        {/* 검색된 프로젝트 목록 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="space-y-4">
                                            {/* 프로젝트 헤더 */}
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                                    <Badge variant="secondary" className="mt-1">
                                                        {project.difficulty}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-yellow-600">
                                                    <StarIcon className="w-4 h-4" />
                                                    {project.stars}
                                                </div>
                                            </div>

                                            {/* 프로젝트 설명 */}
                                            <p className="text-gray-600 text-sm line-clamp-3">
                                                {project.description}
                                            </p>

                                            {/* 프로젝트 메타 정보 */}
                                            <div className="flex flex-wrap gap-2">
                                                {project.topics.slice(0, 3).map((topic) => (
                                                    <Badge key={topic} variant="outline" size="sm">
                                                        {topic}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* 프로젝트 통계 */}
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <CodeBracketIcon className="w-4 h-4" />
                                                        {project.language}
                                                    </span>
                                                    <span>{project.forks} forks</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {new Date(project.lastCommit).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <EmptyState
                                        icon="🔍"
                                        title="검색 결과가 없습니다"
                                        description="다른 검색 조건으로 시도해보세요."
                                        action={
                                            <Button onClick={clearAllFilters} variant="secondary">
                                                필터 초기화
                                            </Button>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 인기 프로젝트 미리보기 (검색 결과가 없거나 검색하기 전에 표시) */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">
                        {showSearchResults ? '다른 인기 프로젝트' : '인기 오픈소스 프로젝트'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {mockProjects.slice(0, 3).map((project) => (
                            <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                            <Badge variant="secondary" className="mt-1">
                                                {project.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                                            <StarIcon className="w-4 h-4" />
                                            {project.stars}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <CodeBracketIcon className="w-4 h-4" />
                                            {project.language}
                                        </span>
                                        <span className="text-green-600">
                                            {project.goodFirstIssues}개 이슈
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

ProjectExplorer.propTypes = {
    onBack: PropTypes.func.isRequired
};

export default ProjectExplorer;