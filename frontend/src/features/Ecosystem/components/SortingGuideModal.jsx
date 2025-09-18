import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../components/common';

const SortingGuideModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="정렬 기준 가이드">
      <div className="space-y-6">
        {/* GFI 설명 섹션 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🏷️ Good First Issues (GFI)란?
          </h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            Good First Issues는 초보자가 기여하기에 적합한 이슈들입니다. 
            프로젝트 관리자들이 새로운 기여자들을 위해 상대적으로 쉽고 명확한 작업들을 표시해 둔 것입니다.
          </p>
        </div>

        {/* 정렬 기준 설명 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 정렬 기준 설명</h3>
          
          <div className="space-y-3">
            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-medium text-gray-800">🌟 초보자 친화적</h4>
              <p className="text-sm text-gray-600">
                Good First Issues, 프로젝트 크기, 문서화 품질 등을 종합적으로 분석하여 
                초보자가 기여하기 쉬운 프로젝트 순으로 정렬합니다.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-medium text-gray-800">⭐ 인기순 (Stars)</h4>
              <p className="text-sm text-gray-600">
                GitHub Stars 개수가 많은 프로젝트부터 정렬합니다. 
                Stars가 많다는 것은 더 많은 개발자들이 관심을 가지고 있다는 의미입니다.
              </p>
            </div>

            <div className="border-l-4 border-purple-400 pl-4">
              <h4 className="font-medium text-gray-800">📅 최근 업데이트순</h4>
              <p className="text-sm text-gray-600">
                최근에 업데이트된 프로젝트부터 정렬합니다. 
                <span className="font-medium">조건:</span> Stars 50+, Forks 5+, 2023년 이후 업데이트, Good First Issues 3개 이상
              </p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium text-gray-800">🏷️ Good First Issues 많은 순</h4>
              <p className="text-sm text-gray-600">
                Good First Issues가 많은 프로젝트부터 정렬합니다. 
                초보자가 기여할 수 있는 이슈가 많아 참여하기 좋습니다.
              </p>
            </div>

            <div className="border-l-4 border-emerald-400 pl-4">
              <h4 className="font-medium text-gray-800">🎯 쉬운 기여 (Beginner)</h4>
              <p className="text-sm text-gray-600">
                Good First Issues가 3개 이상이거나 Stars가 5000개 미만인 접근하기 쉬운 프로젝트만 
                선별하여 보여줍니다.
              </p>
            </div>
          </div>
        </div>

        {/* 팁 섹션 */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            💡 초보자를 위한 팁
          </h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• <strong>&ldquo;쉬운 기여&rdquo;</strong>로 시작해서 기여 경험을 쌓아보세요</li>
            <li>• Good First Issues가 많은 프로젝트를 선택하세요</li>
            <li>• 프로젝트의 CONTRIBUTING.md 파일을 꼭 읽어보세요</li>
            <li>• 코드 기여 전에 문서 오타 수정부터 시작해보세요</li>
          </ul>
        </div>

        {/* 닫기 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            이해했습니다
          </button>
        </div>
      </div>
    </Modal>
  );
};

SortingGuideModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SortingGuideModal;
