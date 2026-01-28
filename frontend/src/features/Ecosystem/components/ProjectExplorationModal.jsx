import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Button, Modal } from "../../../components/common";

/**
 * 프로젝트 탐색 모달 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {number} props.currentBatch - 현재 배치
 * @param {number} props.maxBatchReached - 도달한 최대 배치
 * @param {boolean} props.canLoadMoreBatches - 더 많은 배치 로드 가능 여부
 * @param {boolean} props.loadingNextBatch - 다음 배치 로딩 중 여부
 * @param {Function} props.onGoToBatch - 배치 이동 핸들러
 * @param {Function} props.onLoadNextBatch - 다음 배치 로드 핸들러
 */
const ProjectExplorationModal = ({
  isOpen,
  onClose,
  currentBatch,
  maxBatchReached,
  canLoadMoreBatches,
  loadingNextBatch,
  onGoToBatch,
  onLoadNextBatch,
}) => {
  const previousLoadingRef = useRef(loadingNextBatch);

  // 로딩 완료 시 3초 후 자동 닫기
  useEffect(() => {
    const wasLoading = previousLoadingRef.current;
    const isNowNotLoading = !loadingNextBatch;

    if (wasLoading && isNowNotLoading && isOpen) {
      // 로딩이 완료되었으면 3초 후 자동으로 모달 닫기
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }

    previousLoadingRef.current = loadingNextBatch;
  }, [loadingNextBatch, isOpen, onClose]);

  const handleLoadNextBatch = () => {
    // 로딩 중일 때는 모달을 닫지 않음
    onLoadNextBatch();
  };

  const handleGoToBatch = (batchNum) => {
    onGoToBatch(batchNum);
    onClose();
  };

  // 로딩 중일 때는 ESC 키나 외부 클릭으로 닫을 수 없도록 설정
  const handleModalClose = () => {
    if (!loadingNextBatch) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Explore Other Projects"
      closeOnBackdrop={!loadingNextBatch}
      closeOnEscape={!loadingNextBatch}
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Project Group Navigation
          </h3>
          <p className="text-gray-600 text-sm">
            Currently viewing group {currentBatch} • Each group contains 30
            different projects
          </p>
        </div>

        {/* Group Navigation */}
        <div className="space-y-4">
          {/* Previously explored groups */}
          {maxBatchReached > 1 && !loadingNextBatch && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Previously Viewed Groups
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: maxBatchReached }, (_, i) => i + 1).map(
                  (groupNum) => (
                    <Button
                      key={groupNum}
                      onClick={() => handleGoToBatch(groupNum)}
                      variant={
                        currentBatch === groupNum ? "default" : "outline"
                      }
                      size="sm"
                      className={`${
                        currentBatch === groupNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      } justify-center`}
                    >
                      Group {groupNum}
                    </Button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Explore new groups */}
          {canLoadMoreBatches && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Discover New Projects
              </h4>
              <Button
                onClick={handleLoadNextBatch}
                disabled={loadingNextBatch}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 disabled:opacity-75"
              >
                {loadingNextBatch ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading new projects...
                  </>
                ) : (
                  <>Explore Group {maxBatchReached + 1} (30 new projects)</>
                )}
              </Button>
            </div>
          )}

          {/* Loading message */}
          {loadingNextBatch ? (
            <div className="bg-green-50 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 text-sm font-medium mb-1">
                    Searching for new projects
                  </p>
                  <p className="text-green-700 text-sm">
                    Fetching group {maxBatchReached + 1} projects from GitHub.
                    Please wait!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* General tip message */
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg">💡</span>
                <div>
                  <p className="text-blue-800 text-sm font-medium mb-1">
                    Exploration Tip
                  </p>
                  <p className="text-blue-700 text-sm">
                    Each group contains different projects fetched in real-time
                    from GitHub. Keep exploring until you find a project you
                    like!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

ProjectExplorationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentBatch: PropTypes.number.isRequired,
  maxBatchReached: PropTypes.number.isRequired,
  canLoadMoreBatches: PropTypes.bool.isRequired,
  loadingNextBatch: PropTypes.bool.isRequired,
  onGoToBatch: PropTypes.func.isRequired,
  onLoadNextBatch: PropTypes.func.isRequired,
};

export default ProjectExplorationModal;
