// Common score display component for project diagnosis and my activity
import React from "react";
import PropTypes from "prop-types";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

// Default card configuration - used by DiagnosePage
const DEFAULT_CARDS_CONFIG = [
  {
    id: "overview",
    title: "Overall Score",
    scoreKey: "totalScore",
    color: "purple",
    icon: CheckCircleIcon,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    activeBorderColor: "border-purple-500",
    textColor: "text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    id: "health",
    title: "Health Score",
    scoreKey: "healthScore",
    color: "green",
    icon: ShieldCheckIcon,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    activeBorderColor: "border-green-500",
    textColor: "text-green-700",
    iconColor: "text-green-600",
  },
  {
    id: "security",
    title: "Security Score",
    scoreKey: "securityScore",
    color: "red",
    icon: ExclamationTriangleIcon,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    activeBorderColor: "border-red-500",
    textColor: "text-red-700",
    iconColor: "text-red-600",
  },
];

// Used by MyActivityPage
const MY_ACTIVITY_CARDS_CONFIG = [
  {
    id: "pr_merged",
    title: "Last Month PRs",
    subtitle: "PRs merged",
    scoreKey: "prMerged",
    color: "blue",
    icon: ChartBarIcon,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    activeBorderColor: "border-blue-500",
    textColor: "text-blue-700",
    iconColor: "text-blue-600",
    graphQLQuery: "pullRequests { merged }",
    dataType: "Code Contribution",
  },
  {
    id: "issues_created",
    title: "Last Month Issues",
    subtitle: "Issues created",
    scoreKey: "issuesCreated",
    color: "orange",
    icon: ExclamationTriangleIcon,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    activeBorderColor: "border-orange-500",
    textColor: "text-orange-700",
    iconColor: "text-orange-600",
    graphQLQuery: "issues { createdAt }",
    dataType: "Issue Discovery",
  },
  {
    id: "reviews_count",
    title: "Last Month Reviews",
    subtitle: "Reviews count",
    scoreKey: "reviewsCount",
    color: "green",
    icon: ShieldCheckIcon,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    activeBorderColor: "border-green-500",
    textColor: "text-green-700",
    iconColor: "text-green-600",
    graphQLQuery: "contributionsCollection { pullRequestReviewContributions }",
    dataType: "Code Review",
  },
  {
    id: "repositories_contributed",
    title: "Last Month Commits",
    subtitle: "Repos contributed",
    scoreKey: "repositoriesContributed",
    color: "purple",
    icon: StarIcon,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    activeBorderColor: "border-purple-500",
    textColor: "text-purple-700",
    iconColor: "text-purple-600",
    graphQLQuery: "Distinct count of repo nameWithOwner from contributions",
    dataType: "OSS Breadth",
  },
];

const getActiveBarColor = (color) => {
  const colorMap = {
    purple: "bg-purple-600",
    green: "bg-green-600",
    red: "bg-red-600",
    blue: "bg-blue-600",
    orange: "bg-orange-600",
  };
  return colorMap[color] || "bg-gray-600";
};

const ScoreCards = ({
  scores,
  activeTab,
  onTabChange,
  variant = "diagnose", // 'diagnose' or 'myActivity
  customCards = null,
}) => {
  // 백엔드 점수 구조에 맞게 점수 매핑
  const defaultScores = {
    // 백엔드에서 totalScore, healthScore, securityScore로 넘어옴
    totalScore: scores?.totalScore || 0,
    healthScore: scores?.healthScore || 0,
    securityScore:
      scores?.securityScore !== undefined ? scores.securityScore : 0, // 백엔드에서 제공하는 보안 점수 사용

    // MyActivity용 점수들
    prMerged: scores?.prMerged || 0,
    issuesCreated: scores?.issuesCreated || 0,
    reviewsCount: scores?.reviewsCount || 0,
    repositoriesContributed: scores?.repositoriesContributed || 0,
  };

  // 선택된 카드 구성
  let cardsConfig;
  if (customCards) {
    cardsConfig = customCards;
  } else {
    cardsConfig =
      variant === "myActivity"
        ? MY_ACTIVITY_CARDS_CONFIG
        : DEFAULT_CARDS_CONFIG;
  }

  // grid class 동적 설정
  const gridCols =
    cardsConfig.length === 3
      ? `grid-cols-3 lg:grid-cols-${cardsConfig.length}`
      : "grid-cols-4 md:grid-cols-4 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-2 sm:gap-3 md:gap-4`}>
      {cardsConfig.map((card) => {
        const isActive = activeTab === card.id;
        const score = defaultScores[card.scoreKey] || 0;

        return (
          <div
            key={card.id}
            onClick={() => onTabChange(card.id)}
            className={`${card.bgColor} ${isActive ? card.activeBorderColor : card.borderColor} 
              border-2 rounded-lg p-3 text-center relative overflow-hidden cursor-pointer 
              hover:shadow-md transition-all duration-200 ${isActive ? "shadow-lg" : ""}`}
          >
            <div
              className={`text-2xl md:text-3xl font-bold ${card.textColor} mb-1 md:mb-2`}
            >
              {score}
            </div>
            <div className={`text-xs md:text-sm ${card.textColor} font-medium`}>
              {card.title}
            </div>
            {isActive && (
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 ${getActiveBarColor(card.color)}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

ScoreCards.propTypes = {
  scores: PropTypes.shape({
    totalScore: PropTypes.number,
    healthScore: PropTypes.number,
    securityScore: PropTypes.number,
    prMerged: PropTypes.number,
    issuesCreated: PropTypes.number,
    reviewsCount: PropTypes.number,
    repositoriesContributed: PropTypes.number,
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["diagnose", "myActivity"]),
  customCards: PropTypes.arrayOf(
    PropTypes.shape({
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
      dataType: PropTypes.string,
    }),
  ),
};

export default ScoreCards;
