import React, { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/16/solid";
import { SearchBar, Navigation } from "../common";
import { useAuth } from "../../hooks/useAuth";
import { initiateGitHubLogin } from "../../utils/github-auth";


const HeaderSection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { isAuthenticated, user, isLoading, checkAuthStatus, handleLogout } = useAuth();

    const handleMyActivityClick = async () => {
        if (!isAuthenticated) {
            await checkAuthStatus();
            
            if (!isAuthenticated) {
                alert('GitHub 로그인이 필요한 서비스입니다.');
                try {
                    console.log("GitHub 로그인 시작");
                    initiateGitHubLogin({
                        scope: "read:user,user:email,public_repo",
                    });
                } catch (error) {
                    console.error('GitHub 로그인 시작 실패:', error);
                    alert('로그인 기능에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
                }
                return;
            }
        }

        window.location.href = "/myactivity";
    };

    const handleUserIconClick = async () => {
        if (isLoading) {
            alert('로그인 상태를 확인 중입니다. 잠시만 기다려주세요.');
            return;
        }

        if (!isAuthenticated) {
            await checkAuthStatus();
        }

        if (isAuthenticated) {
            if (window.confirm('로그아웃 하시겠습니까?')) {
                try {
                    await handleLogout();
                } catch (error) {
                    console.error('로그아웃 실패:', error);
                    alert('로그아웃에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
                }
            }
        } else {
            try {
                console.log("GitHub 로그인 시작");
                initiateGitHubLogin({
                    scope: "read:user,user:email,public_repo",
                });
            } catch (error) {
                console.error('GitHub 로그인 시작 실패:', error);
                alert('로그인 기능에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    };

    const navItems = [
        { label: "프로젝트 진단", href: "/diagnose" },
        {
            label: "나의 기여도",
            href: "/myactivity",
            onClick: handleMyActivityClick 
        },
        { label: "업사이클링", href: "/ecosystem" },
        { label: "정보", href: "#" }
    ];

    return (
        <header className="w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div
                            className="bg-gray-100 px-4 py-2 rounded-full font-bold text-[#1a202c] text-xs lg:text-sm cursor-pointer"
                            onClick={() => window.location.href = "/"}
                        >
                            OSSDoctor
                        </div>
                        {/* Navigation */}
                        <Navigation items={navItems} />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="hidden sm:block w-64">
                            <SearchBar
                                placeholder="업사이클링할 프로젝트 찾기"
                                // onSubmit={}
                                value={searchQuery}
                                onChange={setSearchQuery}
                                size="small"
                            />
                        </div>

                        {/* User Profile Section */}
                        <div className="flex items-center space-x-2">
                            {isLoading ? (
                                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                            ) : isAuthenticated && user ? (
                                <div className="flex items-center space-x-2">
                                    {/* 사용자 아바타 또는 기본 아이콘 */}
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={`${user.login} avatar`}
                                            onClick={handleUserIconClick}
                                            className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                                            title={`${user.login} - 로그아웃하려면 클릭`}
                                        />
                                    ) : (
                                        <UserCircleIcon
                                            onClick={handleUserIconClick}
                                            className="w-8 h-8 text-gray-600 cursor-pointer hover:text-gray-800"
                                            title={`${user.login} - 로그아웃하려면 클릭`}
                                        />
                                    )}
                                    {/* 사용자명 (선택적 표시) */}
                                    <span className="hidden md:block text-sm text-gray-700 font-medium">
                                        {user.login}
                                    </span>
                                </div>
                            ) : (
                                <UserCircleIcon
                                    onClick={handleUserIconClick}
                                    className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                                    title="GitHub 로그인"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderSection;