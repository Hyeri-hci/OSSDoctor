/**
 * Modal.jsx - 재사용 가능한 모달 컴포넌트
 * 
 * 다양한 용도로 사용할 수 있는 범용 모달 컴포넌트입니다.
 * 
 * 주요 기능:
 * - 애니메이션 지원
 * - 키보드 접근성 (ESC 키)
 * - 백드롭 클릭 닫기
 * - 사이즈 옵션
 * - 위치 옵션
 * - 헤더/푸터 커스터마이징
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal 컴포넌트
 * 
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Function} onClose - 모달 닫기 콜백
 * @param {string} title - 모달 제목
 * @param {ReactNode} children - 모달 내용
 * @param {string} size - 모달 크기 ('sm', 'md', 'lg', 'xl', 'full')
 * @param {string} position - 모달 위치 ('center', 'top', 'right', 'bottom')
 * @param {boolean} showHeader - 헤더 표시 여부
 * @param {boolean} showCloseButton - 닫기 버튼 표시 여부
 * @param {ReactNode} footer - 푸터 내용
 * @param {boolean} closeOnBackdrop - 백드롭 클릭 시 닫기 여부
 * @param {boolean} closeOnEscape - ESC 키로 닫기 여부
 * @param {string} className - 추가 CSS 클래스
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showHeader = true,
  showCloseButton = true,
  footer = null,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  // 애니메이션을 위한 가시성 상태 관리
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // 닫힐 때 애니메이션 시간만큼 지연
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC 키 이벤트 처리
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // 모달이 열릴 때 body 스크롤 차단 및 레이아웃 시프트 방지
  useEffect(() => {
    if (isOpen) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      
      // CSS로 이미 scrollbar-gutter: stable이 설정되어 있어도
      // 일부 브라우저에서는 추가 처리가 필요할 수 있음
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // body 스크롤 차단
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // 스크롤바 너비만큼 패딩 추가 (CSS scrollbar-gutter가 작동하지 않는 경우 대비)
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // cleanup에서 사용할 스크롤 위치 저장
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      // 원래 상태로 복원
      const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0', 10);
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('data-scroll-y');
      
      // 스크롤 위치 복원
      window.scrollTo(0, scrollY);
    }

    return () => {
      // 컴포넌트 언마운트 시 원래 상태로 복원
      const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0', 10);
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('data-scroll-y');
      
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen]);

  // 백드롭 클릭 처리
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isVisible) return null;

  // 크기별 클래스
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // 위치별 클래스
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    right: 'items-center justify-end pr-4',
    bottom: 'items-end justify-center pb-16'
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* 백드롭 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* 모달 컨테이너 */}
      <div className={`relative flex min-h-screen ${positionClasses[position]} p-4`}>
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} 
            transform transition-all duration-300 ease-out ${
            isOpen
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-4 opacity-0 scale-95'
          } ${className}`}
        >
          {/* 헤더 */}
          {showHeader && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* 내용 */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* 푸터 */}
          {footer && (
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  position: PropTypes.oneOf(['center', 'top', 'right', 'bottom']),
  showHeader: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  footer: PropTypes.node,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string
};

export default Modal;
