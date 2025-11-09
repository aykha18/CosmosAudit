import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AssessmentResponse, AssessmentResult, LeadData, AssessmentQuestion } from '../types';
import LeadCaptureForm from './LeadCaptureForm';
import AssessmentQuestions, { questions } from './AssessmentQuestions';
import AssessmentResults from './AssessmentResults';
import api from '../services/api';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: AssessmentResult) => void;
}

type AssessmentStep = 'lead_capture' | 'questions' | 'results';

const AssessmentModal: React.FC<AssessmentModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<AssessmentStep>('lead_capture');
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleLeadCapture = async (data: LeadData) => {
    setSaving(true);
    try {
      const response = await api.saveLead(data);
      setLeadId(response.leadId);
      setLeadData(data);
      setStep('questions');
    } catch (error) {
      console.error('Failed to save lead:', error);
      alert('Failed to save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionsComplete = async (questionResponses: AssessmentResponse[]) => {
    setSaving(true);
    try {
      // Calculate score and generate result
      const calculatedResult = calculateAssessmentResult(questionResponses, leadData!);
      
      // Save to backend
      if (leadId) {
        await api.saveAssessment({
          leadId,
          score: calculatedResult.score,
          readinessLevel: calculatedResult.readinessLevel,
          responses: questionResponses
        });
      }
      
      setResult(calculatedResult);
      setStep('results');
      onComplete(calculatedResult);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      alert('Failed to save assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateAssessmentResult = (responses: AssessmentResponse[], lead: LeadData): AssessmentResult => {
    // Simple scoring logic (in production, this would be more sophisticated)
    const totalWeight = responses.reduce((sum, r) => {
      const question = getQuestionById(r.questionId);
      return sum + (question?.weight || 0);
    }, 0);

    const earnedScore = responses.reduce((sum, r) => {
      const question = getQuestionById(r.questionId);
      if (!question) return sum;
      
      // Convert answer to score (simplified)
      let answerScore = 0;
      if (typeof r.answer === 'number') {
        answerScore = r.answer / 10; // Normalize scale answers
      } else if (typeof r.answer === 'string') {
        // Map text answers to scores
        const answerIndex = question.options?.indexOf(r.answer) || 0;
        answerScore = (answerIndex + 1) / (question.options?.length || 1);
      }
      
      return sum + (answerScore * question.weight);
    }, 0);

    const score = Math.round((earnedScore / totalWeight) * 100);

    // Determine readiness level
    let readinessLevel: 'nurture' | 'co_creator_qualified' | 'priority';
    if (score >= 71) {
      readinessLevel = 'priority';
    } else if (score >= 41) {
      readinessLevel = 'co_creator_qualified';
    } else {
      readinessLevel = 'nurture';
    }

    return {
      leadId: `lead_${Date.now()}`,
      score,
      readinessLevel,
      recommendations: generateRecommendations(score, responses),
      vulnerabilities: generateVulnerabilities(responses),
      nextSteps: generateNextSteps(readinessLevel)
    };
  };

  const getQuestionById = (id: string): AssessmentQuestion | undefined => {
    return questions.find(q => q.id === id);
  };

  const generateRecommendations = (score: number, responses: AssessmentResponse[]): string[] => {
    const recommendations = [];
    
    if (score >= 71) {
      recommendations.push('Your team is ready for enterprise-grade AI security auditing');
      recommendations.push('Consider integrating CosmosAudit into your CI/CD pipeline');
      recommendations.push('Qualify for priority onboarding with direct founder support');
    } else if (score >= 41) {
      recommendations.push('Strong foundation for AI-powered security auditing');
      recommendations.push('Focus on improving smart contract testing practices');
      recommendations.push('You qualify for the Co-Creator Program at ₹57,851');
    } else {
      recommendations.push('Start with our free security best practices guide');
      recommendations.push('Strengthen your smart contract development workflow');
      recommendations.push('Join our community for ongoing security education');
    }
    
    return recommendations;
  };

  const generateVulnerabilities = (responses: AssessmentResponse[]): string[] => {
    return [
      'Potential reentrancy vulnerabilities in contract logic',
      'Missing access control modifiers on critical functions',
      'Unchecked external calls that could fail silently'
    ];
  };

  const generateNextSteps = (level: string): string[] => {
    if (level === 'priority') {
      return [
        'Book a 1-on-1 strategy call with our founder',
        'Get your first contract audited free',
        'Join the Co-Creator Program for lifetime access'
      ];
    } else if (level === 'co_creator_qualified') {
      return [
        'Claim your Co-Creator spot at ₹57,851 (limited to 10 seats)',
        'Get lifetime platform access and priority support',
        'Help shape the future of Web3 security'
      ];
    } else {
      return [
        'Download our Smart Contract Security Checklist',
        'Join our weekly security webinars',
        'Get notified when we launch public beta'
      ];
    }
  };

  const handleClose = () => {
    setStep('lead_capture');
    setLeadData(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {step === 'lead_capture' && (
            <LeadCaptureForm onSubmit={handleLeadCapture} />
          )}
          
          {step === 'questions' && leadData && (
            <AssessmentQuestions
              onComplete={handleQuestionsComplete}
              onBack={() => setStep('lead_capture')}
            />
          )}
          
          {step === 'results' && result && (
            <AssessmentResults result={result} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
