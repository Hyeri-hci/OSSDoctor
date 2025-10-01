import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../components/common';

const ScoreGuideModal = ({ isOpen, onClose }) => {
    const healthScores = [
        {
            category: '커밋 점수',
            description: '프로젝트의 전체 커밋 수를 기준으로 계산 (건강도 점수의 25% 반영)',
            thresholds: [
                { min: 1024, score: 25 },
                { min: 512, score: 20 },
                { min: 256, score: 15 },
                { min: 128, score: 10 },
                { min: 64, score: 5 },
                { min: 0, score: 0 }
            ]
        },
        {
            category: '업데이트 점수',
            description: '마지막 업데이트로부터 경과된 일수를 기준으로 계산 (건강도 점수의 25% 반영)',
            thresholds: [
                { max: 7, score: 25, unit: '일 이내' },
                { max: 30, score: 20, unit: '일 이내' },
                { max: 90, score: 15, unit: '일 이내' },
                { max: 180, score: 10, unit: '일 이내' },
                { max: 365, score: 5, unit: '일 이내' },
                { min: 0, score: 0, unit: '일 초과' }
            ]
        },
        {
            category: 'PR 점수',
            description: '병합된 Pull Request 수를 기준으로 계산 (건강도 점수의 25% 반영)',
            thresholds: [
                { min: 512, score: 25 },
                { min: 256, score: 20 },
                { min: 128, score: 15 },
                { min: 64, score: 10 },
                { min: 32, score: 5 },
                { min: 0, score: 0 }
            ]
        },
        {
            category: '이슈 점수',
            description: '해결된 이슈 수를 기준으로 계산 (건강도 점수의 25% 반영)',
            thresholds: [
                { min: 512, score: 25 },
                { min: 256, score: 20 },
                { min: 128, score: 15 },
                { min: 64, score: 10 },
                { min: 32, score: 5 },
                { min: 0, score: 0 }
            ]
        }
    ];

    const socialScores = [
        {
            category: '스타 점수',
            description: '프로젝트가 받은 Star 수를 기준으로 계산 (소셜 점수의 25% 반영)',
            thresholds: [
                { min: 1024, score: 25 },
                { min: 512, score: 20 },
                { min: 256, score: 15 },
                { min: 128, score: 10 },
                { min: 64, score: 5 },
                { min: 0, score: 0 }
            ]
        },
        {
            category: '포크 점수',
            description: 'Fork 된 횟수를 기준으로 계산 (소셜 점수의 25% 반영)',
            thresholds: [
                { min: 256, score: 25 },
                { min: 128, score: 20 },
                { min: 64, score: 15 },
                { min: 32, score: 10 },
                { min: 16, score: 5 },
                { min: 0, score: 0 }
            ]
        },
        {
            category: '워처 점수',
            description: '프로젝트를 지켜보는 사용자 수를 기준으로 계산 (소셜 점수의 25% 반영)',
            thresholds: [
                { min: 128, score: 25 },
                { min: 64, score: 20 },
                { min: 32, score: 15 },
                { min: 16, score: 10 },
                { min: 8, score: 5 },
                { min: 0, score: 0 }
            ]
        },
        {
            category: '기여자 점수',
            description: '프로젝트에 기여한 총 기여자 수를 기준으로 계산 (소셜 점수의 25% 반영)',
            thresholds: [
                { min: 128, score: 25 },
                { min: 64, score: 20 },
                { min: 32, score: 15 },
                { min: 16, score: 10 },
                { min: 8, score: 5 },
                { min: 0, score: 0 }
            ]
        }
    ];

    const ScoreTable = ({ title, scores }) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-4">
                {scores.map((scoreItem, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">{scoreItem.category}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{scoreItem.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {scoreItem.thresholds.map((threshold, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span className="text-gray-700">
                                        {threshold.max 
                                            ? `${threshold.max}${threshold.unit || '개'} 이하`
                                            : threshold.min > 0 
                                                ? `${threshold.min}개 이상`
                                                : '그 외'
                                        }
                                    </span>
                                    <span className={`font-medium ${
                                        threshold.score >= 20 ? 'text-green-600' :
                                        threshold.score >= 15 ? 'text-blue-600' :
                                        threshold.score >= 10 ? 'text-yellow-600' :
                                        threshold.score >= 5 ? 'text-orange-600' :
                                        'text-red-600'
                                    }`}>
                                        {threshold.score}점
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    ScoreTable.propTypes = {
        title: PropTypes.string.isRequired,
        scores: PropTypes.arrayOf(PropTypes.shape({
            category: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            thresholds: PropTypes.arrayOf(PropTypes.shape({
                min: PropTypes.number,
                max: PropTypes.number,
                score: PropTypes.number.isRequired,
                unit: PropTypes.string
            })).isRequired
        })).isRequired
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="점수 체계 가이드"
            size="large"
            className="max-h-[80vh] overflow-y-auto"
        >
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">점수 체계 안내</h3>
                    <p className="text-sm text-blue-700 mb-3">
                        OSS Doctor는 프로젝트의 건강도와 인기도를 다양한 지표로 평가합니다. 
                        각 항목은 0~25점 범위에서 측정되며, 높은 점수일수록 더 활발하고 건강한 프로젝트임을 의미합니다.
                    </p>
                    <div className="bg-white border border-blue-200 rounded p-3">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">📊 점수 구성</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• <strong>건강도 점수 (50%)</strong>: 커밋, 업데이트, PR, 이슈 각 25점씩 (총 100점)</li>
                            <li>• <strong>보안 점수 (30%)</strong>: 취약점 분석 기반 (총 100점, 개발 예정)</li>
                            <li>• <strong>소셜 점수 (20%)</strong>: 스타, 포크, 워처, 기여자 각 25점씩 (총 100점)</li>
                            <li>• <strong>종합 점수 = (건강도 × 0.5) + (보안 × 0.3) + (소셜 × 0.2)</strong></li>
                        </ul>
                    </div>
                </div>

                <ScoreTable title="🏥 건강도 점수 (50%)" scores={healthScores} />
                <ScoreTable title="👥 소셜 점수 (20%)" scores={socialScores} />

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">🔒 보안 점수 (30%)</h3>
                    <p className="text-sm text-gray-600">
                        보안 취약점 분석 및 점수 체계는 현재 개발 중입니다. 
                        추후 업데이트를 통해 제공될 예정입니다.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">💡 점수 활용 팁</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 총 점수가 높을수록 활발하고 신뢰할 수 있는 프로젝트입니다</li>
                        <li>• 업데이트 점수가 낮다면 프로젝트가 비활성 상태일 수 있습니다</li>
                        <li>• 기여자 수와 PR/이슈 해결 수는 커뮤니티 활성도를 나타냅니다</li>
                        <li>• Star와 Fork 수는 프로젝트의 인기도와 유용성을 반영합니다</li>
                    </ul>
                </div>

                {/* 닫기 버튼 */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        이해했습니다
                    </button>
                </div>
            </div>
        </Modal>
    );
};

ScoreGuideModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ScoreGuideModal;