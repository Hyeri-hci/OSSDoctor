import React, { useState } from 'react';
import CVEDetailModal from './CVEDetailModal';
import { TimelineContainer } from '../../../components/common';
import { getSeverityColor, getStatusColor } from '../utils/diagnoseUtils';
import { ProjectDataType } from '../types/proTypes';

const SecurityHistory = ({ projectData }) => {
    // 선택된 CVE 정보를 저장하는 상태
    const [selectedCVE, setSelectedCVE] = useState(null);
    // 모달 열림/닫힘 상태를 관리하는 boolean 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 실제 Backend 데이터 사용
    const securityIssues = projectData?.security?.vulnerabilities || [];
    // 날짜별로 보안 이슈 그룹화
    const groupedIssues = securityIssues.reduce((groups, issue) => {
        const date = issue.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(issue);
        return groups;
    }, {});

    // 그룹화된 데이터를 TimelineContainer 형식으로 변환
    const timelineData = Object.entries(groupedIssues).map(([date, issues]) => ({
        date,
        activities: issues
    }));

    // CVE 클릭 핸들러 - 모달 열기
    const handleCVEClick = (cve) => {
        setSelectedCVE(cve);
        setIsModalOpen(true);
    };

    // 모달 닫기 핸들러
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCVE(null);
    };

    // 심각도에 따른 아이콘 반환
    const getSeverityIcon = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical': return '🔴';
            case 'high': return '🟠';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    // 심각도에 따른 배경색 반환
    const getSeverityBackgroundColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'bg-red-50 border-red-200';
            case 'high': return 'bg-orange-50 border-orange-200';
            case 'medium': return 'bg-yellow-50 border-yellow-200';
            case 'low': return 'bg-green-50 border-green-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="p-4 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Repository 보안 이력
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        최근 발견된 보안 취약점과 대응 현황을 확인할 수 있습니다.
                    </p>

                    {/* 데이터가 없을 때 메시지 표시 */}
                    {securityIssues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-6xl mb-4">🛡️</div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                발견된 보안 취약점이 없습니다
                            </h4>
                            <p className="text-sm text-gray-600 max-w-md">
                                현재 이 저장소에서 알려진 CVE 취약점이 발견되지 않았습니다.
                                정기적인 의존성 업데이트를 권장합니다.
                            </p>
                        </div>
                    ) : (
                        /* TimelineContainer 사용 */
                        <TimelineContainer
                            data={timelineData}
                            maxHeight="40rem"
                            renderItem={(issue) => (
                            <div
                                onClick={() => handleCVEClick(issue)}
                                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getSeverityBackgroundColor(issue.severity)}`}
                            >
                                <div className="flex items-start space-x-2">
                                    <div className="flex-shrink-0 mt-1">
                                        <span className="text-sm">{getSeverityIcon(issue.severity)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-xs font-semibold text-gray-900">
                                                    {issue.id}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                                                    {issue.severity}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">{issue.date}</span>
                                        </div>
                                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                                            {issue.title}
                                        </h5>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {issue.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            )}
                        />
                    )}
                </div>

                {/* CVE Detail Modal */}
                <CVEDetailModal
                    cve={selectedCVE}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            </div>
        </div>
    );
};
SecurityHistory.propTypes = {
    projectData: ProjectDataType
};

export default SecurityHistory;
