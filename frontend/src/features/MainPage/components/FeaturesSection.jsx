import React from "react";
import PropTypes from "prop-types";
import { ChartBarIcon, UsersIcon, StartIcon } from "lucide-react";
import { Button, Card } from "../../../components/common";

const FeaturesSection = ({ onDiagnosisClick, onContributionClick, onEcosystemClick }) => {
    const features = [
        {
            title: "프로젝트 상태 점검",
            subtitle: "프로젝트 진단",
            description: "저장소의 건강도 및 보안 상태를 진단하세요.",
            icon: <ChartBarIcon className="w-12 h-12 text-blue-500" />,
            onClick: onDiagnosisClick,
        },
        {
            title: "기여 활동 분석",
            subtitle: "기여도 분석",
            description: "기여 현황과 성장 과정을 한눈에 살펴보세요.",
            icon: <UsersIcon className="w-12 h-12 text-green-500" />,
            onClick: onContributionClick,
        },
        {
            title: "에코시스템 익스플로러",
            subtitle: "생태계 탐색",
            description: "업사이클할 오픈소스를 찾고, 인기 순위를 확인해 보세요.",
            icon: <StartIcon className="w-12 h-12 text-purple-500" />,
            onClick: onEcosystemClick,
        }
    ];

    return (
        <section className="py-16 border-b border-gray-200">
            <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="space-y-4">
                            <h2 className="text-xl md:text-2xl xl:text-3xl font-bold">주요 기능</h2>
                            <p className="text-sm md:text-base xl:text-lg text-gray-600 max-w-2xl mx-auto">
                                오픈소스 활동을 더 풍부하게 만들어 줄 주요 기능들을 살펴보세요.
                            </p>

                            <Button className="mt-6">
                                더 알아보기
                            </Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Desktop version */}
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                onClick={feature.onClick}
                                hover={true}
                                className="hidden md:block"
                                padding="none"
                            >
                                {/* 이미지 홀더 영역 */}
                                <div className="bg-gray-100 aspect-[5/4] rounded-t-lg flex items-center justify-center">
                                    {/* 이미지 들어올 자리 */}
                                </div>

                                {/* 카드 텍스트 콘텐츠 영역 */}
                                <div className="flex flex-col px-3 py-4">
                                    <h3 className="text-xs lg:text-sm mb-2">{feature.title}</h3>
                                    <p className="font-semibold text-xs lg:text-sm mb-2">{feature.description}</p>
                                </div>
                            </Card>
                        ))}

                        {/* Mobile version */}
                        {features.map((feature, index) => (
                            <Card
                                key={`mobile-${index}`}
                                onClick={feature.onClick}
                                hover={true}
                                className="md:hidden"
                            >
                                <div className="flex items-center mb-4">
                                    {feature.icon}
                                    <h3 className="font-semibold ml-3">{feature.title}</h3>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div >
        </section >
    );
};

FeaturesSection.propTypes = {
    onDiagnosisClick: PropTypes.func,
    onContributionClick: PropTypes.func,
    onEcosystemClick: PropTypes.func,
};

export default FeaturesSection;