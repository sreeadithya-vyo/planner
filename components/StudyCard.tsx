import React from 'react';
import { CheckCircle2, Circle, Clock, BookOpen, Coffee, RefreshCcw } from 'lucide-react';
import { StudyTask } from '../types';

interface StudyCardProps {
  task: StudyTask;
  onToggle: (id: string) => void;
}

export const StudyCard: React.FC<StudyCardProps> = ({ task, onToggle }) => {
  const getIcon = () => {
    switch (task.type) {
      case 'break': return <Coffee className="text-orange-500" size={20} />;
      case 'revision': return <RefreshCcw className="text-purple-500" size={20} />;
      default: return <BookOpen className="text-indigo-500" size={20} />;
    }
  };

  const getBgColor = () => {
    if (task.completed) return 'bg-gray-50 border-gray-200 opacity-75';
    switch (task.type) {
      case 'break': return 'bg-orange-50 border-orange-100';
      case 'revision': return 'bg-purple-50 border-purple-100';
      default: return 'bg-white border-gray-100';
    }
  };

  return (
    <div 
      className={`relative p-4 rounded-2xl border transition-all duration-300 shadow-sm ${getBgColor()}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox Area */}
        <button 
          onClick={() => onToggle(task.id)}
          className="mt-1 flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 size={24} className="text-green-500" />
          ) : (
            <Circle size={24} />
          )}
        </button>

        {/* Content Area */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className={`font-semibold text-lg ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.subject}
            </h3>
            <span className="flex items-center text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full">
              <Clock size={12} className="mr-1" />
              {task.durationMinutes} min
            </span>
          </div>
          
          <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.topic}
          </p>

          {task.notes && !task.completed && (
            <div className="text-xs text-gray-500 bg-white/50 p-2 rounded-lg inline-block">
              💡 {task.notes}
            </div>
          )}
        </div>

        {/* Type Icon Badge */}
        <div className="absolute top-4 right-4 opacity-20">
            {getIcon()}
        </div>
      </div>
    </div>
  );
};