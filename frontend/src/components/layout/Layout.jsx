import React from "react";
import PropTypes from "prop-types"
import HeaderSection from "./HeaderSection";
import FooterSection from "./FooterSection";

const Layout = ({ children, className = "" }) => {
    return (
        <div className={`min-h-screen flex flex-col ${className}`}>
            {/* Header section with navigation and logo */}
            <HeaderSection />

            {/* Main content area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer section with additional information */}
            <FooterSection />
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

export default Layout;
