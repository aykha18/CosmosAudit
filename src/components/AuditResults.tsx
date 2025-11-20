import React from 'react';

interface Finding {
  name: string;
  severity: string;
  function: string;
  line: number;
  extra: any;
}

interface Explanation {
  finding_id: string;
  risk_label: string;
  explanation: string;
  remediation_snippet: string;
  unit_test: string;
  confidence: number;
}

interface AuditResult {
  run_id: string;
  report_url: string;
  summary: {
    findings_count: number;
    status: string;
  };
  findings?: Finding[];
  explanations?: Explanation[];
}

interface AuditResultsProps {
  result: AuditResult;
  onClose: () => void;
}

const AuditResults: React.FC<AuditResultsProps> = ({ result, onClose }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Audit Results</h2>
            <p className="text-gray-600">Run ID: {result.run_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Audit Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-blue-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                result.summary.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {result.summary.status}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Findings:</span>
              <span className="ml-2 font-semibold">{result.summary.findings_count}</span>
            </div>
          </div>
          {result.report_url && (
            <div className="mt-3">
              <a
                href={result.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                📄 View Full Report
              </a>
            </div>
          )}
        </div>

        {/* Findings and Explanations */}
        {result.findings && result.findings.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Security Findings</h3>

            {result.findings.map((finding, index) => {
              const explanation = result.explanations?.find(exp => exp.finding_id === finding.name);

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{finding.name}</h4>
                      <p className="text-gray-600">
                        Function: <code className="bg-gray-100 px-1 rounded">{finding.function}</code> •
                        Line: {finding.line}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                  </div>

                  {explanation && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(explanation.risk_label)}`}>
                            {explanation.risk_label}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Confidence: {(explanation.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-gray-700">{explanation.explanation}</p>
                      </div>

                      {explanation.remediation_snippet && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">💡 Suggested Fix</h5>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                            <code>{explanation.remediation_snippet}</code>
                          </pre>
                        </div>
                      )}

                      {explanation.unit_test && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">🧪 Unit Test</h5>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                            <code>{explanation.unit_test}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(!result.findings || result.findings.length === 0) && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Security Issues Found</h3>
            <p className="text-gray-600">
              The automated analysis completed successfully with no critical findings.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <div>
            {result.report_url && (
              <button
                onClick={() => {
                  // Create a download link for the report
                  const link = document.createElement('a');
                  link.href = result.report_url;
                  link.download = `audit-report-${result.run_id}.json`;
                  link.click();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                📄 Download Report
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditResults;