import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import CoCreatorSection from './components/CoCreatorSection';
import Footer from './components/Footer';
import AssessmentModal from './components/AssessmentModal';
import AdminDashboard from './pages/AdminDashboard';
import PaymentTest from './pages/PaymentTest';
import { AssessmentResult } from './types';
import './App.css';

function App() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash === 'payment-test') {
        setCurrentPage('payment-test');
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
