import { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type FitnessLog = {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number;
  recorded_at: string;
};

export default function Fitness() {
  const [exercises, setExercises] = useState<FitnessLog[]>([]);
  const [newExercise, setNewExercise] = useState({ type: '跑步', duration: '', calories: '' });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);

  // 计时器逻辑
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 获取今日运动记录
  const fetchFitnessLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('fitness_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', todayStart.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      if (data) setExercises(data);
    } catch (error) {
      console.error('Error fetching fitness logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFitnessLogs();
  }, []);

  const handleAddExercise = async () => {
    if (!newExercise.duration || !newExercise.calories) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.from('fitness_logs').insert([
        {
          user_id: user.id,
          activity_type: newExercise.type,
          duration_minutes: parseInt(newExercise.duration),
          calories_burned: parseInt(newExercise.calories)
        }
      ]);

      if (error) throw error;

      setNewExercise({ type: '跑步', duration: '', calories: '' });
      fetchFitnessLogs();
    } catch (error) {
      console.error('Error adding fitness log:', error);
      alert('添加失败');
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    // 自动填入时长（分钟）
    const minutes = Math.ceil(timer / 60);
    setNewExercise(prev => ({ ...prev, duration: minutes.toString() }));
    // 简单估算热量 (假设跑步 10kcal/min)
    if (newExercise.type === '跑步') {
      setNewExercise(prev => ({ ...prev, calories: (minutes * 10).toString() }));
    }
    setTimer(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    try {
      const { error } = await supabase.from('fitness_logs').delete().eq('id', id);
      if (error) throw error;
      fetchFitnessLogs();
    } catch (error) {
      console.error('Error deleting fitness log:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

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
            onClick={handleStopTimer}
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
        {exercises.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">今天还没运动，动起来！</p>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{exercise.activity_type}</div>
                    <div className="text-xs text-gray-500">{exercise.duration_minutes} 分钟 • {exercise.calories_burned} kcal</div>
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
        )}
      </div>
    </div>
  );
}
