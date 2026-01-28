import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../components/common";

const CVEDetailModal = ({ cve, isOpen, onClose, position }) => {
  if (!cve) return null;

  const getModalPosition = () => {
    if (position) return position;
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? "right" : "center";
    }
    return "center";
  };

  // 심각도별 색상 반환 함수
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-800 bg-red-100";
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-orange-600 bg-orange-50";
      case "low":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // 상태별 색상 반환 함수
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "fixed":
      case "patched":
        return "text-green-600 bg-green-50";
      case "investigating":
        return "text-yellow-600 bg-yellow-50";
      case "received":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // 모달 제목
  const modalTitle = (
    <div className="flex items-center space-x-2">
      <span className="text-lg">🛡️</span>
      <span>{cve.id} Detail</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      position={getModalPosition()}
      className={getModalPosition() === "right" ? "mr-4" : ""}
    >
      <div className="space-y-4">
        {/* Status and Severity */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cve.status)}`}
          >
            {cve.status.toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(cve.severity)}`}
          >
            {cve.severity.toUpperCase()}
          </span>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            {cve.title}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {cve.description}
          </p>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-600">Discovered:</span>
            <span className="ml-2 text-sm font-medium">{cve.date}</span>
          </div>
          <div>
            <span className="text-xs text-gray-600">Status:</span>
            <span
              className={`ml-2 text-sm font-medium ${cve.status === "fixed" ? "text-green-600" : "text-red-600"}`}
            >
              {cve.status === "fixed" ? "Fixed" : "Unresolved"}
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Additional Information
          </h4>
          <p className="text-xs text-blue-800 mb-2">
            For more details about this vulnerability, please visit the
            following link:
          </p>
          <a
            href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            View {cve.id} on NVD Database →
          </a>
        </div>
      </div>
    </Modal>
  );
};

CVEDetailModal.propTypes = {
  cve: PropTypes.shape({
    id: PropTypes.string.isRequired, // cveId
    title: PropTypes.string.isRequired, // cveId (동일)
    description: PropTypes.string.isRequired, // description
    severity: PropTypes.string.isRequired, // severity (LOW, MEDIUM, HIGH, CRITICAL)
    status: PropTypes.string.isRequired, // fixed ? 'fixed' : 'open'
    date: PropTypes.string.isRequired, // detectedAt
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.string,
};

export default CVEDetailModal;
