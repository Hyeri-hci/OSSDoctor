import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../components/common';

const CVEDetailModal = ({ cve, isOpen, onClose, position }) => {
    if (!cve) return null;

    const getModalPosition = () => {
        if (position) return position;
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024 ? 'right' : 'center';
        }
        return 'center';
    };

    // 심각도별 색상 반환 함수
    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'text-red-800 bg-red-100';
            case 'high':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-orange-600 bg-orange-50';
            case 'low':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    // 상태별 색상 반환 함수
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'fixed':
            case 'patched':
                return 'text-green-600 bg-green-50';
            case 'investigating':
                return 'text-yellow-600 bg-yellow-50';
            case 'received':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    // 모달 제목
    const modalTitle = (
        <div className="flex items-center space-x-2">
            <span className="text-lg">🛡️</span>
            <span>{cve.id} Detail</span>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="lg"
            position={getModalPosition()}
            className={getModalPosition() === 'right' ? "mr-4" : ""}
        >
            <div className="space-y-4">
                {/* Status and Severity */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cve.status)}`}>
                        {cve.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(cve.severity)}`}>
                        {cve.severity} (CVSS {cve.cvss})
                    </span>
                </div>

                {/* Title and Description */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{cve.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{cve.description}</p>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <span className="text-xs text-gray-600">발견일:</span>
                        <span className="ml-2 text-sm font-medium">{cve.date}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-600">대응일:</span>
                        <span className="ml-2 text-sm font-medium">{cve.date}</span>
                    </div>
                </div>

                {/* Affected Versions */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">영향받는 버전</h4>
                    <div className="flex flex-wrap gap-1">
                        {cve.versions.map((version, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-mono"
                            >
                                OpenSSL {version}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CVSS Metrics */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">CVSS 메트릭</h4>
                    <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            CVSS Version 4.0
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            CVSS Version 3.x
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            CVSS Version 2.8
                        </span>
                    </div>

                    <div className="text-xs text-gray-600 mb-3">
                        NVD enrichment efforts reference publicly available information to associate vector strings,
                        CVE information contributed by other sources is also displayed.
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <div className="font-semibold text-xs text-gray-900 mb-1">
                            CVSS {cve.cvss} Severity and Vector Strings:
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="bg-yellow-100 px-1 py-0.5 rounded text-xs font-mono">V4</span>
                            <span className="text-xs font-mono">NIST: NVD</span>
                            <span className="bg-gray-100 px-1 py-0.5 rounded text-xs">N/A</span>
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                {cve.technicalDetails && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">기술적 세부사항</h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {cve.technicalDetails}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Mitigation */}
                {cve.mitigation && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">완화 방법</h4>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-xs text-green-800">{cve.mitigation}</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

CVEDetailModal.propTypes = {
    cve: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        severity: PropTypes.string.isRequired,
        cvss: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        versions: PropTypes.arrayOf(PropTypes.string).isRequired,
        technicalDetails: PropTypes.string,
        mitigation: PropTypes.string
    }),
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    position: PropTypes.string
};

export default CVEDetailModal;
