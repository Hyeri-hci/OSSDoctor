import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types";
import { Button, SearchBar } from "../../../components/common";
import ScoreGuideModal from "./ScoreGuideModal";

const DiagnoseSearchSection = forwardRef(({ onSearch }, ref) => {
  const [searchInput, setSearchInput] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [showScoreGuide, setShowScoreGuide] = useState(false);
  const searchInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusSearchInput: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
  }));

  // URL 파라미터에서 repo 값을 읽어서 input 창에 설정
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get("repo");

    if (repoParam) {
      setSearchInput(repoParam);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setShowButton(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            {/* Title Section */}
            <div className="flex-shrink-0 text-center md:text-left">
              <h1 className="text-2xl md:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                Diagnose OSS Project
              </h1>
              <p className="text-sm md:text-xs lg:text-sm text-gray-600">
                Enter a GitHub Repository URL to view the analysis results.
              </p>

              {/* Score System Guide Button */}
              <div className="mt-3">
                <Button
                  onClick={() => setShowScoreGuide(true)}
                  variant="outline"
                  size="small"
                  className="text-xs"
                >
                  📊 Scoring Guide
                </Button>
              </div>
            </div>

            {/* 검색 영역 */}
            <div className="flex-1 max-w-2xl">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <SearchBar
                    ref={searchInputRef}
                    placeholder="GitHub Repository URL"
                    value={searchInput}
                    onChange={setSearchInput}
                    onKeyDown={handleKeyDown}
                    onSubmit={handleSearch}
                    size="large"
                    className="flex-1"
                  />

                  {showButton && (
                    <Button
                      onClick={handleSearch}
                      variant="primary"
                      size="large"
                    >
                      Diagnose
                    </Button>
                  )}
                </div>

                {/* Guide message */}
                <div className="text-xs text-center md:text-left">
                  <span className="text-gray-500">
                    Example: https://github.com/microsoft/vscode or
                    microsoft/vscode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score System Guide Modal */}
      <ScoreGuideModal
        isOpen={showScoreGuide}
        onClose={() => setShowScoreGuide(false)}
      />
    </section>
  );
});

DiagnoseSearchSection.displayName = "DiagnoseSearchSection";

DiagnoseSearchSection.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default DiagnoseSearchSection;
