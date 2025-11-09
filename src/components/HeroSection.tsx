import React from 'react';
import { Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onStartAssessment: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartAssessment }) => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-audit-blue via-gray-900 to-audit-blue flex items-center relative overflow-hidden pt-16">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-audit-electric/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center bg-audit-electric/10 text-audit-electric px-4 py-2 rounded-full text-sm font-medium mb-6 border border-audit-electric/20">
              <span className="w-2 h-2 bg-audit-electric rounded-full mr-2 animate-pulse"></span>
              ₹2,49,000 Cr+ lost to smart contract hacks in 2023
            </div>

            {/* Main Headline - The Hook */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Is Your Smart Contract
              <span className="bg-gradient-to-r from-audit-electric to-audit-purple bg-clip-text text-transparent block mt-2">
                A Ticking Time Bomb?
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              <strong className="text-white">Traditional audits cost ₹41.5L+ and take weeks.</strong> Get AI-powered security audits in 60 seconds. Detect vulnerabilities and ensure MiCA/SEC compliance before deployment.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 text-left justify-center lg:justify-start">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-audit-green mr-2 flex-shrink-0" />
                <span className="text-gray-300">60-second audits</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-audit-green mr-2 flex-shrink-0" />
                <span className="text-gray-300">MiCA/SEC compliant</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-audit-green mr-2 flex-shrink-0" />
                <span className="text-gray-300">₹8,217/month vs ₹41.5L</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onStartAssessment}
              className="bg-gradient-to-r from-audit-electric to-audit-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-audit-electric/50 transition-all duration-300 inline-flex items-center group"
            >
              Take Free Security Assessment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-gray-400 mt-4">
              ✓ No credit card required  ✓ Get results in 2 minutes  ✓ Qualify for co-creator pricing
            </p>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
              <div className="bg-gradient-to-r from-audit-electric to-audit-purple h-12 rounded-lg mb-4 flex items-center px-4">
                <Shield className="w-6 h-6 text-white mr-2" />
                <span className="text-white font-semibold">CosmosAudit Dashboard</span>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Vulnerabilities Detected</span>
                  <span className="text-2xl font-bold text-audit-red">3 Critical</span>
                </div>
                <div className="bg-gray-700 h-2 rounded-full">
                  <div className="bg-gradient-to-r from-audit-red to-orange-500 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-audit-red/10 p-3 rounded-lg border border-audit-red/20">
                    <div className="text-lg font-bold text-audit-red">Reentrancy</div>
                    <div className="text-xs text-gray-400">High Risk</div>
                  </div>
                  <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                    <div className="text-lg font-bold text-orange-500">Overflow</div>
                    <div className="text-xs text-gray-400">Medium Risk</div>
                  </div>
                </div>
                <div className="bg-audit-green/10 p-3 rounded-lg border border-audit-green/20 text-center">
                  <div className="text-sm font-semibold text-audit-green">✓ MiCA Compliant</div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-bounce">
              <div className="text-2xl">🔐</div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-pulse">
              <div className="text-2xl">⚡</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
