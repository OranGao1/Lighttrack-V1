import { useState, useEffect } from 'react';
import { Camera, Check, X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type DietLog = {
  id: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  recorded_at: string;
};

export default function Diet() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<null | { food: string; calories: number; protein: number; carbs: number; fat: number }>(null);
  const [todayLogs, setTodayLogs] = useState<DietLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取今日饮食记录
  const fetchDietLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('diet_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', todayStart.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      if (data) setTodayLogs(data);
    } catch (error) {
      console.error('Error fetching diet logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietLogs();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    // 模拟 AI 识别延迟
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        food: '香煎鸡胸肉配西兰花',
        calories: 320,
        protein: 35,
        carbs: 12,
        fat: 8
      });
    }, 2000);
  };

  const handleConfirm = async () => {
    if (!scannedResult) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.from('diet_logs').insert([
        {
          user_id: user.id,
          description: scannedResult.food,
          calories: scannedResult.calories,
          protein: scannedResult.protein,
          carbs: scannedResult.carbs,
          fat: scannedResult.fat,
          meal_type: 'lunch', // 简化处理，默认记录为午餐，实际可加选择
          is_ai_generated: true
        }
      ]);

      if (error) throw error;
      
      setScannedResult(null);
      fetchDietLogs();
    } catch (error) {
      console.error('Error saving diet log:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条记录吗？')) return;
    try {
      const { error } = await supabase.from('diet_logs').delete().eq('id', id);
      if (error) throw error;
      fetchDietLogs();
    } catch (error) {
      console.error('Error deleting diet log:', error);
    }
  };

  const handleReset = () => {
    setScannedResult(null);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">AI 智慧饮食</h1>

      {/* 模拟相机区域 */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
        {!scannedResult && !isScanning && (
          <div className="text-center p-6">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">点击下方按钮拍摄食物</p>
            <button 
              onClick={handleScan}
              className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              拍照识别
            </button>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
            <Loader2 className="w-10 h-10 animate-spin mb-2" />
            <p>AI 正在分析食物成分...</p>
          </div>
        )}

        {scannedResult && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}>
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <div className="flex justify-between items-end">
                   <div>
                      <h3 className="font-bold text-lg">{scannedResult.food}</h3>
                      <p className="text-primary font-bold">{scannedResult.calories} kcal</p>
                   </div>
                   <button onClick={handleReset} className="bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm">
                      <X className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* 识别结果详情 */}
      {scannedResult && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-gray-800">营养成分估算</h3>
             <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">高蛋白</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-orange-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500 mb-1">蛋白质</div>
              <div className="font-bold text-orange-600">{scannedResult.protein}g</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500 mb-1">碳水</div>
              <div className="font-bold text-blue-600">{scannedResult.carbs}g</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl">
              <div className="text-xs text-gray-500 mb-1">脂肪</div>
              <div className="font-bold text-yellow-600">{scannedResult.fat}g</div>
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            确认记录
          </button>
        </div>
      )}

      {/* 今日饮食记录列表 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">今日记录</h3>
        {todayLogs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">今天还没有记录饮食哦</p>
        ) : (
          <div className="space-y-3">
            {todayLogs.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-medium text-gray-800">{log.description}</div>
                  <div className="text-xs text-gray-500">
                    {log.calories} kcal • 蛋{log.protein}g 碳{log.carbs}g 脂{log.fat}g
                  </div>
                </div>
                <button onClick={() => handleDelete(log.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 手动调整提示 */}
      {!scannedResult && (
        <div className="text-center text-xs text-gray-400 pt-4">
          识别结果不准确？<button className="text-primary underline">手动调整</button>
        </div>
      )}
    </div>
  );
}
