import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Modal, Badge, Button } from '../../../components/common';
import { formatNumber, formatDate, getLanguageColor } from '../utils/ecosystemUtils';
import { 
    StarIcon, 
    CodeBracketIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    CalendarDaysIcon,
    UserIcon,
    LinkIcon
} from '@heroicons/react/24/outline';

/**
 * 프로젝트 상세 정보 모달 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {Object} props.project - 프로젝트 데이터
 */
const ProjectDetailModal = ({ isOpen, onClose, project }) => {
    /**
     * GitHub 페이지 열기
     */
    const handleOpenGitHub = useCallback(() => {
        if (project?.html_url) {
            window.open(project.html_url, '_blank', 'noopener,noreferrer');
        }
    }, [project?.html_url]);

    /**
     * 홈페이지 열기
     */
    const handleOpenHomepage = useCallback(() => {
        if (project?.homepage) {
            window.open(project.homepage, '_blank', 'noopener,noreferrer');
        }
    }, [project?.homepage]);

    if (!project) {
        return null;
    }

    // 데이터 매핑
    const stars = project.stars || project.stargazers_count || 0;
    const forks = project.forks || project.forks_count || 0;
    const watchers = project.watchers || project.watchers_count || 0;
    const openIssues = project.open_issues || project.open_issues_count || 0;
    const language = project.language || 'Unknown';
    const languageColor = getLanguageColor(language);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="max-h-[80vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 break-words">
                                {project.name}
                            </h2>
                            {project.owner && (
                                <p className="text-sm text-gray-600 mt-1">
                                    by {project.owner.login}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {project.homepage && (
                                <Button
                                    onClick={handleOpenHomepage}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    Homepage
                                </Button>
                            )}
                            <Button
                                onClick={handleOpenGitHub}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <CodeBracketIcon className="w-4 h-4" />
                                View on GitHub
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 본문 */}
                <div className="px-6 py-4 space-y-6">
                    {/* 통계 섹션 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <StarIcon className="w-5 h-5 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">Stars</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-900">
                                {formatNumber(stars)}
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CodeBracketIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Forks</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                                {formatNumber(forks)}
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <EyeIcon className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Watchers</span>
                            </div>
                            <div className="text-2xl font-bold text-green-900">
                                {formatNumber(watchers)}
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Issues</span>
                            </div>
                            <div className="text-2xl font-bold text-red-900">
                                {formatNumber(openIssues)}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {project.description}
                            </p>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span 
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: languageColor }}
                                    />
                                    <span className="text-sm text-gray-600">Primary Language:</span>
                                    <span className="font-medium text-gray-900">{language}</span>
                                </div>

                                {project.license && (
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-600">License:</div>
                                        <Badge variant="outline" size="sm">
                                            {project.license.name || project.license}
                                        </Badge>
                                    </div>
                                )}

                                {project.created_at && (
                                    <div className="flex items-center gap-3">
                                        <CalendarDaysIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600">Created:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDate(project.created_at)}
                                        </span>
                                    </div>
                                )}

                                {project.updated_at && (
                                    <div className="flex items-center gap-3">
                                        <CalendarDaysIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600">Last Update:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDate(project.updated_at)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contributor Info */}
                        {project.owner && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner</h3>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {project.owner.avatar_url ? (
                                        <img
                                            src={project.owner.avatar_url}
                                            alt={project.owner.login}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <UserIcon className="w-10 h-10 text-gray-400" />
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {project.owner.login}
                                        </div>
                                        {project.owner.type && (
                                            <Badge variant="outline" size="xs">
                                                {project.owner.type}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Topics */}
                    {project.topics && project.topics.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.topics.map((topic, index) => (
                                    <Badge key={index} variant="secondary" size="sm">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Good First Issues */}
                    {project.goodFirstIssues > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🌟</span>
                                <h3 className="text-lg font-semibold text-green-900">Beginner Friendly!</h3>
                            </div>
                            <p className="text-green-800 text-sm">
                                This project has <strong>{project.goodFirstIssues}</strong> 
                                Good First Issues that beginners can easily contribute to.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            View more details on GitHub
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={onClose} variant="outline" size="sm">
                                Close
                            </Button>
                            <Button onClick={handleOpenGitHub} variant="primary" size="sm">
                                View on GitHub
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

ProjectDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    project: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        html_url: PropTypes.string,
        homepage: PropTypes.string,
        language: PropTypes.string,
        stars: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        stargazers_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        forks: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        forks_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        watchers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        watchers_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        open_issues: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        open_issues_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        license: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                name: PropTypes.string
            })
        ]),
        created_at: PropTypes.string,
        updated_at: PropTypes.string,
        topics: PropTypes.arrayOf(PropTypes.string),
        goodFirstIssues: PropTypes.number,
        owner: PropTypes.shape({
            login: PropTypes.string,
            avatar_url: PropTypes.string,
            type: PropTypes.string
        })
    })
};

export default ProjectDetailModal;
