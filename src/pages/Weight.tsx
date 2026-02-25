import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

type WeightLog = {
  id: string;
  weight: number;
  recorded_at: string;
};

export default function Weight() {
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [inputWeight, setInputWeight] = useState('');
  const [history, setHistory] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 获取体重记录
  const fetchWeights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setHistory(data);
        if (data.length > 0) {
          setCurrentWeight(data[data.length - 1].weight);
        }
      }
    } catch (error) {
      console.error('Error fetching weight logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  // 添加体重记录
  const handleAddWeight = async () => {
    if (!inputWeight) return;
    const newWeight = parseFloat(inputWeight);
    if (isNaN(newWeight)) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('weight_logs')
        .insert([
          { user_id: user.id, weight: newWeight }
        ]);

      if (error) throw error;

      setInputWeight('');
      fetchWeights(); // 重新加载数据
    } catch (error) {
      console.error('Error adding weight:', error);
      alert('添加失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除记录
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchWeights();
    } catch (error) {
      console.error('Error deleting weight:', error);
    }
  };

  const startWeight = history.length > 0 ? history[0].weight : (currentWeight || 70);
  const goalWeight = 65.0; // 这里暂时写死，后续可以做到个人资料里
  const progress = currentWeight 
    ? ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100 
    : 0;

  // 格式化图表数据
  const chartData = history.map(log => ({
    day: format(new Date(log.recorded_at), 'MM/dd'),
    weight: log.weight
  }));

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">体重管理</h1>

      {/* 当前状态卡片 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 text-sm mb-2">当前体重</p>
        <div className="text-4xl font-bold text-primary mb-2">
          {currentWeight || '--'} <span className="text-lg text-gray-400 font-normal">kg</span>
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
        <p className="text-xs text-gray-400 mt-2">
          {currentWeight ? `距离目标还差 ${(currentWeight - goalWeight).toFixed(1)} kg` : '开始记录你的第一条体重吧'}
        </p>
      </div>

      {/* 趋势图 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-64">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">体重趋势</h3>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
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
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            暂无数据
          </div>
        )}
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
          disabled={submitting}
          className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center min-w-[3rem]"
        >
          {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">历史记录</h3>
        {history.slice().reverse().map((log) => (
          <div key={log.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-50">
            <span className="text-gray-600">{format(new Date(log.recorded_at), 'yyyy-MM-dd HH:mm')}</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-800">{log.weight} kg</span>
              <button onClick={() => handleDelete(log.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
