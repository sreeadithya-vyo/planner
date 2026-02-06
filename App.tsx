import React, { useState, useEffect } from 'react';
import { UserProfile, StudyTask, AppView } from './types';
import { generateStudyPlan } from './services/ai';
import { Navigation } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { StudyCard } from './components/StudyCard';
import { ChatInterface } from './components/ChatInterface';
import { ProgressChart } from './components/ProgressChart';
import { ExamInterface } from './components/ExamInterface';
import { Sparkles, Calendar as CalendarIcon, LogOut, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('studyGenius_profile');
    const savedTasks = localStorage.getItem('studyGenius_tasks');

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setCurrentView(AppView.PLANNER);
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (profile) localStorage.setItem('studyGenius_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('studyGenius_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setCurrentView(AppView.PLANNER);
    handleGeneratePlan(newProfile);
  };

  const handleGeneratePlan = async (userProfile: UserProfile) => {
    setIsGenerating(true);
    try {
      const newTasks = await generateStudyPlan(userProfile);
      setTasks(newTasks);
    } catch (error) {
      alert("Failed to generate plan. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const resetApp = () => {
    if(confirm("Are you sure you want to reset your profile?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Render Content based on current View
  const renderContent = () => {
    switch (currentView) {
      case AppView.PLANNER:
        return (
          <div className="p-6 pb-24 min-h-full">
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Today's Plan</h1>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <button 
                onClick={() => profile && handleGeneratePlan(profile)}
                disabled={isGenerating}
                className="bg-indigo-600 text-white p-3 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95"
              >
                {isGenerating ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Sparkles size={20} />
                )}
              </button>
            </header>

            {tasks.length === 0 && !isGenerating ? (
              <div className="text-center py-20 opacity-50">
                <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No plan yet. Tap the sparkle button!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <StudyCard key={task.id} task={task} onToggle={toggleTask} />
                ))}
                
                {/* Start Exam Button - Only shows if tasks exist */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-1">Ready to test yourself?</h3>
                      <p className="text-indigo-200 text-sm mb-4">Take a quick 10-question quiz based on your study plan.</p>
                      <button 
                        onClick={() => setCurrentView(AppView.EXAM)}
                        className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
                      >
                        <GraduationCap size={16} />
                        Start Daily Exam
                      </button>
                    </div>
                    {/* Decorative bg element */}
                    <GraduationCap className="absolute -bottom-4 -right-4 text-indigo-800 opacity-50" size={100} />
                  </div>
                </div>
              </div>
            )}
            
            {isGenerating && tasks.length === 0 && (
              <div className="text-center py-20 text-indigo-600 animate-pulse">
                Generating your perfect schedule...
              </div>
            )}
          </div>
        );

      case AppView.EXAM:
        return (
          <ExamInterface 
            subjects={profile?.subjects || []} 
            grade={profile?.grade || ''}
            onClose={() => setCurrentView(AppView.PLANNER)} 
          />
        );

      case AppView.CHAT:
        return <div className="h-[calc(100vh-60px)]"><ChatInterface /></div>;

      case AppView.PROGRESS:
        return <div className="pb-20"><ProgressChart tasks={tasks} /></div>;

      case AppView.SETTINGS:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <div className="font-medium text-lg">{profile?.name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Grade</label>
                <div className="font-medium">{profile?.grade}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Target Subjects</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile?.subjects.map(s => (
                    <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
              
              <hr className="my-4 border-gray-100" />
              
              <button 
                onClick={resetApp}
                className="flex items-center gap-2 text-red-500 font-medium w-full p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Reset Profile & Data
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!profile || currentView === AppView.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
        {renderContent()}
      </div>
      {/* Hide navigation when in Exam mode */}
      {currentView !== AppView.EXAM && (
        <Navigation currentView={currentView} onNavigate={setCurrentView} />
      )}
    </div>
  );
};

export default App;