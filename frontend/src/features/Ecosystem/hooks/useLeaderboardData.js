import { useState, useMemo } from "react";

/**
 * 리더보드 데이터를 관리하는 훅
 * @param {string} timePeriod - 리더보드 데이터의 시간 범위 ('realtime', 'weekly', 'monthly')
 * @return {Object} 리더보드 데이터와 관련된 함수들
 */

const useLeaderboardData = (timePeriod = 'realtime') => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

   const mockLeaderboardData = {
    realtime: [
      {
        rank: 1,
        username: "User1",
        avatar: null,
        totalScore: 2500,
        prCount: 145,
        issueCount: 67,
        commitsCount: 432,
        contributionStreak: 89,
        joinDate: "2023-01-15"
      },
      {
        rank: 2,
        username: "User2",
        avatar: null,
        totalScore: 2100,
        prCount: 98,
        issueCount: 45,
        commitsCount: 356,
        contributionStreak: 67,
        joinDate: "2023-03-20"
      },
      {
        rank: 3,
        username: "User3",
        avatar: null,
        totalScore: 1850,
        prCount: 76,
        issueCount: 38,
        commitsCount: 289,
        contributionStreak: 45,
        joinDate: "2023-02-10"
      },
      {
        rank: 4,
        username: "User4",
        avatar: null,
        totalScore: 1650,
        prCount: 54,
        issueCount: 89,
        commitsCount: 234,
        contributionStreak: 34,
        joinDate: "2023-04-05"
      },
      {
        rank: 5,
        username: "User5",
        avatar: null,
        totalScore: 1450,
        prCount: 87,
        issueCount: 23,
        commitsCount: 198,
        contributionStreak: 28,
        joinDate: "2023-05-12"
      },
      {
        rank: 6,
        username: "User6",
        avatar: null,
        totalScore: 1320,
        prCount: 65,
        issueCount: 34,
        commitsCount: 167,
        contributionStreak: 22,
        joinDate: "2023-06-18"
      },
      {
        rank: 7,
        username: "User7",
        avatar: null,
        totalScore: 1180,
        prCount: 43,
        issueCount: 56,
        commitsCount: 123,
        contributionStreak: 19,
        joinDate: "2023-07-02"
      },
      {
        rank: 8,
        username: "User8",
        avatar: null,
        totalScore: 1050,
        prCount: 38,
        issueCount: 72,
        commitsCount: 89,
        contributionStreak: 15,
        joinDate: "2023-08-15"
      }
    ],
    week: [
      {
        rank: 1,
        username: "User9",
        avatar: null,
        totalScore: 850,
        prCount: 25,
        issueCount: 12,
        commitsCount: 89,
        contributionStreak: 7,
        joinDate: "2023-01-15"
      },
      {
        rank: 2,
        username: "User1",
        avatar: null,
        totalScore: 720,
        prCount: 18,
        issueCount: 8,
        commitsCount: 67,
        contributionStreak: 7,
        joinDate: "2023-01-15"
      },
      {
        rank: 3,
        username: "User10",
        avatar: null,
        totalScore: 680,
        prCount: 22,
        issueCount: 5,
        commitsCount: 54,
        contributionStreak: 6,
        joinDate: "2023-02-20"
      },
      {
        rank: 4,
        username: "User4",
        avatar: null,
        totalScore: 590,
        prCount: 12,
        issueCount: 18,
        commitsCount: 43,
        contributionStreak: 5,
        joinDate: "2023-04-05"
      },
      {
        rank: 5,
        username: "User3",
        avatar: null,
        totalScore: 520,
        prCount: 15,
        issueCount: 7,
        commitsCount: 38,
        contributionStreak: 4,
        joinDate: "2023-02-10"
      },
      {
        rank: 6,
        username: "User5",
        avatar: null,
        totalScore: 480,
        prCount: 14,
        issueCount: 4,
        commitsCount: 32,
        contributionStreak: 4,
        joinDate: "2023-05-12"
      }
    ],
    month: [
      {
        rank: 1,
        username: "User11",
        avatar: null,
        totalScore: 3200,
        prCount: 78,
        issueCount: 34,
        commitsCount: 245,
        contributionStreak: 28,
        joinDate: "2023-01-15"
      },
      {
        rank: 2,
        username: "User1",
        avatar: null,
        totalScore: 2900,
        prCount: 65,
        issueCount: 28,
        commitsCount: 210,
        contributionStreak: 25,
        joinDate: "2023-01-15"
      },
      {
        rank: 3,
        username: "User12",
        avatar: null,
        totalScore: 2650,
        prCount: 58,
        issueCount: 22,
        commitsCount: 189,
        contributionStreak: 23,
        joinDate: "2023-03-10"
      },
      {
        rank: 4,
        username: "User2",
        avatar: null,
        totalScore: 2400,
        prCount: 52,
        issueCount: 19,
        commitsCount: 167,
        contributionStreak: 20,
        joinDate: "2023-03-20"
      },
      {
        rank: 5,
        username: "User3",
        avatar: null,
        totalScore: 2180,
        prCount: 45,
        issueCount: 16,
        commitsCount: 145,
        contributionStreak: 18,
        joinDate: "2023-02-10"
      },
      {
        rank: 6,
        username: "User13",
        avatar: null,
        totalScore: 1950,
        prCount: 38,
        issueCount: 28,
        commitsCount: 123,
        contributionStreak: 15,
        joinDate: "2023-04-22"
      },
      {
        rank: 7,
        username: "User4",
        avatar: null,
        totalScore: 1780,
        prCount: 34,
        issueCount: 25,
        commitsCount: 112,
        contributionStreak: 14,
        joinDate: "2023-04-05"
      }
    ]
  };

  // 현재 사용자 정보 (목업) - 시간대별로 다른 랭킹
  const currentUserData = {
    realtime: {
      username: "MyUsername",
      githubUsername: "my-github-username",
      avatar: null,
      totalScore: 320,
      commitsCount: 47,
      prCount: 12,
      issueCount: 5,
      rank: 156,
      contributionStreak: 12,
      joinDate: "2023-06-20"
    },
    week: {
      username: "MyUsername",
      githubUsername: "my-github-username",
      avatar: null,
      totalScore: 85,
      commitsCount: 12,
      prCount: 3,
      issueCount: 2,
      rank: 42,
      contributionStreak: 5,
      joinDate: "2023-06-20"
    },
    month: {
      username: "MyUsername",
      githubUsername: "my-github-username",
      avatar: null,
      totalScore: 420,
      commitsCount: 58,
      prCount: 15,
      issueCount: 8,
      rank: 89,
      contributionStreak: 18,
      joinDate: "2023-06-20"
    }
  };

  /**
   * 기간별 리더보드 데이터 계산 (메모이제이션)
   */
  const filteredLeaderboardData = useMemo(() => {
    const data = mockLeaderboardData[timePeriod] || mockLeaderboardData.realtime;
    
    // 순위 재계산
    return data.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  }, [timePeriod]);

  /**
   * 현재 사용자 정보 (기간별)
   */
  const currentUser = useMemo(() => {
    return currentUserData[timePeriod] || currentUserData.realtime;
  }, [timePeriod]);

  /**
   * 리더보드 데이터 새로고침 (실제로는 API 호출)
   */
  const refreshLeaderboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: 실제 API 호출 구현
      await new Promise(resolve => setTimeout(resolve, 1000)); // 모의 지연
      // setLeaderboardData(response.data);
    } catch (error) {
      setError('리더보드 데이터를 불러오는데 실패했습니다.');
      console.error('Leaderboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    // 데이터
    leaderboardData: filteredLeaderboardData,
    currentUser,
    
    // 상태
    loading,
    error,
    
    // 함수들
    refreshLeaderboard,
    
    // 유틸리티
    totalUsers: filteredLeaderboardData.length
  };
};

export default useLeaderboardData;
