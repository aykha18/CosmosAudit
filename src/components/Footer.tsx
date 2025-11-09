import React from 'react';
import { Shield, Twitter, Linkedin, Github, Mail } from 'lucide-react';

interface FooterProps {
  onStartAssessment?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onStartAssessment }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-audit-electric to-audit-purple rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CosmosAudit</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              AI-powered smart contract security audits in 60 seconds. Detect vulnerabilities and ensure MiCA/SEC compliance before deployment.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/cosmosaudit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-audit-electric transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/cosmosaudit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-audit-electric transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/cosmosaudit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-audit-electric transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@cosmosaudit.com"
                className="text-gray-400 hover:text-audit-electric transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={onStartAssessment}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Take Assessment
                </button>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-400 hover:text-white transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('co-creator')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Our Story
                </button>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#guides" className="text-gray-400 hover:text-white transition-colors">
                  Security Guides
                </a>
              </li>
              <li>
                <a href="#case-studies" className="text-gray-400 hover:text-white transition-colors">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#community" className="text-gray-400 hover:text-white transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#support" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; 2025 CosmosAudit. All rights reserved. Securing Web3, one contract at a time.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </a>
              <a href="#security" className="text-gray-400 hover:text-white transition-colors text-sm">
                Security
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-gray-500 text-sm font-semibold">TRUSTED BY</div>
            <div className="text-gray-500 text-sm">Ethereum Foundation</div>
            <div className="text-gray-500 text-sm">Polygon</div>
            <div className="text-gray-500 text-sm">Arbitrum</div>
            <div className="text-gray-500 text-sm">Web3 Security Alliance</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
