import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: '蛋白质', value: 30, color: '#F59E0B' }, // Amber-500
  { name: '碳水', value: 45, color: '#3B82F6' },    // Blue-500
  { name: '脂肪', value: 25, color: '#EAB308' },    // Yellow-500
];

const weeklyData = [
  { name: 'M', intake: 2100, burn: 1800 },
  { name: 'T', intake: 1950, burn: 2000 },
  { name: 'W', intake: 2300, burn: 1900 },
  { name: 'T', intake: 1800, burn: 2100 },
  { name: 'F', intake: 2000, burn: 1950 },
  { name: 'S', intake: 2400, burn: 2200 },
  { name: 'S', intake: 2200, burn: 1600 },
];

export default function Report() {
  return (
    <div className="p-6 max-w-md mx-auto space-y-8 pb-24">
      <h1 className="text-2xl font-bold text-gray-800">周报总结</h1>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-xs text-gray-500 mb-1">平均摄入</div>
          <div className="text-2xl font-bold text-gray-800">2,105</div>
          <div className="text-xs text-gray-400">kcal/天</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-xs text-gray-500 mb-1">平均消耗</div>
          <div className="text-2xl font-bold text-gray-800">1,935</div>
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
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-600">{item.name} {item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 摄入 vs 消耗 柱状图 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">摄入 vs 消耗</h3>
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
          本周运动表现优秀，尤其是周四的HIIT训练消耗了大量热量！不过周三碳水摄入偏高（主要是晚餐），建议下周尝试将晚餐主食减半，增加绿叶蔬菜的摄入。
        </p>
      </div>
    </div>
  );
}
