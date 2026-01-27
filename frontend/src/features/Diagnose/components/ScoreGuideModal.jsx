import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../components/common';

const ScoreGuideModal = ({ isOpen, onClose }) => {
    const healthScores = [
        {
            category: 'Commit Score',
            description: 'Calculated based on total commits (25% of Health Score)',
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
            category: 'Update Score',
            description: 'Calculated based on days since last update (25% of Health Score)',
            thresholds: [
                { max: 7, score: 25, unit: ' days' },
                { max: 30, score: 20, unit: ' days' },
                { max: 90, score: 15, unit: ' days' },
                { max: 180, score: 10, unit: ' days' },
                { max: 365, score: 5, unit: ' days' },
                { min: 0, score: 0, unit: ' days+' }
            ]
        },
        {
            category: 'PR Score',
            description: 'Calculated based on merged Pull Requests (25% of Health Score)',
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
            category: 'Issue Score',
            description: 'Calculated based on resolved issues (25% of Health Score)',
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
            category: 'Star Score',
            description: 'Calculated based on the number of Stars received by the project (25% of Social Score)',
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
            category: 'Fork Score',
            description: 'Calculated based on the number of times the project has been forked (25% of Social Score)',
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
            category: 'Watcher Score',
            description: 'Calculated based on the number of users watching the project (25% of Social Score)',
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
            category: 'Contributor Score',
            description: 'Calculated based on the total number of contributors to the project (25% of Social Score)',
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
                                            ? `${threshold.max}${threshold.unit || ''} or less`
                                            : threshold.min > 0 
                                                ? `${threshold.min}+ `
                                                : 'Other'
                                        }
                                    </span>
                                    <span className={`font-medium ${
                                        threshold.score >= 20 ? 'text-green-600' :
                                        threshold.score >= 15 ? 'text-blue-600' :
                                        threshold.score >= 10 ? 'text-yellow-600' :
                                        threshold.score >= 5 ? 'text-orange-600' :
                                        'text-red-600'
                                    }`}>
                                        {threshold.score} pts
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
            title="Scoring System Guide"
            size="large"
            className="max-h-[80vh] overflow-y-auto"
        >
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">About the Scoring System</h3>
                    <p className="text-sm text-blue-700 mb-3">
                        OSS Doctor evaluates project health and popularity using various metrics. 
                        Each item is measured on a scale of 0-25 points, and higher scores indicate a more active and healthy project.
                    </p>
                    <div className="bg-white border border-blue-200 rounded p-3">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">📊 Score Composition</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• <strong>Health Score (50%)</strong>: Commits, Updates, PRs, Issues - 25 pts each (100 pts total)</li>
                            <li>• <strong>Security Score (30%)</strong>: Vulnerability analysis based (100 pts total, coming soon)</li>
                            <li>• <strong>Social Score (20%)</strong>: Stars, Forks, Watchers, Contributors - 25 pts each (100 pts total)</li>
                            <li>• <strong>Total Score = (Health × 0.5) + (Security × 0.3) + (Social × 0.2)</strong></li>
                        </ul>
                    </div>
                </div>

                <ScoreTable title="🏥 Health Score (50%)" scores={healthScores} />
                <ScoreTable title="👥 Social Score (20%)" scores={socialScores} />

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">🔒 Security Score (30%)</h3>
                    <p className="text-sm text-gray-600">
                        Security vulnerability analysis and scoring system is currently under development. 
                        It will be provided in a future update.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">💡 Score Usage Tips</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Higher total scores indicate more active and reliable projects</li>
                        <li>• Low update scores may indicate an inactive project</li>
                        <li>• Number of contributors and PR/Issue resolutions indicate community activity</li>
                        <li>• Star and Fork counts reflect project popularity and usefulness</li>
                    </ul>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Got it
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