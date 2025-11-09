import React from 'react';
import { Brain, Shield, FileCheck, Zap, Code, Globe } from 'lucide-react';

const SolutionSection: React.FC = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Analysis',
      description: 'GPT-4 explains your contract logic in plain English, identifying issues that static analyzers miss.',
      color: 'audit-electric'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Advanced Security Scanning',
      description: 'Integrates Slither and Mythril to detect reentrancy, overflow, and logic flaws automatically.',
      color: 'audit-green'
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: 'Regulatory Compliance',
      description: 'Maps your code to MiCA, SEC, and FATF requirements, flagging violations before they become liabilities.',
      color: 'audit-purple'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: '60-Second Results',
      description: 'Get comprehensive audit reports in seconds, not weeks. Perfect for rapid development cycles.',
      color: 'orange-500'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Developer-First',
      description: 'Simple upload interface, API access for CI/CD integration, and affordable pricing from ₹8,217/month.',
      color: 'blue-500'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Chain Support',
      description: 'EVM-compatible chains (Ethereum, Polygon, Arbitrum) with Solana and Cosmos coming soon.',
      color: 'green-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-audit-blue via-gray-900 to-audit-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Meet CosmosAudit: Your AI Security Copilot
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Combining GPT-4 intelligence with battle-tested security tools to catch vulnerabilities before they cost you millions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-audit-electric/50 transition-all hover:transform hover:-translate-y-1"
            >
              <div className={`flex items-center justify-center w-16 h-16 bg-${feature.color}/10 rounded-full mb-4`}>
                <div className={`text-${feature.color}`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20" id="how-it-works">
          <h3 className="text-2xl font-bold text-white text-center mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-audit-electric to-audit-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-bold text-white mb-2">Upload Contract</h4>
                  <p className="text-gray-400">Paste your Solidity/Vyper code or upload a file. Support for all EVM chains.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-audit-electric to-audit-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-bold text-white mb-2">AI Analysis</h4>
                  <p className="text-gray-400">Our system scans for vulnerabilities, explains logic, and checks compliance in 60 seconds.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-audit-electric to-audit-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-bold text-white mb-2">Get Results</h4>
                  <p className="text-gray-400">Download detailed PDF report with severity ratings, fix recommendations, and compliance status.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
