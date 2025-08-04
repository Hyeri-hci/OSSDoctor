import React, { useState, useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';


const Select = forwardRef(({
    options = [],
    value,
    onChange,
    label,
    placeholder = '선택해주세요',
    multiple = false,
    searchable = false,
    error,
    helpText,
    required = false,
    disabled = false,
    size = 'md',
    className = '',
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const selectRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionsRef = useRef([]);

    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

    // 필터된 옵션들
    const filteredOptions = searchable
        ? options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    // 선택된 옵션들
    const selectedOptions = multiple
        ? options.filter(option => value?.includes(option.value))
        : options.find(option => option.value === value);

    // 표시될 텍스트
    const getDisplayText = () => {
        if (multiple && Array.isArray(selectedOptions)) {
            if (selectedOptions.length === 0) return placeholder;
            if (selectedOptions.length === 1) return selectedOptions[0].label;
            return `${selectedOptions.length}개 선택됨`;
        }
        return selectedOptions?.label || placeholder;
    };

    // 크기별 클래스
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base'
    };

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 키보드 네비게이션
    const handleKeyDown = (e) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else if (focusedIndex >= 0) {
                    handleOptionSelect(filteredOptions[focusedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setFocusedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : 0
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
        }
    };

    // 옵션 선택 처리
    const handleOptionSelect = (option) => {
        if (option.disabled) return;

        if (multiple) {
            const currentValues = value || [];
            const newValues = currentValues.includes(option.value)
                ? currentValues.filter(v => v !== option.value)
                : [...currentValues, option.value];
            onChange(newValues);
        } else {
            onChange(option.value);
            setIsOpen(false);
            setSearchTerm('');
        }
        setFocusedIndex(-1);
    };

    // 선택된 값 제거 (다중 선택)
    const handleRemoveValue = (valueToRemove, e) => {
        e.stopPropagation();
        if (multiple) {
            const newValues = value.filter(v => v !== valueToRemove);
            onChange(newValues);
        }
    };

    // 드롭다운 열기/닫기
    const toggleDropdown = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen && searchable) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    };

    // 스타일 클래스
    const getSelectClasses = () => {
        const baseClasses = 'w-full border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
        const sizeClass = sizeClasses[size];

        let stateClasses = '';
        if (error) {
            stateClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
        } else if (disabled) {
            stateClasses = 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed';
        } else {
            stateClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
        }

        return `${baseClasses} ${sizeClass} ${stateClasses} ${className}`;
    };

    return (
        <div className="w-full" ref={selectRef}>
            {/* 라벨 */}
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* 선택 필드 */}
            <div className="relative">
                <div
                    id={selectId}
                    className={getSelectClasses()}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    ref={ref}
                    {...props}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center gap-1 min-w-0">
                            {multiple && Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {selectedOptions.slice(0, 2).map((option) => (
                                        <span
                                            key={option.value}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                            {option.label}
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemoveValue(option.value, e)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {selectedOptions.length > 2 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                            +{selectedOptions.length - 2}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className={selectedOptions ? 'text-gray-900' : 'text-gray-500'}>
                                    {getDisplayText()}
                                </span>
                            )}
                        </div>

                        <ChevronDownIcon
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
                                }`}
                        />
                    </div>
                </div>

                {/* 드롭다운 옵션들 */}
                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* 검색 입력 */}
                        {searchable && (
                            <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 옵션 리스트 */}
                        <div role="listbox">
                            {filteredOptions.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                    옵션이 없습니다
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => {
                                    const isSelected = multiple
                                        ? value?.includes(option.value)
                                        : value === option.value;
                                    const isFocused = index === focusedIndex;

                                    return (
                                        <div
                                            key={option.value}
                                            ref={el => optionsRef.current[index] = el}
                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-200 ${option.disabled
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : isFocused
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : isSelected
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleOptionSelect(option)}
                                            role="option"
                                            aria-selected={isSelected}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option.label}</span>
                                                {isSelected && multiple && (
                                                    <div className="w-4 h-4 text-blue-600">✓</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
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

Select.displayName = 'Select';

Select.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired,
            disabled: PropTypes.bool
        })
    ).isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
    ]),
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    error: PropTypes.string,
    helpText: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string
};

export default Select;
