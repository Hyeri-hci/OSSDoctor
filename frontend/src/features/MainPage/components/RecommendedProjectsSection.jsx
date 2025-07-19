import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Badge } from '../../../components/common';
import { CalendarIcon, StarIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const RecommendedProjectsSection = ({ projects = [] }) => {

    const defaultProjects = [
        {
            name: "React",
            description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
            lastCommit: "2023-10-01",
            language: "JavaScript",
            stars: "210k",
            forks: "45k",
            issues: "1.2k",
        },
        {
            name: "Vue.js",
            description: "The Progressive JavaScript Framework for building user interfaces.",
            lastCommit: "2023-09-28",
            language: "TypeScript",
            stars: "200k",
            forks: "40k",
            issues: "800",
        },
        {
            name: "TensorFlow",
            description: "An end-to-end open source platform for machine learning.",
            lastCommit: "2023-09-30",
            language: "Python",
            stars: "170k",
            forks: "90k",
            issues: "5k",
        }
    ];

    const dispalyProjects = projects.length > 0 ? projects : defaultProjects;

    return (
        <section className="py-16">
            <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="space-y-2 flex-1">
                            <h2 className="text-xl md:text-2xl xl:text-3xl font-bold">추천 프로젝트</h2>
                            <p className="text-sm md:text-base xl:text-lg text-gray-600">지금 활발한 오픈소스 프로젝트를 탐색해 보세요.</p>
                        </div>

                        <Button
                            className="flex-shrink-0 mt-1"
                            size="default"
                            onClick={() => window.location.href = '/ecosystem'}
                        >
                            더 보기
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {dispalyProjects.map((project, index) => (
                            <Card key={index} hover={true} padding="default" className="transition-shadow">
                                {/* Desktop row & Mobile row */}
                                <div className="flex flex-col md:flex-row gap-4">

                                    {/* Project Image - Desktop */}
                                    <div className="hidden md:flex bg-gray-200 w-24 h-24 rounded items-center justify-center flex-shrink-0">
                                        {/* 추후 이미지 삽입 */}
                                    </div>

                                    {/* Project Information */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 truncate">{project.name}</h3>
                                        <p className="text-gray-600 text-sm sm:text-base mb-4 overflow-hidden text-ellipsis"
                                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {project.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                                            {/* Last Commit */}
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{project.lastCommit}</span>
                                            </div>
                                            {/* Stars */}
                                            <div className="flex items-center gap-1">
                                                <StarIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{project.stars} Stars</span>
                                            </div>
                                            {/* Forks */}
                                            <div className="flex items-center gap-1">
                                                <CodeBracketIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{project.forks} Forks</span>
                                            </div>

                                            {/* Language */}
                                            <Badge variant="secondary" size="small">{project.language}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

RecommendedProjectsSection.propTypes = {
    // array of project objects
    projects: PropTypes.arrayOf(
        PropTypes.shape({
            // project properties (Required fields)
            name: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            lastCommit: PropTypes.string.isRequired,
            language: PropTypes.string.isRequired,
            stars: PropTypes.number.isRequired,
            forks: PropTypes.number.isRequired
        })),
        // projects 자체는 필수로 두지 않음 - 기본값([])을 제공하기 때문
};

export default RecommendedProjectsSection;