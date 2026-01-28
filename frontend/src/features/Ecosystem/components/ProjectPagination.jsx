import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/common";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * 프로젝트 페이지네이션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.displayedProjects - 표시된 프로젝트 목록
 * @param {number} props.currentPage - 현재 페이지
 * @param {number} props.totalPagesInBatch - 배치 내 총 페이지 수
 * @param {number} props.currentBatch - 현재 배치
 * @param {number} props.maxBatchReached - 도달한 최대 배치
 * @param {boolean} props.hasMoreInBatch - 배치 내 더 많은 페이지 여부
 * @param {boolean} props.canLoadMoreBatches - 더 많은 배치 로드 가능 여부
 * @param {Function} props.onPageChange - 페이지 변경 핸들러
 * @param {Function} props.onOpenExplorationModal - 탐색 모달 열기 핸들러
 */
const ProjectPagination = ({
  displayedProjects,
  currentPage,
  totalPagesInBatch,
  currentBatch,
  maxBatchReached,
  hasMoreInBatch,
  canLoadMoreBatches,
  onPageChange,
  onOpenExplorationModal,
}) => {
  if (!displayedProjects || displayedProjects.length === 0) {
    return null;
  }

  return (
    <div>
      {/* 페이지네이션 및 배치 컨트롤 */}
      <div className="flex flex-col items-center justify-center gap-6 mt-8">
        {/* 현재 그룹 정보 */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Group {currentBatch} • Page {currentPage}/{totalPagesInBatch}
          </p>
        </div>

        {/* 페이지 번호 */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPagesInBatch }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              ),
            )}
          </div>

          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasMoreInBatch}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* 5페이지 도달시 간단한 메시지만 */}
        {!hasMoreInBatch && (
          <div className="text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              You&apos;ve viewed all projects in this group
            </p>

            {/* 첫 번째 그룹이고 더 이상 로드할 데이터가 없을 때 */}
            {maxBatchReached === 1 && !canLoadMoreBatches && (
              <p className="text-gray-500 text-sm mt-2">
                🏁 You&apos;ve viewed all projects matching your search criteria
              </p>
            )}
          </div>
        )}
      </div>

      {/* 플로팅 버튼 - 다른 프로젝트가 있을 때 항상 표시 */}
      {(maxBatchReached > 1 || canLoadMoreBatches) && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={onOpenExplorationModal}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-sm font-medium rounded-full"
          >
            View Other Projects
          </Button>
        </div>
      )}
    </div>
  );
};

ProjectPagination.propTypes = {
  displayedProjects: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPagesInBatch: PropTypes.number.isRequired,
  currentBatch: PropTypes.number.isRequired,
  maxBatchReached: PropTypes.number.isRequired,
  hasMoreInBatch: PropTypes.bool.isRequired,
  canLoadMoreBatches: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onOpenExplorationModal: PropTypes.func.isRequired,
};

export default ProjectPagination;
