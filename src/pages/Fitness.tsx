import { useState } from 'react';
import { Play, Pause, Square, Plus, Trash2 } from 'lucide-react';

const mockExercises = [
  { id: 1, type: '跑步', duration: 30, calories: 300, date: 'Today' },
  { id: 2, type: '力量训练', duration: 45, calories: 220, date: 'Today' },
];

export default function Fitness() {
  const [exercises, setExercises] = useState(mockExercises);
  const [newExercise, setNewExercise] = useState({ type: '跑步', duration: '', calories: '' });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleAddExercise = () => {
    if (!newExercise.duration || !newExercise.calories) return;
    
    setExercises([...exercises, {
      id: Date.now(),
      type: newExercise.type,
      duration: parseInt(newExercise.duration),
      calories: parseInt(newExercise.calories),
      date: 'Today'
    }]);
    setNewExercise({ type: '跑步', duration: '', calories: '' });
  };

  const handleDelete = (id: number) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">健身日志</h1>

      {/* 快速开始 */}
      <div className="bg-gradient-to-r from-orange-400 to-red-400 p-6 rounded-2xl shadow-lg text-white">
        <h2 className="text-lg font-semibold mb-2">快速开始运动</h2>
        <div className="text-4xl font-mono font-bold mb-4">
          {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            {isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => { setIsTimerRunning(false); setTimer(0); }}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      {/* 手动记录 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-700">手动记录</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <select 
            className="p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50"
            value={newExercise.type}
            onChange={(e) => setNewExercise({...newExercise, type: e.target.value})}
          >
            <option value="跑步">跑步</option>
            <option value="力量训练">力量训练</option>
            <option value="瑜伽">瑜伽</option>
            <option value="HIIT">HIIT</option>
            <option value="游泳">游泳</option>
          </select>
          
          <input 
            type="number" 
            placeholder="时长 (分钟)" 
            className="p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50"
            value={newExercise.duration}
            onChange={(e) => setNewExercise({...newExercise, duration: e.target.value})}
          />
        </div>
        
        <div className="flex gap-4">
          <input 
            type="number" 
            placeholder="消耗热量 (kcal)" 
            className="flex-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/50"
            value={newExercise.calories}
            onChange={(e) => setNewExercise({...newExercise, calories: e.target.value})}
          />
          <button 
            onClick={handleAddExercise}
            className="bg-primary text-white px-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 今日记录列表 */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4">今日运动 ({exercises.length})</h3>
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{exercise.type}</div>
                  <div className="text-xs text-gray-500">{exercise.duration} 分钟 • {exercise.calories} kcal</div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(exercise.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
