import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Zap, Target, Award, Brain, Activity, Clock, Flame } from 'lucide-react';

interface AnalyticsProps {
  habits: any[];
  stats: any;
}

export const Analytics = ({ habits, stats }: AnalyticsProps) => {
  const weeklyData = [
    { name: 'Mon', completion: 65, xp: 120, focus: 70 },
    { name: 'Tue', completion: 80, xp: 200, focus: 85 },
    { name: 'Wed', completion: 45, xp: 150, focus: 60 },
    { name: 'Thu', completion: 90, xp: 300, focus: 95 },
    { name: 'Fri', completion: 70, xp: 250, focus: 80 },
    { name: 'Sat', completion: 55, xp: 180, focus: 65 },
    { name: 'Sun', completion: 85, xp: 280, focus: 90 },
  ];

  const categoryData = [
    { name: 'Health', value: 400 },
    { name: 'Work', value: 300 },
    { name: 'Personal', value: 300 },
    { name: 'Finance', value: 200 },
  ];

  const radarData = [
    { subject: 'Consistency', A: 120, B: 110, fullMark: 150 },
    { subject: 'Intensity', A: 98, B: 130, fullMark: 150 },
    { subject: 'Focus', A: 86, B: 130, fullMark: 150 },
    { subject: 'Sleep', A: 99, B: 100, fullMark: 150 },
    { subject: 'Hydration', A: 85, B: 90, fullMark: 150 },
    { subject: 'Mood', A: 65, B: 85, fullMark: 150 },
  ];

  const COLORS = ['#dc2626', '#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mastery Score', value: stats.masteryScore || 0, icon: Zap, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Current Streak', value: '12 Days', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Focus Level', value: '88%', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total XP', value: stats.xp || 0, icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* XP Velocity Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black uppercase text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              Habit Velocity & XP Growth
            </h4>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-600" /> XP
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-blue-600" /> Focus
              </span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                <Area type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black uppercase text-sm mb-8">Category Focus</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{cat.name}</span>
                </div>
                <span className="text-[10px] font-black">{cat.value} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Radar Mastery */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black uppercase text-sm mb-8">Mastery Radar</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Completion Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black uppercase text-sm mb-8">Daily Completion Rate</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completion" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
