import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, XCircle, RefreshCw, Trophy, BookOpen, AlertCircle } from 'lucide-react';
import { ExamQuestion } from '../types';
import { generateExamQuestions } from '../services/ai';

interface ExamInterfaceProps {
  subjects: string[];
  grade: string;
  onClose: () => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({ subjects, grade, onClose }) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        const q = await generateExamQuestions(subjects, grade);
        if (q.length === 0) throw new Error("No questions generated");
        setQuestions(q);
      } catch (err) {
        setError("Could not generate exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [subjects, grade]);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-gray-800">Generating Your Exam...</h2>
        <p className="text-gray-500">Crafting questions based on {subjects.join(', ')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-gray-800 font-medium mb-4">{error}</p>
        <button onClick={onClose} className="text-indigo-600 hover:underline">Return to Planner</button>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fadeIn">
        <div className="bg-yellow-100 p-6 rounded-full text-yellow-600 mb-2">
          <Trophy size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Exam Complete!</h2>
          <p className="text-gray-500">You scored</p>
          <div className="text-5xl font-bold text-indigo-600 my-2">{percentage}%</div>
          <p className="text-sm text-gray-400">{score} out of {questions.length} correct</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 max-w-xs overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`} 
            style={{ width: `${percentage}%` }}
          />
        </div>

        <button 
          onClick={onClose}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 w-full max-w-xs mt-8"
        >
          Back to Planner
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm z-10 sticky top-0 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <BookOpen size={20} className="text-indigo-600" />
          <span>Question {currentIndex + 1}/{questions.length}</span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">Quit</button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div 
          className="bg-indigo-600 h-1 transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
            {currentQ.question}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let statusClass = "bg-white border-gray-200 hover:border-indigo-300";
            if (isAnswered) {
              if (idx === currentQ.correctAnswerIndex) {
                statusClass = "bg-green-50 border-green-500 ring-1 ring-green-500";
              } else if (idx === selectedOption) {
                statusClass = "bg-red-50 border-red-500 ring-1 ring-red-500";
              } else {
                statusClass = "bg-gray-50 border-gray-100 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center ${statusClass} ${!isAnswered && 'active:scale-[0.98]'}`}
              >
                <span className={`font-medium ${isAnswered && idx === currentQ.correctAnswerIndex ? 'text-green-700' : 'text-gray-700'}`}>
                  {option}
                </span>
                {isAnswered && idx === currentQ.correctAnswerIndex && <CheckCircle size={20} className="text-green-600" />}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctAnswerIndex && <XCircle size={20} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && currentQ.explanation && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800 animate-fadeIn">
            <span className="font-bold block mb-1">Explanation:</span>
            {currentQ.explanation}
          </div>
        )}
      </div>

      {/* Footer */}
      {isAnswered && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg animate-slideUp">
          <div className="max-w-lg mx-auto">
            <button
              onClick={nextQuestion}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              {currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};