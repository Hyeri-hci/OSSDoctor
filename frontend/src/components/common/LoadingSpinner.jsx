import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({
    message = "로딩 중입니다...",
    size = "medium",
    color = "blue"
}) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-16 h-16',
        large: 'w-32 h-32'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        gray: 'border-gray-600',
        red: 'border-red-600',
        green: 'border-green-600',
        purple: 'border-purple-600'
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div
                    className={`animate-spin rounded-full border-b-2 mx-auto ${sizeClasses[size]} ${colorClasses[color]}`}
                    role='status'
                    aria-label='Loading...'
                />
                <span className="sr-only">로딩 중</span>
            </div>
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
};

LoadingSpinner.propTypes = {
    message: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    color: PropTypes.oneOf(['blue', 'gray', 'red', 'green', 'purple'])
};

export default LoadingSpinner;