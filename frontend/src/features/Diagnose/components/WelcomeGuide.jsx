import React from "react";
import {
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const WelcomeGuide = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <DocumentMagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Diagnose GitHub Repository
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis of health and security for open source projects
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <MagnifyingGlassIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Project Analysis</h3>
          <p className="text-sm text-gray-600">
            Analyze overall project status including activity, community, and
            popularity
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <ShieldCheckIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Security Check</h3>
          <p className="text-sm text-gray-600">
            Identify known vulnerabilities and security issues to assess safety
          </p>
        </div>

        <div className="text-center md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <ChartBarIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Detailed Report</h3>
          <p className="text-sm text-gray-600">
            Provides scores along with specific recommendations for improvement
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">How to Get Started</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">
              1
            </span>
            <span>Enter a GitHub repository URL in the search box above</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">
              2
            </span>
            <span>
              Example:{" "}
              <code className="bg-white px-2 py-1 rounded text-xs">
                microsoft/vscode
              </code>{" "}
              or{" "}
              <code className="bg-white px-2 py-1 rounded text-xs">
                https://github.com/microsoft/vscode
              </code>
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">
              3
            </span>
            <span>
              Click the Diagnose button to view comprehensive analysis results
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuide;
