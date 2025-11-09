import React from 'react';
import { AlertTriangle, DollarSign, Clock } from 'lucide-react';

const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Hidden Cost of Unaudited Smart Contracts
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Every day you deploy without proper security audits, you're gambling with millions. Here's what's at stake.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat Card 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-audit-red/50 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-audit-red/10 rounded-full mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-audit-red" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-audit-red mb-2">₹2,49,000 Cr+</div>
              <div className="text-gray-400 text-lg">Lost to smart contract hacks in 2022-2023</div>
              <p className="text-sm text-gray-500 mt-4">
                Reentrancy attacks, overflow bugs, and logic flaws cost projects everything.
              </p>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-full mb-6 mx-auto">
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">₹41.5L+</div>
              <div className="text-gray-400 text-lg">Average cost of traditional security audits</div>
              <p className="text-sm text-gray-500 mt-4">
                Most startups can't afford proper audits, leaving them vulnerable.
              </p>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-6 mx-auto">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">3-6 weeks</div>
              <div className="text-gray-400 text-lg">Time for manual audits to complete</div>
              <p className="text-sm text-gray-500 mt-4">
                By the time you get results, your launch window is gone.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Context */}
        <div className="mt-16 bg-gradient-to-r from-audit-red/10 to-orange-500/10 rounded-xl p-8 border border-audit-red/20">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">The Regulatory Pressure is Mounting</h3>
          <p className="text-gray-300 text-center max-w-4xl mx-auto">
            With MiCA in Europe and SEC enforcement in the US, regulators are cracking down on non-compliant smart contracts. 
            <strong className="text-white"> Fines start at ₹83L and can reach crores.</strong> Yet most developers lack affordable tools to audit code for both security AND compliance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
