import React from "react";
import PropTypes from 'prop-types';

const Button = ({
    children,
    variant = "primary", // "primary", "secondary", "outline", "ghost"
    size = "default", // "xs", "sm", "small", "default", "large"
    className = "",
    onClick,
    disabled = false,
    type = "button",
    ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-blue-100 text-blue-900 hover:bg-blue-200 focus:ring-blue-500",
        outline: "border border-blue-300 bg-transparent text-blue-700 hover:bg-blue-50 focus:ring-blue-500",
        ghost: "bg-transparent text-blue-700 hover:bg-blue-100 focus:ring-blue-500"
    };

    const sizeClasses = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-xs",
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
    size: PropTypes.oneOf(['xs', 'sm', 'small', 'default', 'large']),
    className: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    type: PropTypes.string
};

export default Button;
