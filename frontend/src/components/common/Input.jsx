import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input 컴포넌트
 * 
 * @param {string} type - 입력 타입
 * @param {string} label - 라벨 텍스트
 * @param {string} placeholder - 플레이스홀더
 * @param {string} value - 입력 값
 * @param {Function} onChange - 값 변경 콜백
 * @param {Function} onBlur - 포커스 아웃 콜백
 * @param {Function} onFocus - 포커스 인 콜백
 * @param {string} error - 에러 메시지
 * @param {string} helpText - 도움말 텍스트
 * @param {boolean} required - 필수 입력 여부
 * @param {boolean} disabled - 비활성화 여부
 * @param {string} size - 입력 필드 크기 ('sm', 'md', 'lg')
 * @param {ReactNode} leftIcon - 왼쪽 아이콘
 * @param {ReactNode} rightIcon - 오른쪽 아이콘
 * @param {string} className - 추가 CSS 클래스
 */
const Input = forwardRef(({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    error,
    helpText,
    required = false,
    disabled = false,
    size = 'md',
    leftIcon,
    rightIcon,
    className = '',
    ...props
}, ref) => {
    const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

    // 크기별 클래스
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base'
    };

    // 상태별 스타일
    const getInputClasses = () => {
        const baseClasses = 'w-full border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
        const sizeClass = sizeClasses[size];

        let stateClasses = '';
        if (error) {
            stateClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
        } else if (disabled) {
            stateClasses = 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed';
        } else {
            stateClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
        }

        const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

        return `${baseClasses} ${sizeClass} ${stateClasses} ${iconPadding} ${className}`;
    };

    return (
        <div className="w-full">
            {/* 라벨 */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* 입력 필드 컨테이너 */}
            <div className="relative">
                {/* 왼쪽 아이콘 */}
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-5 h-5 text-gray-400">
                            {leftIcon}
                        </div>
                    </div>
                )}

                {/* 입력 필드 */}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    required={required}
                    disabled={disabled}
                    className={getInputClasses()}
                    {...props}
                />

                {/* 오른쪽 아이콘 */}
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="w-5 h-5 text-gray-400">
                            {rightIcon}
                        </div>
                    </div>
                )}
            </div>

            {/* 에러 메시지 */}
            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            {/* 도움말 텍스트 */}
            {helpText && !error && (
                <p className="mt-2 text-sm text-gray-500">
                    {helpText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    type: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    error: PropTypes.string,
    helpText: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    className: PropTypes.string
};

export default Input;