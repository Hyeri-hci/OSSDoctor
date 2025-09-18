import React, { useState } from "react";
import PropTypes from "prop-types";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Navigation = ({
    items = [],
    className = "",
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };


    return (
        <>
            {/* Desktop Navigation */}
            <nav className={`hidden lg:flex gap-6 border-l border-gray-200 pl-6 ${className}`}>
                {items.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.onClick ? "#" : (item.href || "#")}
                        onClick={(e) => {
                            if (item.onClick) {
                                e.preventDefault();
                                item.onClick(item);
                            }
                        }}
                        className="text-xs lg:text-sm text-gray-700 font-medium hover:font-bold transition"
                    >
                        {item.label}
                    </a>
                ))}
            </nav>

            {/* Mobile Navigation */}
            <div className={`relative lg:hidden`}>
                <Bars3Icon
                    className="w-6 h-6 text-gray-600 cursor-pointer"
                    onClick={toggleMenu}
                />
                {isMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <nav className="flex flex-col">
                            {items.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.onClick ? "#" : (item.href || "#")}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (item.onClick) {
                                            item.onClick(item);
                                        } else if (item.href && item.href !== '#') {
                                            window.location.href = item.href;
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </>
    );
};

Navigation.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        href: PropTypes.string,
        onClick: PropTypes.func
    })),
    className: PropTypes.string,
};

export default Navigation;
