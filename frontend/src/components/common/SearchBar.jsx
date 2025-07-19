import React, { useState } from "react";
import PropTypes from "prop-types";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/solid"; // 검색 아이콘


const SearchBar = ({
    placeholder = "검색어를 입력하세요",
    onSubmit,
    value,
    onChange,
    className = "",
    size = "default"
}) => {
    const [internalValue, setInternalValue] = useState("");
    const searchValue = value || undefined ? value : internalValue;
    const handleChange = onChange || setInternalValue;

    // form 제출 핸들러 - Enter key & 검색 버튼 클릭 (e.preventDefault()로 페이지 새로고침 방지)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit && searchValue.trim()) {
            onSubmit(searchValue);
        }
    };

    // Tailwind CSS 클래스 설정
    const sizeClasses = {
        small: "px-3 py-1 text-xs",    // 작은 크기
        default: "px-3 py-2 text-sm",  // 기본 크기
        large: "px-4 py-3 text-base"   // 큰 크기
    };

    const iconSizeClasses = {
        small: "w-4 h-4",    // 16px
        default: "w-5 h-5",  // 20px
        large: "w-6 h-6"     // 24px
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex w-full bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${className}`}
        >
            {/* Search Icon */}
            <div className="flex items-center pl-3">
                <MagnifyingGlassCircleIcon className={`text-gray-500 ${iconSizeClasses[size]}`} />
            </div>

            {/* Search Input */}
            <input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => handleChange(e.target.value)} // 입력값 변경 시 상태 업데이트
                className={`flex-1 bg-transparent text-gray-700 placeholder-gray-400 outline-none border-none ${sizeClasses[size]}`}
            />
        </form>
    )
};

SearchBar.propTypes = {
    placeholder: PropTypes.string,
    onSubmit: PropTypes.func,
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    size: PropTypes.oneOf(["small", "default", "large"])
};

export default SearchBar;