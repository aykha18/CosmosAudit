import React, { useState } from 'react';
import { api } from '../services/api';
import AuditProgress from './AuditProgress';

interface AuditRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditComplete: (result: any) => void;
}

const AuditRequestForm: React.FC<AuditRequestFormProps> = ({
  isOpen,
  onClose,
  onAuditComplete
}) => {
  const [activeTab, setActiveTab] = useState<'repo' | 'files'>('repo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditStep, setAuditStep] = useState<string>('clone');
  const [showProgress, setShowProgress] = useState(false);

  // Repository analysis state
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [contractPaths, setContractPaths] = useState('');

  // File analysis state
  const [contractFiles, setContractFiles] = useState<string[]>([]);
  const [currentFileContent, setCurrentFileContent] = useState('');

  const handleRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowProgress(true);
    setAuditStep('clone');

    try {
      const paths = contractPaths.split('\n').map(p => p.trim()).filter(p => p);
      if (paths.length === 0) {
        throw new Error('Please specify at least one contract path');
      }

      const request = {
        repo_url: repoUrl,
        branch,
        contract_paths: paths,
        analysis_type: 'repo' as const,
        run_explainer: true
      };

      // Simulate progress updates (in a real implementation, you'd poll the backend)
      setTimeout(() => setAuditStep('compile'), 2000);
      setTimeout(() => setAuditStep('analyze'), 15000);
      setTimeout(() => setAuditStep('explain'), 30000);
      setTimeout(() => setAuditStep('report'), 45000);

      const result = await api.runAudit(request);
      setShowProgress(false);
      onAuditComplete(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Audit request failed');
      setShowProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (contractFiles.length === 0) {
        throw new Error('Please add at least one contract file');
      }

      const request = {
        contract_files: contractFiles,
        analysis_type: 'files' as const,
        run_explainer: true
      };

      const result = await api.runAudit(request);
      onAuditComplete(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Audit request failed');
    } finally {
      setLoading(false);
    }
  };

  const addContractFile = () => {
    if (currentFileContent.trim()) {
      setContractFiles([...contractFiles, currentFileContent.trim()]);
      setCurrentFileContent('');
    }
  };

  const removeContractFile = (index: number) => {
    setContractFiles(contractFiles.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            setContractFiles(prev => [...prev, content]);
          }
        };
        reader.readAsText(file);
      });
    }
  };

  if (!isOpen) return null;

  if (showProgress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <AuditProgress currentStep={auditStep} isActive={true} />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setShowProgress(false);
                setLoading(false);
                setError(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request AI Smart Contract Audit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'repo'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('repo')}
          >
            Repository Analysis
          </button>
          <button
            className={`px-4 py-2 font-medium ml-4 ${
              activeTab === 'files'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('files')}
          >
            Upload Contracts
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Repository Analysis Tab */}
        {activeTab === 'repo' && (
          <form onSubmit={handleRepoSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repository URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Paths (one per line)
                </label>
                <textarea
                  value={contractPaths}
                  onChange={(e) => setContractPaths(e.target.value)}
                  placeholder="contracts/Token.sol&#10;contracts/Vault.sol"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting Audit...' : 'Start Repository Audit'}
              </button>
            </div>
          </form>
        )}

        {/* File Upload Tab */}
        {activeTab === 'files' && (
          <form onSubmit={handleFileSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Contract Files
                </label>
                <input
                  type="file"
                  accept=".sol"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select one or more .sol files to analyze
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or Paste Contract Code
                </label>
                <textarea
                  value={currentFileContent}
                  onChange={(e) => setCurrentFileContent(e.target.value)}
                  placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;    // Your contract code here&#10;}"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={addContractFile}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Add Contract
                </button>
              </div>

              {/* Display added contracts */}
              {contractFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Contracts to Analyze ({contractFiles.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {contractFiles.map((content, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">
                          Contract {index + 1} ({content.split('\n').length} lines)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeContractFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || contractFiles.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting Audit...' : 'Start File Audit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuditRequestForm;