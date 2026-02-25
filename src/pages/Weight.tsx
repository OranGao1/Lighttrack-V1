import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';

const mockData = [
  { day: 'Mon', weight: 70.5 },
  { day: 'Tue', weight: 70.2 },
  { day: 'Wed', weight: 69.8 },
  { day: 'Thu', weight: 69.9 },
  { day: 'Fri', weight: 69.5 },
  { day: 'Sat', weight: 69.4 },
  { day: 'Sun', weight: 69.2 },
];

export default function Weight() {
  const [currentWeight, setCurrentWeight] = useState(69.2);
  const [inputWeight, setInputWeight] = useState('');
  const [history, setHistory] = useState(mockData);

  const handleAddWeight = () => {
    if (!inputWeight) return;
    const newWeight = parseFloat(inputWeight);
    if (isNaN(newWeight)) return;
    
    setCurrentWeight(newWeight);
    setHistory([...history, { day: 'Today', weight: newWeight }]);
    setInputWeight('');
  };

  const startWeight = 72.0;
  const goalWeight = 65.0;
  const progress = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">体重管理</h1>

      {/* 当前状态卡片 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 text-sm mb-2">当前体重</p>
        <div className="text-4xl font-bold text-primary mb-2">
          {currentWeight} <span className="text-lg text-gray-400 font-normal">kg</span>
        </div>
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
           <span>初始: {startWeight}kg</span>
           <span>目标: {goalWeight}kg</span>
        </div>
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">距离目标还差 {(currentWeight - goalWeight).toFixed(1)} kg</p>
      </div>

      {/* 趋势图 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-64">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">近7天趋势</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={history}>
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#10B981' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#10B981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 记录输入 */}
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="输入今日体重 (kg)" 
          className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={inputWeight}
          onChange={(e) => setInputWeight(e.target.value)}
        />
        <button 
          onClick={handleAddWeight}
          className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center min-w-[3rem]"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
