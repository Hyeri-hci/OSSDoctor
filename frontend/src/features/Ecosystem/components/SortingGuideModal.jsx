import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../../../components/common';

const SortingGuideModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sorting Criteria Guide">
      <div className="space-y-6">
        {/* GFI Description Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🏷️ What are Good First Issues (GFI)?
          </h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            Good First Issues are issues suitable for beginners to contribute. 
            Project maintainers mark relatively easy and clear tasks for new contributors.
          </p>
        </div>

        {/* Sorting Criteria Explanation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 Sorting Criteria Explanation</h3>
          
          <div className="space-y-3">
            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-medium text-gray-800">🌟 Beginner Friendly</h4>
              <p className="text-sm text-gray-600">
                Analyzes Good First Issues, project size, documentation quality, etc. 
                and sorts projects by ease of contribution for beginners.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-medium text-gray-800">⭐ Popular (Stars)</h4>
              <p className="text-sm text-gray-600">
                Sorts projects by the number of GitHub Stars. 
                More stars means more developers are interested in the project.
              </p>
            </div>

            <div className="border-l-4 border-purple-400 pl-4">
              <h4 className="font-medium text-gray-800">📅 Recently Updated</h4>
              <p className="text-sm text-gray-600">
                Sorts projects by most recently updated. 
                <span className="font-medium">Criteria:</span> Stars 50+, Forks 5+, Updated after 2023, 3+ Good First Issues
              </p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium text-gray-800">🏷️ Most Good First Issues</h4>
              <p className="text-sm text-gray-600">
                Sorts projects by the number of Good First Issues. 
                Great for beginners with many opportunities to contribute.
              </p>
            </div>

            <div className="border-l-4 border-emerald-400 pl-4">
              <h4 className="font-medium text-gray-800">🎯 Easy Contribution (Beginner)</h4>
              <p className="text-sm text-gray-600">
                Shows only accessible projects with 3+ Good First Issues 
                or less than 5000 Stars.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            💡 Tips for Beginners
          </h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• Start with <strong>&ldquo;Easy Contribution&rdquo;</strong> to build your experience</li>
            <li>• Choose projects with many Good First Issues</li>
            <li>• Make sure to read the project&apos;s CONTRIBUTING.md file</li>
            <li>• Start with documentation typo fixes before code contributions</li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};

SortingGuideModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SortingGuideModal;
