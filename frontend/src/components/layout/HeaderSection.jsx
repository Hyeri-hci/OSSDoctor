import React, { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/16/solid";
import { SearchBar, Navigation } from "../common";


const HeaderSection = () => {
    const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태

    const handleMyActivityClick = () => {
        console.log('GitHub 로그인이 필요한 서비스입니다.');
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

                        {/* User Profile Icon */}
                        <div className="flex items-center space-x-2">
                            {/* Logout */}
                            <UserCircleIcon
                                onClick={() => alert('로그아웃 기능은 아직 구현되지 않았습니다.')}
                                className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600"
                                title="GitHub 로그인"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderSection;