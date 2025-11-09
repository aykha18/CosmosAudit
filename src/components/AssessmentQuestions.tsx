import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { AssessmentQuestion, AssessmentResponse } from '../types';

interface AssessmentQuestionsProps {
  onComplete: (responses: AssessmentResponse[]) => void;
  onBack: () => void;
}

const questions: AssessmentQuestion[] = [
  {
    id: 'q1',
    text: 'How many smart contracts has your team deployed to mainnet?',
    type: 'multiple_choice',
    options: ['None yet', '1-3 contracts', '4-10 contracts', '10+ contracts'],
    weight: 10,
    category: 'technical_readiness'
  },
  {
    id: 'q2',
    text: 'Have you experienced any security incidents or vulnerabilities in your contracts?',
    type: 'multiple_choice',
    options: ['Yes, critical issues', 'Yes, minor issues', 'No, but concerned', 'No, and confident'],
    weight: 15,
    category: 'security_awareness'
  },
  {
    id: 'q3',
    text: 'What is your current approach to smart contract security?',
    type: 'multiple_choice',
    options: [
      'No formal audits',
      'Self-review only',
      'Peer review',
      'Professional audit firm',
      'Multiple audit firms'
    ],
    weight: 15,
    category: 'security_awareness'
  },
  {
    id: 'q4',
    text: 'How familiar are you with MiCA, SEC, or FATF compliance requirements?',
    type: 'scale',
    weight: 10,
    category: 'compliance_needs'
  },
  {
    id: 'q5',
    text: 'What is your monthly budget for security audits and compliance?',
    type: 'multiple_choice',
    options: [
      'Less than ₹83,000',
      '₹83,000 - ₹4,15,000',
      '₹4,15,000 - ₹16,60,000',
      '₹16,60,000 - ₹41,50,000',
      'Over ₹41,50,000'
    ],
    weight: 10,
    category: 'budget'
  },
  {
    id: 'q6',
    text: 'How quickly do you need audit results?',
    type: 'multiple_choice',
    options: [
      'Within hours',
      'Within days',
      'Within weeks',
      'No rush'
    ],
    weight: 8,
    category: 'technical_readiness'
  },
  {
    id: 'q7',
    text: 'Which blockchain(s) are you building on?',
    type: 'multiple_choice',
    options: [
      'Ethereum',
      'Polygon/L2s',
      'Solana',
      'Multiple chains',
      'Other'
    ],
    weight: 7,
    category: 'technical_readiness'
  },
  {
    id: 'q8',
    text: 'Rate your team\'s smart contract development expertise (1-10)',
    type: 'scale',
    weight: 10,
    category: 'technical_readiness'
  },
  {
    id: 'q9',
    text: 'What is your biggest security concern?',
    type: 'multiple_choice',
    options: [
      'Reentrancy attacks',
      'Access control issues',
      'Regulatory compliance',
      'Gas optimization',
      'All of the above'
    ],
    weight: 10,
    category: 'security_awareness'
  },
  {
    id: 'q10',
    text: 'Would you integrate automated auditing into your CI/CD pipeline?',
    type: 'multiple_choice',
    options: [
      'Yes, immediately',
      'Yes, after testing',
      'Maybe',
      'No'
    ],
    weight: 5,
    category: 'technical_readiness'
  }
];

// Export questions for use in scoring
export { questions };

const AssessmentQuestions: React.FC<AssessmentQuestionsProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: string | number) => {
    const newResponse: AssessmentResponse = {
      questionId: question.id,
      answer,
      timestamp: new Date()
    };

    const updatedResponses = [...responses.filter(r => r.questionId !== question.id), newResponse];
    setResponses(updatedResponses);

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onComplete(updatedResponses);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === question.id);
  };

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-audit-electric to-audit-purple h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">{question.text}</h3>

        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  getCurrentResponse()?.answer === option
                    ? 'border-audit-electric bg-audit-electric/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    getCurrentResponse()?.answer === option
                      ? 'border-audit-electric bg-audit-electric'
                      : 'border-gray-600'
                  }`}>
                    {getCurrentResponse()?.answer === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Not at all</span>
              <span>Expert level</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`aspect-square rounded-lg border-2 transition-all font-semibold ${
                    getCurrentResponse()?.answer === value
                      ? 'border-audit-electric bg-audit-electric text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {getCurrentResponse() && currentQuestion === questions.length - 1 && (
          <button
            onClick={() => onComplete(responses)}
            className="px-6 py-3 bg-gradient-to-r from-audit-electric to-audit-purple text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center"
          >
            See Results
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentQuestions;
