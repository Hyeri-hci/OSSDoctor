import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from '../../../components/common';

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
    onLoadNextBatch
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
            title="다른 프로젝트 탐색"
            closeOnBackdrop={!loadingNextBatch}
            closeOnEscape={!loadingNextBatch}
        >
            <div className="p-6">
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        프로젝트 그룹 탐색
                    </h3>
                    <p className="text-gray-600 text-sm">
                        현재 {currentBatch}번째 그룹을 보고 있습니다 • 각 그룹마다 30개의 서로 다른 프로젝트
                    </p>
                </div>
                
                {/* 그룹 네비게이션 */}
                <div className="space-y-4">
                    {/* 현재까지 탐색한 그룹들 */}
                    {maxBatchReached > 1 && !loadingNextBatch && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">이미 본 그룹들</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: maxBatchReached }, (_, i) => i + 1).map((groupNum) => (
                                    <Button
                                        key={groupNum}
                                        onClick={() => handleGoToBatch(groupNum)}
                                        variant={currentBatch === groupNum ? "default" : "outline"}
                                        size="sm"
                                        className={`${currentBatch === groupNum 
                                            ? "bg-blue-600 text-white" 
                                            : "text-gray-700 hover:bg-gray-50"
                                        } justify-center`}
                                    >
                                        그룹 {groupNum}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* 새로운 그룹 탐색 */}
                    {canLoadMoreBatches && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">새로운 프로젝트 발견하기</h4>
                            <Button
                                onClick={handleLoadNextBatch}
                                disabled={loadingNextBatch}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 disabled:opacity-75"
                            >
                                {loadingNextBatch ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        새로운 프로젝트 로딩 중...
                                    </>
                                ) : (
                                    <>
                                        {maxBatchReached + 1}번째 그룹 탐색하기 (30개의 새로운 프로젝트)
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                    
                    {/* 로딩 중 안내 메시지 */}
                    {loadingNextBatch ? (
                        <div className="bg-green-50 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-green-800 text-sm font-medium mb-1">새로운 프로젝트를 찾는 중입니다</p>
                                    <p className="text-green-700 text-sm">
                                        GitHub에서 {maxBatchReached + 1}번째 그룹의 프로젝트들을 가져오고 있습니다. 
                                        잠시만 기다려주세요!
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* 일반 안내 메시지 */
                        <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 text-lg">💡</span>
                                <div>
                                    <p className="text-blue-800 text-sm font-medium mb-1">탐색 팁</p>
                                    <p className="text-blue-700 text-sm">
                                        각 그룹은 GitHub에서 실시간으로 가져온 서로 다른 프로젝트들입니다. 
                                        마음에 드는 프로젝트를 찾을 때까지 계속 탐색해보세요!
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
    onLoadNextBatch: PropTypes.func.isRequired
};

export default ProjectExplorationModal;
