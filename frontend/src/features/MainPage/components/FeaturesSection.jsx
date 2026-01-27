import React from "react";
import PropTypes from "prop-types";
import { ChartBarIcon, UsersIcon, StarIcon } from "@heroicons/react/24/outline";
import { Card } from "../../../components/common";

const FeaturesSection = ({
  onDiagnosisClick,
  onContributionClick,
  onEcosystemClick,
}) => {
  const features = [
    {
      title: "Project Health Check",
      subtitle: "Project Diagnose",
      description:
        "Diagnose the health and security status of your repository.",
      icon: <ChartBarIcon className="w-12 h-12 text-blue-500" />,
      onClick: onDiagnosisClick,
    },
    {
      title: "Contribution Analysis",
      subtitle: "Contribution Metrics",
      description: "View your contribution history and growth at a glance.",
      icon: <UsersIcon className="w-12 h-12 text-green-500" />,
      onClick: onContributionClick,
    },
    {
      title: "Ecosystem Explorer",
      subtitle: "Ecosystem Discovery",
      description:
        "Find open source projects to upcycle and check popularity rankings.",
      icon: <StarIcon className="w-12 h-12 text-purple-500" />,
      onClick: onEcosystemClick,
    },
  ];

  return (
    <section className="py-16 border-b border-gray-200">
      <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold">
                Key Features
              </h2>
              <p className="text-sm lg:text-base xl:text-lg text-gray-600 max-w-2xl mx-auto">
                Explore the key features that will enrich your open source
                activities.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Desktop version - for 1024px and above */}
            {features.map((feature, index) => (
              <Card
                key={index}
                onClick={feature.onClick}
                hover={true}
                className="hidden lg:block"
                padding="none"
              >
                {/* Image holder area */}
                <div className="bg-gray-100 aspect-[5/4] rounded-t-lg flex items-center justify-center">
                  {/* Placeholder for image */}
                </div>

                {/* 카드 텍스트 콘텐츠 영역 */}
                <div className="flex flex-col px-3 py-4">
                  <h3 className="text-xs lg:text-sm mb-2">{feature.title}</h3>
                  <p className="font-semibold text-xs lg:text-sm mb-2">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}

            {/* Mobile/Tablet version - for below 1024px */}
            {features.map((feature, index) => (
              <Card
                key={`mobile-${index}`}
                onClick={feature.onClick}
                hover={true}
                className="lg:hidden"
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="font-semibold ml-3">{feature.title}</h3>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

FeaturesSection.propTypes = {
  onDiagnosisClick: PropTypes.func,
  onContributionClick: PropTypes.func,
  onEcosystemClick: PropTypes.func,
};

export default FeaturesSection;
