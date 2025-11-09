import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';

interface NavbarProps {
  onStartAssessment: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStartAssessment }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-audit-blue/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-r from-audit-electric to-audit-purple rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CosmosAudit</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              How It Works
            </button>
            <button
              onClick={onStartAssessment}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Assessment
            </button>
            <button
              onClick={() => scrollToSection('co-creator')}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Our Story
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onStartAssessment}
              className="px-6 py-2 bg-audit-green text-white rounded-lg font-semibold hover:bg-audit-green/90 transition-all"
            >
              Take Assessment
            </button>
            <button
              onClick={() => scrollToSection('co-creator')}
              className="px-6 py-2 bg-gradient-to-r from-audit-electric to-audit-purple text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-audit-electric/50 transition-all"
            >
              Join Co-Creators
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-audit-blue/98 backdrop-blur-md border-t border-gray-700">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={onStartAssessment}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Assessment
            </button>
            <button
              onClick={() => scrollToSection('co-creator')}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Our Story
            </button>
            
            <div className="pt-4 space-y-2">
              <button
                onClick={onStartAssessment}
                className="block w-full px-6 py-3 bg-audit-green text-white rounded-lg font-semibold hover:bg-audit-green/90 transition-all text-center"
              >
                Take Assessment
              </button>
              <button
                onClick={() => scrollToSection('co-creator')}
                className="block w-full px-6 py-3 bg-gradient-to-r from-audit-electric to-audit-purple text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
              >
                Join Co-Creators
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
