import React from "react";
import PropTypes from "prop-types";
import { Button, ProjectCard } from "../../../components/common";

const RecommendedProjectsSection = ({
  projects = [],
  loading = false,
  error = null,
}) => {
  const defaultProjects = [
    {
      name: "React",
      description:
        "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      lastCommit: "2023-10-01",
      language: "JavaScript",
      stars: "210k",
      forks: "45k",
      issues: "1.2k",
    },
    {
      name: "Vue.js",
      description:
        "The Progressive JavaScript Framework for building user interfaces.",
      lastCommit: "2023-09-28",
      language: "TypeScript",
      stars: "200k",
      forks: "40k",
      issues: "800",
    },
    {
      name: "TensorFlow",
      description: "An end-to-end open source platform for machine learning.",
      lastCommit: "2023-09-30",
      language: "Python",
      stars: "170k",
      forks: "90k",
      issues: "5k",
    },
  ];

  // When loading
  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="space-y-2 flex-1">
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold">
                  Recommended Projects
                </h2>
                <p className="text-sm lg:text-base xl:text-lg text-gray-600">
                  Explore active open source projects right now.
                </p>
              </div>

              <Button
                className="flex-shrink-0 mt-1"
                size="default"
                onClick={() => (window.location.href = "/ecosystem")}
              >
                View More
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If there's an error or no data, show default projects
  const displayProjects =
    error || projects.length === 0 ? defaultProjects : projects;

  return (
    <section className="py-16">
      <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-2 flex-1">
              <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold">
                Recommended Projects
              </h2>
              <p className="text-sm lg:text-base xl:text-lg text-gray-600">
                Explore active open source projects right now.
              </p>
            </div>

            <Button
              className="flex-shrink-0 mt-1"
              size="default"
              onClick={() => (window.location.href = "/ecosystem")}
            >
              View More
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {displayProjects.map((project, index) => (
              <ProjectCard
                key={index}
                project={project}
                layout="horizontal"
                showImage={true}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

RecommendedProjectsSection.propTypes = {
  // array of project objects
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      // project properties (Required fields)
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      lastCommit: PropTypes.string.isRequired,
      language: PropTypes.string.isRequired,
      stars: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      forks: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
    }),
  ),
  // projects 자체는 필수로 두지 않음 - 기본값([])을 제공하기 때문
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default RecommendedProjectsSection;
