import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Target, Download, Share2, ArrowRight } from 'lucide-react';
import { AssessmentResult, LeadData } from '../types';
import RazorpayCheckout from './payment/RazorpayCheckout';

interface AssessmentResultsProps {
  result: AssessmentResult;
  onClose: () => void;
  leadData: LeadData;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ result, leadData }) => {
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setShowPayment(false);
    alert('🎉 Payment successful! Welcome to the Co-Creator Program!');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <RazorpayCheckout
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
        customerEmail={leadData.email}
        customerName={leadData.name}
        amount={45567}
      />
    );
  }
  const getReadinessInfo = () => {
    switch (result.readinessLevel) {
      case 'priority':
        return {
          title: 'Priority Integration Ready',
          description: 'Your team is highly ready for AI-powered security auditing',
          color: 'text-audit-green',
          bgColor: 'bg-audit-green/10',
          borderColor: 'border-audit-green',
          icon: <CheckCircle className="w-8 h-8 text-audit-green" />
        };
      case 'co_creator_qualified':
        return {
          title: 'Co-Creator Program Qualified',
          description: 'You qualify for our exclusive co-creator program',
          color: 'text-audit-electric',
          bgColor: 'bg-audit-electric/10',
          borderColor: 'border-audit-electric',
          icon: <Target className="w-8 h-8 text-audit-electric" />
        };
      default:
        return {
          title: 'Foundation Building Phase',
          description: 'Let\'s strengthen your security foundation',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500',
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />
        };
    }
  };

  const readinessInfo = getReadinessInfo();

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Your Security Readiness Assessment
        </h2>
        <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${readinessInfo.bgColor} ${readinessInfo.borderColor}`}>
          {readinessInfo.icon}
          <span className={`font-semibold ${readinessInfo.color} ml-3 text-lg`}>
            {readinessInfo.title}
          </span>
        </div>
        <p className="text-gray-400 mt-3">{readinessInfo.description}</p>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-800"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - result.score / 100)}`}
              className="text-audit-electric transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="text-5xl font-bold text-white">{result.score}</div>
            <div className="text-gray-400 text-sm">out of 100</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Personalized Recommendations</h3>
        <div className="space-y-3">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <CheckCircle className="w-5 h-5 text-audit-green mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities Detected */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Common Vulnerabilities to Watch</h3>
        <div className="space-y-3">
          {result.vulnerabilities.map((vuln, index) => (
            <div key={index} className="flex items-start bg-audit-red/10 p-4 rounded-lg border border-audit-red/20">
              <AlertTriangle className="w-5 h-5 text-audit-red mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{vuln}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Your Next Steps</h3>
        <div className="space-y-3">
          {result.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start bg-audit-electric/10 p-4 rounded-lg border border-audit-electric/20">
              <div className="w-6 h-6 bg-audit-electric rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-gray-300">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA based on readiness level */}
      {result.readinessLevel === 'co_creator_qualified' || result.readinessLevel === 'priority' ? (
        <div className="bg-gradient-to-r from-audit-electric to-audit-purple rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            🎉 You Qualify for the Co-Creator Program!
          </h3>
          <p className="text-white/90 mb-6">
            Join 10 visionaries shaping Web3 security. Limited spots at ₹45,567 / $549 (regular ₹1,66,000+)
          </p>
          <button 
            onClick={() => setShowPayment(true)}
            className="bg-white text-audit-blue px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center"
          >
            Claim Your Co-Creator Spot
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="text-white/75 text-sm mt-4">
            ⚡ Only 10 seats available • Lifetime access • Priority support
          </p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Strengthen Your Security?
          </h3>
          <p className="text-gray-400 mb-6">
            Download our comprehensive Smart Contract Security Guide
          </p>
          <button className="bg-gradient-to-r from-audit-electric to-audit-purple text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center">
            Download Free Guide
            <Download className="ml-2 w-5 h-5" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center">
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </button>
        <button className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center">
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </button>
      </div>
    </div>
  );
};

export default AssessmentResults;
