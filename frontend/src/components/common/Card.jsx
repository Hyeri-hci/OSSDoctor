import React from "react";
import PropTypes from 'prop-types';

const Card = ({
    children,
    className = "",
    padding = "default", // "none", "small", "default", "large"
    shadow = "default", // "none", "small", "default", "large"
    hover = false,
    onClick,
    ...props
}) => {
    const baseClasses = "bg-white rounded-lg border border-gray-200";

    const paddingClasses = {
        none: "",
        small: "p-3",
        default: "p-6",
        large: "p-8"
    };

    const shadowClasses = {
        none: "",
        small: "shadow-sm",
        default: "shadow",
        large: "shadow-lg"
    };

    const hoverClasses = hover ? "hover:shadow-lg transition-shadow cursor-pointer" : "";

    const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${className}`;

    return (
        <div
            className={classes}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    padding: PropTypes.oneOf(['none', 'small', 'default', 'large']),
    shadow: PropTypes.oneOf(['none', 'small', 'default', 'large']),
    hover: PropTypes.bool,
    onClick: PropTypes.func
};

export default Card;
