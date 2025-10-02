import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Layout } from '../../../components/layout';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const InfoPage = () => {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const infoSections = [
        {
            id: 'overview',
            title: 'OSS Doctor 개요',
            icon: '🏠',
            content: {
                description: 'OSS Doctor는 오픈소스 프로젝트의 건강도, 보안성, 소셜 지표를 종합적으로 분석하여 개발자들이 더 나은 오픈소스 생태계를 만들어갈 수 있도록 돕는 플랫폼입니다.',
                features: [
                    '프로젝트 건강도 진단 및 모니터링',
                    '개인 기여 활동 추적 및 관리',
                    '오픈소스 생태계 탐색 및 추천',
                    '커뮤니티 활동 리더보드 제공'
                ]
            }
        },
        {
            id: 'diagnose',
            title: '프로젝트 진단 기능',
            icon: '🔍',
            content: {
                description: 'GitHub 리포지토리를 분석하여 프로젝트의 건강도, 보안성, 소셜 지표를 종합적으로 평가합니다.',
                features: [
                    '건강도 점수 (50%): 커밋, 업데이트, PR, 이슈 해결 현황',
                    '보안 점수 (30%): 보안 취약점 분석 (개발 예정)',
                    '소셜 점수 (20%): 스타, 포크, 워처, 기여자 수',
                    '종합 점수 = (건강도 × 0.5) + (보안 × 0.3) + (소셜 × 0.2)'
                ],
                usage: [
                    'GitHub Repository URL 또는 owner/repo 형식으로 입력',
                    '자동으로 프로젝트 정보 수집 및 분석',
                    '각 영역별 점수와 상세 분석 결과 확인',
                    '프로젝트 개선 방향 파악'
                ]
            }
        },
        {
            id: 'myactivity',
            title: '나의 활동 관리',
            icon: '📊',
            content: {
                description: 'GitHub 계정과 연동하여 개인의 오픈소스 기여 활동을 추적하고 관리할 수 있습니다.',
                features: [
                    '기여 이력 타임라인: 커밋, PR, 이슈 활동 추적',
                    '레벨 시스템: 기여도에 따른 레벨 및 경험치 관리',
                    '뱃지 컬렉션: 다양한 기여 활동에 대한 뱃지 획득',
                    '활동 통계: 월별 기여 추이 및 상세 통계'
                ]
            }
        },
        {
            id: 'ecosystem',
            title: '오픈소스 생태계 탐색',
            icon: '🌍',
            content: {
                description: 'GitHub의 다양한 오픈소스 프로젝트를 탐색하고, 기여하기 좋은 프로젝트를 찾을 수 있습니다.',
                features: [
                    'GraphQL 기반 실시간 프로젝트 검색',
                    '초보자 친화적 프로젝트 필터링',
                    '활동 리더보드: 커뮤니티 기여자 순위',
                    '프로젝트 상세 정보 및 기여 가이드'
                ],
                sorting: [
                    '초보자 친화적: Good First Issues, 프로젝트 크기 종합 분석',
                    '인기순: GitHub Stars 개수 기준 정렬',
                    '최근 업데이트순: 최근 업데이트 + 품질 조건 필터링',
                    'Good First Issues 많은 순: 초보자 이슈 개수 기준',
                    '쉬운 기여: GFI 3개 이상 또는 작은 규모 프로젝트만 선별'
                ],
                filters: [
                    '프로그래밍 언어별 필터링',
                    '라이선스별 필터링',
                    '업데이트 기간별 필터링',
                    '프로젝트 규모별 필터링'
                ]
            }
        },
        {
            id: 'leaderboard',
            title: '활동 리더보드',
            icon: '🏆',
            content: {
                description: '커뮤니티 내에서 활발히 활동하는 기여자들의 순위를 확인할 수 있습니다.',
                features: [
                    '실시간 기여 활동 점수 집계',
                    '기간별 순위 조회 (오늘, 이번 주, 이번 달)',
                    '개인 순위 및 활동 통계 확인',
                    'TOP 3 시상대 시각화'
                ],
                scoring: [
                    'Commits: 커밋 수에 따른 점수',
                    'Pull Requests: 생성한 PR 수',
                    'Issues: 해결한 이슈 수',
                    'Total Score: 종합 활동 점수'
                ]
            }
        },
        {
            id: 'security',
            title: '보안 분석 (개발 예정)',
            icon: '🔒',
            content: {
                description: '프로젝트의 보안 취약점을 분석하고 보안 점수를 제공합니다.',
                plannedFeatures: [
                    'CVE 데이터베이스 연동 취약점 검사',
                    '의존성 보안 분석',
                    '보안 모범 사례 체크',
                    '보안 점수 및 개선 가이드 제공'
                ]
            }
        },
        {
            id: 'api',
            title: 'API 및 기술 스택',
            icon: '⚙️',
            content: {
                description: 'OSS Doctor에서 사용하는 주요 기술과 API 정보입니다.',
                backend: [
                    'Spring Boot 3.x: 메인 백엔드 프레임워크',
                    'GitHub GraphQL API: 프로젝트 정보 수집',
                    'H2/MySQL Database: 사용자 데이터 및 통계 저장',
                    'OAuth 2.0: GitHub 로그인 인증',
                    'Flyway: 데이터베이스 마이그레이션'
                ],
                frontend: [
                    'React 18: 사용자 인터페이스',
                    'Tailwind CSS: 스타일링',
                    'Vite: 빌드 도구',
                    'React Router: 클라이언트 사이드 라우팅',
                    'Heroicons: 아이콘 시스템'
                ]
            }
        }
    ];

    const AccordionItem = ({ section, isOpen, onToggle }) => (
        <div className="bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={onToggle}
                className="w-full px-8 py-6 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <span className="text-lg">{section.icon}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {section.title}
                    </h2>
                </div>
                <div className="flex-shrink-0">
                    {isOpen ? (
                        <ChevronDownIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    ) : (
                        <ChevronRightIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    )}
                </div>
            </button>
            
            {isOpen && (
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-4xl">
                        <p className="text-gray-700 mb-6 leading-relaxed text-base">
                            {section.content.description}
                        </p>
                        
                        {section.content.features && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-blue-500 pl-4">
                                    주요 기능
                                </h3>
                                <div className="grid gap-3">
                                    {section.content.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {section.content.usage && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-green-500 pl-4">
                                    사용 방법
                                </h3>
                                <div className="grid gap-3">
                                    {section.content.usage.map((step, index) => (
                                        <div key={index} className="flex items-start gap-4 p-3 bg-white rounded-lg">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700 leading-relaxed">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {section.content.sorting && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-purple-500 pl-4">
                                    정렬 기준
                                </h3>
                                <div className="grid gap-3">
                                    {section.content.sorting.map((sort, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                            <span className="text-gray-700 leading-relaxed">{sort}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {section.content.filters && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-indigo-500 pl-4">
                                    필터링 옵션
                                </h3>
                                <div className="grid gap-3">
                                    {section.content.filters.map((filter, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                                            <span className="text-gray-700 leading-relaxed">{filter}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {section.content.scoring && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">
                                    점수 산정 기준
                                </h3>
                                <div className="grid gap-3">
                                    {section.content.scoring.map((score, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                            <span className="text-gray-700 leading-relaxed">{score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {section.content.plannedFeatures && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-cyan-500 pl-4">
                                    개발 예정 기능
                                </h3>
                                <div className="grid gap-3">
                                    {section.content.plannedFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <div className="flex-shrink-0 w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {section.content.backend && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-red-500 pl-4">
                                        백엔드 기술
                                    </h3>
                                    <div className="grid gap-3">
                                        {section.content.backend.map((tech, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                                <span className="text-gray-700 leading-relaxed">{tech}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-blue-500 pl-4">
                                        프론트엔드 기술
                                    </h3>
                                    <div className="grid gap-3">
                                        {section.content.frontend.map((tech, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <span className="text-gray-700 leading-relaxed">{tech}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // AccordionItem PropTypes 정의
    AccordionItem.propTypes = {
        section: PropTypes.shape({
            id: PropTypes.string.isRequired,
            icon: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            content: PropTypes.shape({
                description: PropTypes.string.isRequired,
                features: PropTypes.arrayOf(PropTypes.string),
                usage: PropTypes.arrayOf(PropTypes.string),
                badges: PropTypes.arrayOf(PropTypes.string),
                sorting: PropTypes.arrayOf(PropTypes.string),
                filters: PropTypes.arrayOf(PropTypes.string),
                scoring: PropTypes.arrayOf(PropTypes.string),
                plannedFeatures: PropTypes.arrayOf(PropTypes.string),
                backend: PropTypes.arrayOf(PropTypes.string),
                frontend: PropTypes.arrayOf(PropTypes.string)
            }).isRequired
        }).isRequired,
        isOpen: PropTypes.bool.isRequired,
        onToggle: PropTypes.func.isRequired
    };

    AccordionItem.propTypes = {
        section: PropTypes.shape({
            title: PropTypes.string.isRequired,
            content: PropTypes.object.isRequired
        }).isRequired,
        isOpen: PropTypes.bool.isRequired,
        onToggle: PropTypes.func.isRequired
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-12">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                📋 OSS Doctor 이용 가이드
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                OSS Doctor의 모든 기능과 사용 방법을 상세히 안내합니다. <br />
                                각 섹션을 클릭하여 자세한 정보를 확인하세요.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-8">
                    <div className="max-w-4xl mx-auto">
                        {infoSections.map((section) => (
                            <AccordionItem
                                key={section.id}
                                section={section}
                                isOpen={openSections[section.id]}
                                onToggle={() => toggleSection(section.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// PropTypes 정의
InfoPage.propTypes = {};

export default InfoPage;