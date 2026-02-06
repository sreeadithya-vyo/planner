import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { StudyTask } from '../types';
import { Trophy, Flame, Target } from 'lucide-react';

interface ProgressChartProps {
  tasks: StudyTask[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ tasks }) => {
  // Mock weekly data based on current tasks for demonstration
  // In a real app, this would come from historical DB data
  const data = [
    { day: 'Mon', minutes: 120 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 150 },
    { day: 'Thu', minutes: 45 },
    { day: 'Fri', minutes: tasks.reduce((acc, t) => t.completed ? acc + t.durationMinutes : acc, 0) }, // Today
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ];

  const totalMinutesToday = tasks.reduce((acc, t) => t.completed ? acc + t.durationMinutes : acc, 0);
  const tasksCompleted = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="p-6 bg-white min-h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Target size={18} />
            <span className="text-sm font-medium">Daily Goal</span>
          </div>
          <div className="text-3xl font-bold">{Math.round((tasksCompleted / (totalTasks || 1)) * 100)}%</div>
          <div className="text-xs opacity-75 mt-1">{tasksCompleted}/{totalTasks} tasks done</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-orange-500">
            <Flame size={18} />
            <span className="text-sm font-medium text-gray-600">Streak</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">4 <span className="text-sm font-normal text-gray-400">days</span></div>
          <div className="text-xs text-gray-400 mt-1">Keep it up!</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Study Time</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="minutes" radius={[4, 4, 4, 4]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.day === 'Fri' ? '#6366f1' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements (Mock) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Achievements</h3>
        <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Trophy size={24} />
          </div>
          <div>
            <h4 className="font-bold text-yellow-900">Early Bird</h4>
            <p className="text-sm text-yellow-700">Completed 3 tasks before 10 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
};