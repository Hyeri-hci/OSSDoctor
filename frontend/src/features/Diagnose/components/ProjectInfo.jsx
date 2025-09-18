import React from "react";
import { StarIcon, CodeBracketIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Badge } from "../../../components/common";
import { getMockProjectInfoData } from '../mockData';

const ProjectInfo = ({ projectData }) => {
    // 실제 데이터가 없으면 Mock 데이터 사용
    const displayData = projectData || getMockProjectInfoData();

    return (
        <div className="bg-white p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
                {/* Project Information */}
                <div className="flex-1 min-w-0">
                    <div className="mb-3">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-lg font-bold text-gray-900 break-words">
                                {displayData.name || displayData.fullName}
                            </h2>
                            <Badge variant="info" size="small">
                                {displayData.license || 'N/A'}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">
                                By {displayData.repository?.owner || displayData.owner?.name || displayData.owner}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-3">
                        {displayData.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-500">
                        <span>Last Push: {displayData.lastPush || displayData.pushedAt}</span>

                        <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            <span>{(displayData.stats?.stars || displayData.stars || 0).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <CodeBracketIcon className="w-4 h-4" />
                            <span>{(displayData.stats?.forks || displayData.forks || 0).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <EyeIcon className="w-3 h-3" />
                            <span>{(displayData.stats?.watchers || displayData.watchers || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* 언어를 쉼표 기준으로 분리하여 각각 표시 */}
                        {displayData.language && displayData.language.split(',').map((lang, index) => (
                            <Badge key={index} variant="secondary" size="small">
                                {lang.trim()}
                            </Badge>
                        ))}

                        {(displayData.topics || []).slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="default" size="small">
                                {topic}
                            </Badge>
                        ))}
                        {(displayData.topics || []).length > 3 && (
                            <Badge variant="outline" size="small">
                                +{(displayData.topics || []).length - 3}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectInfo;