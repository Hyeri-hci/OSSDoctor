// 프로젝트 진단, 나의 활동 공통 사용 점수 표시 컴포넌트
import React from 'react';
import PropTypes from 'prop-types';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    StarIcon
} from '@heroicons/react/24/solid';

// 기본 카드 구성 - DiagnosePage에서 사용
const DEFAULT_CARDS_CONFIG = [
    {
        id: 'overview',
        title: '종합 점수',
        scoreKey: 'ovrall',
        color: 'purple',
        icon: CheckCircleIcon,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        activeBorderColor: 'border-purple-500',
        textColor: 'text-purple-700',
        iconColor: 'text-purple-600',
    },
    {
        id: 'health',
        title: '건강 점수',
        scoreKey: 'health',
        color: 'green',
        icon: ShieldCheckIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        activeBorderColor: 'border-green-500',
        textColor: 'text-green-700',
        iconColor: 'text-green-600',
    },
    {
        id: 'security',
        title: '보안 점수',
        scoreKey: 'security',
        color: 'red',
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        activeBorderColor: 'border-red-500',
        textColor: 'text-red-700',
        iconColor: 'text-red-600',
    },
];

// MyActivityPage에서 사용
const MY_ACTIVITY_CARDS_CONFIG = [
    {
        id: 'pr_merged',
        title: '최근 1개월 PR',
        subtitle: 'PR merged 수',
        scoreKey: 'prMerged',
        color: 'blue',
        icon: ChartBarIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        activeBorderColor: 'border-blue-500',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
        graphQLQuery: 'pullRequests { merged }',
        dataType: '코드 기여'
    },
    {
        id: 'issues_created',
        title: '최근 1개월 Issue',
        subtitle: 'Issue 작성 수',
        scoreKey: 'issuesCreated',
        color: 'orange',
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        activeBorderColor: 'border-orange-500',
        textColor: 'text-orange-700',
        iconColor: 'text-orange-600',
        graphQLQuery: 'issues { createdAt }',
        dataType: '문제 발견'
    },
    {
        id: 'reviews_count',
        title: '최근 1개월 Review',
        subtitle: 'Review 수',
        scoreKey: 'reviewsCount',
        color: 'green',
        icon: ShieldCheckIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        activeBorderColor: 'border-green-500',
        textColor: 'text-green-700',
        iconColor: 'text-green-600',
        graphQLQuery: 'contributionsCollection { pullRequestReviewContributions }',
        dataType: '협업 리뷰'
    },
    {
        id: 'repositories_contributed',
        title: '최근 1개월 Commit',
        subtitle: '기여 repository 수',
        scoreKey: 'repositoriesContributed',
        color: 'purple',
        icon: StarIcon,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        activeBorderColor: 'border-purple-500',
        textColor: 'text-purple-700',
        iconColor: 'text-purple-600',
        graphQLQuery: '각 기여에서 repo nameWithOwner distinct count',
        dataType: 'OSS 참여 폭'
    }
];


const ScoreCards = ({
    scores,
    activeTab,
    onTabChange,
    variant = 'diagnose', // 'diagnose' or 'myActivity
    customCards = null
}) => {

    // 기본 점수 설정
    const defaultScores = {
        ovrall: scores.ovrall || 0,
        health: scores.health || 0,
        security: scores.security || 0,
        prMerged: scores.prMerged || 0,
        issuesCreated: scores.issuesCreated || 0,
        reviewsCount: scores.reviewsCount || 0,
        repositoriesContributed: scores.repositoriesContributed || 0
    };


    // 선택된 카드 구성
    let cardsConfig;
    if (customCards) {
        cardsConfig = customCards;
    } else {
        cardsConfig = variant === 'myActivity' ? MY_ACTIVITY_CARDS_CONFIG : DEFAULT_CARDS_CONFIG;
    }

    // grid class 동적 설정
    const gridCols = cardsConfig.length === 3 ? `grid-cols-1 md:grid-cols-${cardsConfig.length}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return (
        <div className={`grid ${gridCols} gap-6`}>
            {cardsConfig.map((card) => {
                const IconComponent = card.icon;
                const isActive = activeTab === card.id;
                const score = defaultScores[card.scoreKey] || 0;

                return (
                    <div
                        key={card.id}
                        onClick={() => onTabChange(card.id)}
                        className={`${card.bgColor} ${isActive ? card.activeBorderColor : card.borderColor} 
              border-2 rounded-lg p-6 text-center relative overflow-hidden cursor-pointer 
              hover:shadow-md transition-all duration-200 ${isActive ? 'shadow-lg' : ''}`}
                    >
                        <div className="absolute top-3 right-3">
                            <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                        <h3 className={`${card.textColor} text-sm font-medium mb-2`}>
                            {card.title}
                        </h3>
                        <div className={`${card.textColor} text-3xl font-bold`}>
                            {score}/100
                        </div>
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

ScoreCards.propTypes = {
    scores: PropTypes.shape({
        ovrall: PropTypes.number,
        health: PropTypes.number,
        security: PropTypes.number,
        prMerged: PropTypes.number,
        issuesCreated: PropTypes.number,
        reviewsCount: PropTypes.number,
        repositoriesContributed: PropTypes.number
    }).isRequired,
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['diagnose', 'myActivity']),
    customCards: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        scoreKey: PropTypes.string.isRequired,
        color: PropTypes.string,
        icon: PropTypes.elementType.isRequired,
        bgColor: PropTypes.string,
        borderColor: PropTypes.string,
        activeBorderColor: PropTypes.string,
        textColor: PropTypes.string,
        iconColor: PropTypes.string,
        graphQLQuery: PropTypes.string,
        dataType: PropTypes.string
    }))
};

export default ScoreCards;