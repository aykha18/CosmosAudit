import React, { useState, useEffect } from 'react';
import { Target, Zap, Users, Crown, ArrowRight } from 'lucide-react';

interface CoCreatorSectionProps {
  onStartAssessment: () => void;
}

const CoCreatorSection: React.FC<CoCreatorSectionProps> = ({ onStartAssessment }) => {
  const [seatsRemaining, setSeatsRemaining] = useState(10);
  const totalSeats = 10;

  // Simulate seat countdown (in production, fetch from backend)
  useEffect(() => {
    const interval = setInterval(() => {
      setSeatsRemaining(prev => Math.max(3, prev - Math.random() > 0.7 ? 1 : 0));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const urgencyLevel = seatsRemaining <= 3 ? 'high' : seatsRemaining <= 5 ? 'medium' : 'low';

  return (
    <section id="co-creator" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-audit-purple/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-audit-electric/10 rounded-full blur-3xl"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-audit-electric to-audit-purple text-white rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          {/* Urgency Badge */}
          {urgencyLevel === 'high' && (
            <div className="absolute top-4 right-4 bg-audit-red text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              🔥 ALMOST FULL
            </div>
          )}
          {urgencyLevel === 'medium' && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              ⚡ LIMITED TIME
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-4">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-semibold">Exclusive Co-Creator Program</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join 10 Visionaries Shaping Web3 Security
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Be among the first to access AI-powered smart contract auditing. Help us build the future of Web3 security.
            </p>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="text-5xl md:text-6xl font-bold mb-2">₹45,567</div>
            <div className="text-lg opacity-90 mb-1">$549 USD</div>
            <div className="text-lg opacity-90 line-through mb-2">Regular price: ₹1,66,000+</div>
            <p className="text-xl opacity-90">
              Assessment-Qualified • Lifetime Access • Shape the Product
            </p>
          </div>

          {/* Value Stack */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="text-center font-semibold mb-4 text-lg">What You Get (₹1,99,200+ Value):</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  <span>Lifetime Platform Access</span>
                </div>
                <span className="font-semibold">₹99,600+/year</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  <span>Personal Security Audit Strategy</span>
                </div>
                <span className="font-semibold">₹41,500</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Direct Founder Access</span>
                </div>
                <span className="font-semibold">₹24,900</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  <span>6-Month Priority Support</span>
                </div>
                <span className="font-semibold">₹49,800</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  <span>Early Access to New Features</span>
                </div>
                <span className="font-semibold">Priceless</span>
              </div>
            </div>
          </div>

          {/* Seats Remaining */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="font-semibold text-lg">
                ⚡ Only {seatsRemaining} of {totalSeats} visionary spots remaining
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${((totalSeats - seatsRemaining) / totalSeats) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-2 opacity-75">
              <span>{totalSeats - seatsRemaining} joined</span>
              <span>{seatsRemaining} remaining</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <button
              onClick={onStartAssessment}
              className="bg-white text-audit-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center group"
            >
              Qualify for Co-Creator Access
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm opacity-75">
              🎯 Take the assessment to see if you qualify for this exclusive program
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold mb-1">Launch First</div>
              <div className="text-sm opacity-75">Get features before anyone else</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">💡</div>
              <div className="font-semibold mb-1">Shape the Product</div>
              <div className="text-sm opacity-75">Your feedback drives development</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold mb-1">Founding Member</div>
              <div className="text-sm opacity-75">Recognition in our community</div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-6">Trusted by Web3 builders who demand security</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            <div className="text-gray-500 font-semibold">DeFi Protocol Founders</div>
            <div className="text-gray-500 font-semibold">Smart Contract Developers</div>
            <div className="text-gray-500 font-semibold">Web3 Security Teams</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoCreatorSection;
