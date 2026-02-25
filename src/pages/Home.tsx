import { Link } from 'react-router-dom';
import { Scale, Utensils, Dumbbell, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [summary, setSummary] = useState({ intake: 0, burned: 0 });

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 获取今日摄入
        const { data: dietData } = await supabase
          .from('diet_logs')
          .select('calories')
          .eq('user_id', user.id)
          .gte('recorded_at', todayStart.toISOString());

        // 获取今日消耗
        const { data: fitnessData } = await supabase
          .from('fitness_logs')
          .select('calories_burned')
          .eq('user_id', user.id)
          .gte('recorded_at', todayStart.toISOString());

        const totalIntake = dietData?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;
        const totalBurned = fitnessData?.reduce((sum, item) => sum + (item.calories_burned || 0), 0) || 0;

        setSummary({ intake: totalIntake, burned: totalBurned });
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    }

    fetchSummary();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto space-y-8">
      <header className="pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">LightTrack</h1>
        <p className="text-gray-500 mt-1">极简主义 AI 饮食与体重管理</p>
      </header>

      {/* 今日概览卡片 */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-6 rounded-2xl shadow-sm border border-primary/10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">今日概览</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 p-4 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">摄入</div>
            <div className="text-2xl font-bold text-gray-800">{summary.intake} <span className="text-xs font-normal text-gray-500">kcal</span></div>
          </div>
          <div className="bg-white/80 p-4 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">消耗</div>
            <div className="text-2xl font-bold text-gray-800">{summary.burned} <span className="text-xs font-normal text-gray-500">kcal</span></div>
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">快速记录</h2>
        <div className="grid grid-cols-1 gap-4">
          <Link to="/weight" className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">记录体重</h3>
              <p className="text-xs text-gray-500">记录今日变化，查看趋势</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300" />
          </Link>

          <Link to="/diet" className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">AI 饮食识别</h3>
              <p className="text-xs text-gray-500">拍照自动计算热量</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300" />
          </Link>

          <Link to="/fitness" className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600 mr-4">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">健身日志</h3>
              <p className="text-xs text-gray-500">记录运动时长与消耗</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300" />
          </Link>
        </div>
      </div>
      
      {/* 报表预览 */}
       <div className="pt-4">
        <Link to="/report" className="block p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 hover:bg-gray-100 transition-colors">
          查看详细周报与健康建议
        </Link>
      </div>
    </div>
  );
}
