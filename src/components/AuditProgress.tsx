import React from 'react';

interface AuditProgressProps {
  currentStep: string;
  isActive: boolean;
}

const AuditProgress: React.FC<AuditProgressProps> = ({ currentStep, isActive }) => {
  const steps = [
    { id: 'clone', label: 'Repository Cloning', icon: '📥' },
    { id: 'compile', label: 'Smart Contract Compilation', icon: '⚙️' },
    { id: 'analyze', label: 'Security Analysis', icon: '🔍' },
    { id: 'explain', label: 'AI Explanation Generation', icon: '🤖' },
    { id: 'report', label: 'Report Generation', icon: '📊' }
  ];

  const getStepStatus = (stepId: string) => {
    if (!isActive) return 'pending';

    const stepOrder = steps.map(s => s.id);
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-500';
      case 'active': return 'bg-blue-500 border-blue-500 animate-pulse';
      case 'pending': return 'bg-gray-300 border-gray-300';
      default: return 'bg-gray-300 border-gray-300';
    }
  };

  const getConnectorColor = (fromStatus: string, toStatus: string) => {
    if (fromStatus === 'completed' && toStatus === 'completed') return 'bg-green-500';
    if (fromStatus === 'completed' && toStatus === 'active') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Audit in Progress</h3>
        <p className="text-gray-600">Analyzing your smart contract security...</p>
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 -z-10"></div>

        <div className="flex justify-between items-center relative">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                {/* Step block */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl
                    transition-all duration-300 ${getStatusColor(status)}
                    ${status === 'active' ? 'shadow-lg scale-110' : ''}
                  `}>
                    {status === 'completed' ? '✅' : step.icon}
                  </div>

                  <div className="mt-4 text-center max-w-32">
                    <div className={`text-sm font-medium ${
                      status === 'completed' ? 'text-green-700' :
                      status === 'active' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'active' ? 'text-blue-600' :
                      'text-gray-400'
                    }`}>
                      {status === 'completed' ? '✓ Complete' :
                       status === 'active' ? '⟳ Processing...' :
                       '○ Pending'}
                    </div>
                  </div>
                </div>

                {/* Connector line (except for last item) */}
                {!isLast && (
                  <div className="flex-1 mx-4 relative">
                    <div className={`
                      h-2 rounded transition-all duration-500
                      ${getConnectorColor(status, getStepStatus(steps[index + 1].id))}
                    `}></div>
                    {/* Animated particles for active connection */}
                    {status === 'completed' && getStepStatus(steps[index + 1].id) === 'active' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Current status message */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-800 font-medium">
            {isActive ? `Currently: ${steps.find(s => s.id === currentStep)?.label || 'Processing...'}` : 'Preparing audit...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuditProgress;