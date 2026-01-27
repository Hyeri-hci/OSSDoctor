import React from "react";
import PropTypes from "prop-types";
import { SearchBar } from "../../../components/common";

const HeroSection = ({ onAnalyze }) => {
  return (
    <section className="bg-[#666666] text-white py-16">
      <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">
              Explore and Revive OSS!
            </h1>
            <p className="text-gray-300 text-sm lg:text-base xl:text-lg leading-relaxed">
              Monitor your favorite projects, track your contributions, and join
              the project revival through the Ecosystem.
            </p>

            {/* Search Bar Interface */}
            <SearchBar
              placeholder="Search open source repository URL..."
              onSubmit={onAnalyze}
              size="large"
            />
          </div>

          <div className="bg-[#9F9F9F] rounded-lg hidden lg:flex items-center justify-center aspect-[4/3] w-full max-w-md xl:max-w-lg mx-auto">
            {/* Image placeholder */}
          </div>
        </div>
      </div>
    </section>
  );
};

HeroSection.propTypes = {
  onAnalyze: PropTypes.func,
};

export default HeroSection;
