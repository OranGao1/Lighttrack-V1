import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

type WeeklyData = {
  name: string;
  intake: number;
  burn: number;
};

type MacroData = {
  name: string;
  value: number;
  color: string;
};

export default function Report() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [macroData, setMacroData] = useState<MacroData[]>([]);
  const [averages, setAverages] = useState({ intake: 0, burn: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const endDate = new Date();
        const startDate = subDays(endDate, 6); // Last 7 days

        // Fetch Diet Logs
        const { data: dietData } = await supabase
          .from('diet_logs')
          .select('calories, protein, carbs, fat, recorded_at')
          .eq('user_id', user.id)
          .gte('recorded_at', startOfDay(startDate).toISOString())
          .lte('recorded_at', endOfDay(endDate).toISOString());

        // Fetch Fitness Logs
        const { data: fitnessData } = await supabase
          .from('fitness_logs')
          .select('calories_burned, recorded_at')
          .eq('user_id', user.id)
          .gte('recorded_at', startOfDay(startDate).toISOString())
          .lte('recorded_at', endOfDay(endDate).toISOString());

        // Process Weekly Data (Bar Chart)
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(endDate, i);
          const dayStr = format(d, 'yyyy-MM-dd');
          const dayName = format(d, 'EEE'); // Mon, Tue...
          
          const dayDiet = dietData?.filter(l => format(new Date(l.recorded_at), 'yyyy-MM-dd') === dayStr);
          const dayFitness = fitnessData?.filter(l => format(new Date(l.recorded_at), 'yyyy-MM-dd') === dayStr);
          
          const intake = dayDiet?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;
          const burn = dayFitness?.reduce((sum, item) => sum + (item.calories_burned || 0), 0) || 0;

          days.push({ name: dayName, intake, burn });
        }
        setWeeklyData(days);

        // Process Averages
        const totalIntake = days.reduce((sum, d) => sum + d.intake, 0);
        const totalBurn = days.reduce((sum, d) => sum + d.burn, 0);
        setAverages({
          intake: Math.round(totalIntake / 7),
          burn: Math.round(totalBurn / 7)
        });

        // Process Macro Data (Pie Chart)
        const totalProtein = dietData?.reduce((sum, item) => sum + (item.protein || 0), 0) || 0;
        const totalCarbs = dietData?.reduce((sum, item) => sum + (item.carbs || 0), 0) || 0;
        const totalFat = dietData?.reduce((sum, item) => sum + (item.fat || 0), 0) || 0;
        const totalMacros = totalProtein + totalCarbs + totalFat;

        if (totalMacros > 0) {
          setMacroData([
            { name: '蛋白质', value: Math.round((totalProtein / totalMacros) * 100), color: '#F59E0B' },
            { name: '碳水', value: Math.round((totalCarbs / totalMacros) * 100), color: '#3B82F6' },
            { name: '脂肪', value: Math.round((totalFat / totalMacros) * 100), color: '#EAB308' },
          ]);
        } else {
            // Default empty state
             setMacroData([
                { name: '蛋白质', value: 33, color: '#F59E0B' },
                { name: '碳水', value: 33, color: '#3B82F6' },
                { name: '脂肪', value: 34, color: '#EAB308' },
              ]);
        }

      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-8 pb-24">
      <h1 className="text-2xl font-bold text-gray-800">周报总结</h1>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-xs text-gray-500 mb-1">平均摄入</div>
          <div className="text-2xl font-bold text-gray-800">{averages.intake}</div>
          <div className="text-xs text-gray-400">kcal/天</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-xs text-gray-500 mb-1">平均消耗</div>
          <div className="text-2xl font-bold text-gray-800">{averages.burn}</div>
          <div className="text-xs text-gray-400">kcal/天</div>
        </div>
      </div>

      {/* 营养分布饼图 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">本周营养结构</h3>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* 中心文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-xs text-gray-400">均衡度</span>
             <span className="text-xl font-bold text-gray-800">良</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-6 mt-4">
          {macroData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-600">{item.name} {item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 摄入 vs 消耗 柱状图 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">近7天 摄入 vs 消耗</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                 cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="intake" fill="#A3E4D7" radius={[4, 4, 0, 0]} name="摄入" />
              <Bar dataKey="burn" fill="#AED6F1" radius={[4, 4, 0, 0]} name="消耗" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI 健康建议 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          ✨ AI 健康建议
        </h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          {averages.intake > averages.burn + 500 
            ? '本周热量摄入略高于消耗，建议适当增加有氧运动时长，或者晚餐减少碳水摄入哦。'
            : '本周热量控制得非常棒！继续保持这种平衡，注意多补充水分和优质蛋白。'}
        </p>
      </div>
    </div>
  );
}
