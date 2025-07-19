import React from "react";
import { StarIcon, CodeBracketIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Badge } from "../../../components/common";

const ProjectInfo = () => {
    // Mock Data
    const projectData = {
        name: "react-awesome-project",
        description: "A modern React application with TypeScript, Tailwind CSS, and comprehensive testing suite. This project demonstrates best practices in frontend development including component architecture, state management, and responsive design patterns.",
        owner: {
            name: "awesome-developer",
            avatar: "https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=AD"
        },
        stats: {
            stars: 1247,
            forks: 234,
            watchers: 89
        },
        language: "TypeScript",
        license: "MIT",
        lastPush: "2024-01-15",
        topics: ["react", "typescript", "tailwind", "vite"]
    };

    return (
        <div className="bg-white p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
                {/* Project Image - visible on large screens only */}
                <div className="hidden lg:block lg:flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-gray-400 text-xs text-center">
                            <CodeBracketIcon className="w-8 h-8 mx-auto mb-2" />
                            <span>프로젝트 이미지</span>
                        </div>
                    </div>
                </div>

                {/* Project Information */}
                <div className="flex-1 min-w-0">
                    <div className="mb-3">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-lg font-bold text-gray-900 break-words">
                                {projectData.name}
                            </h2>
                            <Badge variant="info" size="small">
                                {projectData.license}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img
                                    src={projectData.owner.avatar}
                                    alt={`${projectData.owner.name} avatar`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-xs text-gray-600">
                                {projectData.owner.name}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-3">
                        {projectData.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-500">
                        <span>Last Push: {projectData.lastPush}</span>

                        <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            <span>{projectData.stats.stars.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <CodeBracketIcon className="w-4 h-4" />
                            <span>{projectData.stats.forks.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <EyeIcon className="w-3 h-3" />
                            <span>{projectData.stats.watchers.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        
                        <Badge variant="secondary" size="small">
                            {projectData.language}
                        </Badge>

                        {projectData.topics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="default" size="small">
                                {topic}
                            </Badge>
                        ))}
                        {projectData.topics.length > 3 && (
                            <Badge variant="outline" size="small">
                                +{projectData.topics.length - 3}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectInfo;