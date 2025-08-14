// React 훅들을 import - useState로 모달 상태 관리
import React, { useState } from 'react';

// CVE 상세 정보를 표시하는 모달 컴포넌트 import
import CVEDetailModal from './CVEDetailModal';

// 공통 컴포넌트 import
import { TimelineContainer } from '../../../components/common';

// 공통 유틸리티와 타입 import
import { getSeverityColor, getStatusColor } from '../utils/diagnoseUtils';
import { ProjectDataType } from '../types/proTypes';
import { getMockSecurityData } from '../mockData';

/**
 * SecurityHistory 컴포넌트
 * 프로젝트의 보안 취약점 이력을 표시하고 관리하는 컴포넌트입니다.
 * CVE(Common Vulnerabilities and Exposures) 정보를 목록으로 보여주고
 * 클릭 시 상세 모달을 표시합니다.
 */
const SecurityHistory = ({ projectData }) => {
    // 선택된 CVE 정보를 저장하는 상태
    const [selectedCVE, setSelectedCVE] = useState(null);

    // 모달 열림/닫힘 상태를 관리하는 boolean 상태
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 실제 데이터가 없는 경우 mock 데이터 사용
    const securityIssues = projectData?.security?.vulnerabilities || getMockSecurityData();

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

                    {/* TimelineContainer 사용 */}
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
