import React, { useState } from "react";
import { UserCircleIcon } from '@heroicons/react/16/solid'
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'

const HeaderSection = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const navItems = ["프로젝트 진단", "나의 기여도", "업사이클링", "정보"];

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log("Searching for:", searchQuery);
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleUserIconClick = () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
            window.location.href = "/my-activity";
        } else {
            window.location.href = "/login";
        }
    };

    return (
        <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            {/* Left Section: Logo and Navigation */}
            <div className="flex items-center gap-6">

                {/* Logo */}
                <div
                    className="bg-gray-100 px-4 py-2 rounded-full font-bold text-[#1a202c] text-xs lg:text-sm cursor-pointer"
                    onClick={() => window.location.href = '/'}
                >
                    OSSDoctor
                </div>

                {/* Navigation (Desktop) */}
                <nav className="hidden md:flex gap-6 border-l border-gray-200 pl-6">
                    {navItems.map((item, idx) => (
                        <a
                            key={idx}
                            href="#"
                            className="text-xs lg:text-sm text-gray-700 font-medium hover:font-bold transition"
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                {/* Hamburger Menu (Mobile) */}
                <div className="relative md:hidden">
                    <Bars3Icon
                        className="w-6 h-6 text-gray-600 cursor-pointer"
                        onClick={toggleMenu}
                    />
                    {isMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <nav className="flex flex-col">
                                {navItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href="#"
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section: Search Bar and User Icon */}
            <div className="flex items-center gap-4">
                <form
                    onSubmit={handleSearchSubmit}
                    className="hidden sm:flex items-center border border-gray-300 rounded-md px-3 py-1 bg-white w-full"
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="업사이클링할 프로젝트 찾기"
                        className="flex-grow bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 hidden sm:inline-flex" />
                </form>

                <UserCircleIcon
                    onClick={handleUserIconClick}
                    className="w-8 h-8 text-gray-400 cursor-pointer"
                />
            </div>
        </header>
    );
};


export default HeaderSection;
