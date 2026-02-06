import React, { useState } from 'react';
import { ArrowRight, Book, Clock, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    subjects: [],
    weakSubjects: [],
    dailyHours: 2,
  });

  const [inputValue, setInputValue] = useState('');

  const handleAddSubject = (type: 'subjects' | 'weakSubjects') => {
    if (!inputValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), inputValue.trim()]
    }));
    setInputValue('');
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Finalize
      onComplete({
        name: formData.name || 'Student',
        grade: formData.grade || 'General',
        subjects: formData.subjects || [],
        weakSubjects: formData.weakSubjects || [],
        dailyHours: formData.dailyHours || 2,
        isSetup: true
      });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center bg-white px-8 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! 👋</h1>
        <p className="text-gray-500">Let's set up your personal AI study assistant.</p>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What's your name?</label>
              <input
                type="text"
                className="w-full border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-2 text-lg transition-colors"
                placeholder="Alex"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Grade/Year</label>
              <input
                type="text"
                className="w-full border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-2 text-lg transition-colors"
                placeholder="10th Grade"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What subjects are you studying?</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Math, History..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject('subjects')}
                />
                <button 
                  onClick={() => handleAddSubject('subjects')}
                  className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.subjects?.map((s, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>

            <div className="pt-4">
               <label className="block text-sm font-medium text-gray-700 mb-1">Which do you find most difficult?</label>
               <p className="text-xs text-gray-400 mb-2">We'll allocate more time to these.</p>
               <div className="flex flex-wrap gap-2">
                  {formData.subjects?.map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        const current = formData.weakSubjects || [];
                        const isSelected = current.includes(sub);
                        setFormData({
                          ...formData,
                          weakSubjects: isSelected ? current.filter(s => s !== sub) : [...current, sub]
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        formData.weakSubjects?.includes(sub) 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">How many hours can you study daily?</label>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setFormData({ ...formData, dailyHours: Math.max(0.5, (formData.dailyHours || 0) - 0.5) })}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50"
                >-</button>
                <div className="text-center">
                  <span className="text-4xl font-bold text-indigo-600">{formData.dailyHours}</span>
                  <span className="text-gray-500 ml-1">hrs</span>
                </div>
                <button 
                  onClick={() => setFormData({ ...formData, dailyHours: (formData.dailyHours || 0) + 0.5 })}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50"
                >+</button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-800">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p>We'll create a balanced schedule with breaks included automatically!</p>
            </div>
          </div>
        )}

        <button
          onClick={nextStep}
          disabled={step === 1 && !formData.name}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all mt-8 shadow-lg shadow-indigo-200"
        >
          {step === 3 ? "Create My Plan" : "Next"}
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
};