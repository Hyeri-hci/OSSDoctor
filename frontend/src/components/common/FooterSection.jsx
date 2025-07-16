import React from "react";

const FooterSection = () => {
  const footerLinks = [
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Terms of Service", href: "/terms" },
    { text: "Documentation", href: "/docs" },
    { text: "Contact Us", href: "https://github.com/Hyeri-hci/OSSDoctor", target: "_blank"},
  ];

  return (
      <footer className="w-full bg-[#FCFCFD] border-t border-gray-200 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
              
              {/* Left: Copyright */}
              <p className="text-xs text-[#575757]">
                © 2025 OSSDoctor. All rights reserved.
              </p>

              {/* Right: Links */}
              <nav className="flex flex-wrap gap-4 justify-center">
                  {footerLinks.map((link, index) => (
                      <a
                          key={index}
                          href={link.href}
                          target={"_blank"}
                          className="text-xs text-[#575757] hover:underline"
                      >
                          {link.text}
                      </a>
                  ))}
              </nav>
          </div>
          
    </footer>
  );
};

export default FooterSection;