import React from "react";
import PropTypes from 'prop-types';

const Button = ({
    children,
    variant = "primary", // "primary", "secondary", "outline", "ghost"
    size = "default", // "small", "default", "large"
    className = "",
    onClick,
    disabled = false,
    type = "button",
    ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-black text-white hover:bg-gray-800 focus:ring-gray-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
    };

    const sizeClasses = {
        small: "px-3 py-1.5 text-xs",
        default: "px-4 py-2 text-sm",
        large: "px-6 py-3 text-base"
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
    size: PropTypes.oneOf(['small', 'default', 'large']),
    className: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    type: PropTypes.string
};

export default Button;
