import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import CoCreatorSection from './components/CoCreatorSection';
import Footer from './components/Footer';
import AssessmentModal from './components/AssessmentModal';
import AuditRequestForm from './components/AuditRequestForm';
import AuditResults from './components/AuditResults';
import AdminDashboard from './pages/AdminDashboard';
import PaymentTest from './pages/PaymentTest';
import { AssessmentResult } from './types';
import './App.css';

function App() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash === 'payment-test') {
        setCurrentPage('payment-test');
      } else if (hash === 'audit') {
        setCurrentPage('audit');
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAssessmentComplete = (result: AssessmentResult) => {
    console.log('Assessment completed:', result);
  };

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }

  if (currentPage === 'payment-test') {
    return <PaymentTest />;
  }

  if (currentPage === 'audit') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Direct Audit Access</h1>
            <p className="text-gray-600">Test the AI-powered smart contract auditing system</p>
            <button
              onClick={() => {
                window.location.hash = '';
                setAuditResult(null);
              }}
              className="text-blue-600 hover:text-blue-800 underline mt-2"
            >
              ← Back to Home
            </button>
          </div>
          {auditResult ? (
            <AuditResults
              result={auditResult}
              onClose={() => setAuditResult(null)}
            />
          ) : (
            <AuditRequestForm
              isOpen={true}
              onClose={() => window.location.hash = ''}
              onAuditComplete={(result) => {
                console.log('Audit completed:', result);
                setAuditResult(result);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-audit-blue min-h-screen">
      <Navbar onStartAssessment={() => setIsAssessmentOpen(true)} />
      
      <HeroSection onStartAssessment={() => setIsAssessmentOpen(true)} />
      <ProblemSection />
      
      <div id="features">
        <SolutionSection />
      </div>
      
      <div id="how-it-works">
        {/* How it works section is inside SolutionSection */}
      </div>
      
      <CoCreatorSection onStartAssessment={() => setIsAssessmentOpen(true)} />
      
      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onComplete={handleAssessmentComplete}
      />
      
      <Footer onStartAssessment={() => setIsAssessmentOpen(true)} />
    </div>
  );
}

export default App;
