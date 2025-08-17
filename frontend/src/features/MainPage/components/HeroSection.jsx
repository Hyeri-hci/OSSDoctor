import React from "react";
import PropTypes from "prop-types";
import { SearchBar } from "../../../components/common"

const HeroSection = ({ onAnalyze }) => {
    return (
        <section className="bg-[#388E3C] text-white py-16">
            <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">
                            OSS를 탐색하고, 되살려보세요!
                        </h1>
                        <p className="text-gray-300 text-sm lg:text-base xl:text-lg leading-relaxed">
                            원하는 프로젝트를 모니터링하고, 자신의 기여도를 추적하고, EcoSystem을 통해 프로젝트 되살리기에 동참하세요.
                        </p>

                        {/* Search Bar Interface */}
                        <SearchBar
                            placeholder="오픈소스 리포지터리 URL 검색..."
                            onSubmit={onAnalyze}
                            size="large"
                        />
                    </div>

                    <div className="bg-[#9F9F9F] rounded-lg hidden lg:flex items-center justify-center aspect-[4/3] w-full max-w-md xl:max-w-lg mx-auto">
                        {/* 추후 이미지 첨부 */}
                    </div>
                </div>
            </div>
        </section>
    );
};

HeroSection.propTypes = {
    onAnalyze: PropTypes.func
};

export default HeroSection;