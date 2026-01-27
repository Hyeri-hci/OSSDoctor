import React, { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/16/solid";
import { SearchBar, Navigation } from "../common";
import { useAuth } from "../../hooks/useAuth";
import { initiateGitHubLogin } from "../../utils/github-auth";

const HeaderSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, user, isLoading, checkAuthStatus, handleLogout } =
    useAuth();

  // SearchBar 검색 기능 - 에코시스템 페이지로 이동
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // 검색어를 URL 파라미터로 인코딩하여 에코시스템 페이지로 이동
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      window.location.href = `/ecosystem?search=${encodedQuery}`;
    }
  };

  // Enter 키 처리
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleMyActivityClick = async () => {
    // Login check
    if (!isAuthenticated) {
      await checkAuthStatus();

      if (!isAuthenticated) {
        alert("GitHub login is required to use this service.");
        try {
          console.log("Starting GitHub login");
          initiateGitHubLogin({
            scope: "read:user,user:email,public_repo",
            redirectAfterLogin: "/myactivity",
          });
        } catch (error) {
          console.error("Failed to start GitHub login:", error);
          alert(
            "There was a problem with the login feature. Please try again later.",
          );
        }
        return;
      }
    }

    window.location.href = "/myactivity";
  };

  const handleUserIconClick = async () => {
    if (isLoading) {
      alert("Checking login status. Please wait...");
      return;
    }

    if (!isAuthenticated) {
      await checkAuthStatus();
    }

    if (isAuthenticated) {
      if (window.confirm("Do you want to log out?")) {
        try {
          await handleLogout();
        } catch (error) {
          console.error("Logout failed:", error);
          alert("There was a problem logging out. Please try again later.");
        }
      }
    } else {
      try {
        initiateGitHubLogin({
          scope: "read:user,user:email,public_repo",
        });
      } catch (error) {
        console.error("Failed to start GitHub login:", error);
        alert(
          "There was a problem with the login feature. Please try again later.",
        );
      }
    }
  };

  const navItems = [
    { label: "Diagnose", href: "/diagnose" },
    {
      label: "My Activity",
      href: "/myactivity",
      onClick: handleMyActivityClick,
    },
    { label: "Upcycling", href: "/ecosystem" },
    { label: "Info", href: "/info" },
  ];

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
        <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div
              className="bg-gray-100 px-4 py-2 rounded-full font-bold text-[#1a202c] text-xs lg:text-sm cursor-pointer"
              onClick={() => (window.location.href = "/")}
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
                placeholder="Find projects to upcycle"
                onSubmit={handleSearchSubmit}
                value={searchQuery}
                onChange={setSearchQuery}
                onKeyDown={handleSearchKeyDown}
                size="small"
              />
            </div>

            {/* User Profile Section */}
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.login} avatar`}
                      onClick={handleUserIconClick}
                      className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                      title={`${user.login} - Click to logout`}
                    />
                  ) : (
                    <UserCircleIcon
                      onClick={handleUserIconClick}
                      className="w-8 h-8 text-gray-600 cursor-pointer hover:text-gray-800"
                      title={`${user.login} - Click to logout`}
                    />
                  )}
                  {/* Username (optional display) */}
                  <span className="hidden md:block text-sm text-gray-700 font-medium">
                    {user.login}
                  </span>
                </div>
              ) : (
                <UserCircleIcon
                  onClick={handleUserIconClick}
                  className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  title="Login with GitHub"
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
