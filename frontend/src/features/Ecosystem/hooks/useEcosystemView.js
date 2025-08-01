import { useState } from "react";

const useEcosystemView = (initialView = 'main') => {
    const [currentView, setCurrentView] = useState(initialView);

    const navigateToEcosystem = () => setCurrentView('ecosystem');
    const navigateToLeaderboard = () => setCurrentView('leaderboard');
    const navigateToMain = () => setCurrentView('main');

    const isMainView = currentView === 'main';
    const isEcosystemView = currentView === 'ecosystem';
    const isLeaderboardView = currentView === 'leaderboard';

    return {
        currentView,
        setCurrentView,
        navigateToEcosystem,
        navigateToLeaderboard,
        navigateToMain,
        isMainView,
        isEcosystemView,
        isLeaderboardView
    };
};

export default useEcosystemView;
