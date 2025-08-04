import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, SearchBar } from "../../../components/common";

const DiagnoseSearchSection = ({ onSearch, error }) => {
    const [searchInput, setSearchInput] = useState("");
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setShowButton(window.innerWidth >= 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = () => {
       onSearch(searchInput);
       console.log(`${searchInput}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <section className="bg-[#F3F3F3] py-16">
            <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
                    {/* 제목 섹션 */}
                    <div className="flex-shrink-0 text-center md:text-left">
                        <h1 className="text-2xl md:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                            OSS 프로젝트 진단하기
                        </h1>
                        <p className="text-sm md:text-xs lg:text-sm text-gray-600">
                            GitHub Repository URL을 입력하여 분석 결과를 확인하세요.
                        </p>
                    </div>

                    {/* 검색 영역 */}
                    <div className="flex-1 max-w-2xl">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <SearchBar
                                    placeholder="GitHub Repository URL"
                                    value={searchInput}
                                    onChange={setSearchInput}
                                    onKeyDown={handleKeyDown}
                                    onSubmit={handleSearch}
                                    error={error}
                                    size="large"
                                    className="flex-1"
                                />
                                
                                {showButton && (
                                    <Button
                                        onClick={handleSearch}
                                        variant="primary"
                                        size="large"
                                    >
                                        진단하기
                                    </Button>
                                )}
                            </div>
                            
                            {/* 안내 메시지 */}
                            <div className="text-xs text-center md:text-left">
                                {error ? (
                                    <span className="text-red-500">{error}</span>
                                ) : (
                                    <span className="text-gray-500">
                                        예시: https://github.com/facebook/react 또는 facebook/react
                                    </span>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};DiagnoseSearchSection.propTypes = {
    onSearch: PropTypes.func.isRequired,
    error: PropTypes.string
};

export default DiagnoseSearchSection;