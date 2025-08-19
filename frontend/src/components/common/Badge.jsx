import React from "react";
import PropTypes from 'prop-types';

const Badge = ({
    children,
    variant = "default", // "default", "primary", "secondary", "success", "warning", "danger", "info", "outline"
    size = "default", // "small", "default", "large"
    className = ""
}) => {
    const baseClasses = "inline-flex items-center rounded-full font-medium";

    const variantClasses = {
        default: "bg-blue-100 text-blue-800",
        primary: "bg-blue-600 text-white",
        secondary: "bg-purple-100 text-purple-800",
        success: "bg-green-100 text-green-800",
        info: "bg-cyan-100 text-cyan-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        outline: "border border-gray-300 text-gray-600 bg-transparent"
    };

    const sizeClasses = {
        small: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-sm",
        large: "px-3 py-1.5 text-base"
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <span className={classes}>
            {children}
        </span>
    );
};

Badge.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'outline']),
    size: PropTypes.oneOf(['small', 'default', 'large']),
    className: PropTypes.string
};

export default Badge;
