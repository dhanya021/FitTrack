import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Dumbbell,
  Clock,
  Flame,
  Footprints,
  Droplets,
  Moon,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { workoutService } from '../../services/workoutService';
import { activityService } from '../../services/activityService';
import { waterService } from '../../services/waterService';
import { sleepService } from '../../services/sleepService';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { formatDate, formatNumber } from '../../utils/formatters';

export const Progress = () => {
  const [timeframe, setTimeframe] = useState('30'); // '7', '30', '90'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [workouts, setWorkouts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [waterData, setWaterData] = useState({ entries: [], waterGoal: 2500 });
  const [sleepData, setSleepData] = useState({ sleepLogs: [], sleepGoal: 8 });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [wRes, aRes, watRes, sRes] = await Promise.all([
        workoutService.getWorkouts(),
        activityService.getActivities({ days: timeframe }),
        waterService.getWaterEntries({ days: timeframe }),
        sleepService.getSleepEntries({ days: timeframe })
      ]);

      if (wRes.success) setWorkouts(wRes.data);
      if (aRes.success) setActivities(aRes.data);
      if (watRes.success) setWaterData(watRes.data);
      if (sRes.success) setSleepData(sRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load progress analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  // Filter workouts for selected timeframe
  const numDays = parseInt(timeframe, 10);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (numDays - 1));
  cutoffDate.setHours(0, 0, 0, 0);

  const filteredWorkouts = workouts.filter((w) => new Date(w.date) >= cutoffDate);

  // 1. Workout Statistics
  const workoutCount = filteredWorkouts.length;
  const totalWorkoutDuration = filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgWorkoutDuration = workoutCount > 0 ? Math.round(totalWorkoutDuration / workoutCount) : 0;

  // 2. Activity / Steps / Calories Statistics
  const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
  const avgSteps = activities.length > 0 ? Math.round(totalSteps / activities.length) : 0;

  const totalWorkoutCalories = filteredWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalActivityCalories = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
  const totalCalories = totalWorkoutCalories + totalActivityCalories;

  // 3. Hydration Statistics
  const totalWaterLogged = waterData.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const avgWater = activities.length > 0 ? Math.round(totalWaterLogged / activities.length) : 0;

  // 4. Sleep Statistics
  const sleepLogs = sleepData.sleepLogs || [];
  const totalSleepHours = sleepLogs.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgSleepHours = sleepLogs.length > 0 ? totalSleepHours / sleepLogs.length : 0;
  const avgSleepH = Math.floor(avgSleepHours);
  const avgSleepM = Math.round((avgSleepHours - avgSleepH) * 60);

  // Build daily timeline array for charts
  const timelineMap = {};
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    timelineMap[key] = {
      date: key,
      formattedDate: formatDate(d, { month: 'short', day: 'numeric' }),
      workoutsCount: 0,
      workoutDuration: 0,
      calories: 0,
      steps: 0,
      water: 0,
      sleep: 0
    };
  }

  // Populate timeline with workouts
  filteredWorkouts.forEach((w) => {
    const key = new Date(w.date).toISOString().split('T')[0];
    if (timelineMap[key]) {
      timelineMap[key].workoutsCount += 1;
      timelineMap[key].workoutDuration += w.duration || 0;
      timelineMap[key].calories += w.caloriesBurned || 0;
    }
  });

  // Populate timeline with activities
  activities.forEach((a) => {
    const key = new Date(a.date).toISOString().split('T')[0];
    if (timelineMap[key]) {
      timelineMap[key].steps += a.steps || 0;
      timelineMap[key].calories += a.caloriesBurned || 0;
    }
  });

  // Populate timeline with water
  waterData.entries.forEach((wat) => {
    const key = new Date(wat.date || wat.timestamp).toISOString().split('T')[0];
    if (timelineMap[key]) {
      timelineMap[key].water += wat.amount || 0;
    }
  });

  // Populate timeline with sleep
  sleepLogs.forEach((s) => {
    const key = new Date(s.date).toISOString().split('T')[0];
    if (timelineMap[key]) {
      timelineMap[key].sleep = s.duration || 0;
    }
  });

  const timelineData = Object.values(timelineMap);

  return (
    <div className="space-y-8">
      {/* Header with Timeframe filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Progress & Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive breakdown of your long-term athletic transformation.
          </p>
        </div>

        {/* 7, 30, 90 Days filter */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {['7', '30', '90'].map((d) => (
            <button
              key={d}
              onClick={() => setTimeframe(d)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                timeframe === d
                  ? 'bg-white dark:bg-[#131B2A] text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* 6 Key Executive Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Frequency"
          value={workoutCount}
          unit="workouts"
          icon={Dumbbell}
          color="brand"
        />
        <StatCard
          title="Avg Duration"
          value={avgWorkoutDuration}
          unit="min"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Burned"
          value={formatNumber(totalCalories)}
          unit="kcal"
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Avg Steps"
          value={formatNumber(avgSteps)}
          unit="steps/day"
          icon={Footprints}
          color="blue"
        />
        <StatCard
          title="Avg Water"
          value={formatNumber(avgWater)}
          unit="ml/day"
          icon={Droplets}
          color="blue"
        />
        <StatCard
          title="Avg Sleep"
          value={`${avgSleepH}h ${avgSleepM}m`}
          icon={Moon}
          color="purple"
        />
      </div>

      {/* 6 Grid of Synchronized Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Weekly Workouts Frequency Chart */}
        <Card className="p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Workout Frequency
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {workoutCount} sessions completed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily workout frequency distribution
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="workoutsCount" name="Workouts" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 2. Workout Duration Trend */}
        <Card className="p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Workout Duration
              </h3>
              <span className="text-xs font-bold text-indigo-500">
                Avg {avgWorkoutDuration} minutes / session
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Total active workout minutes per day
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="workoutDuration"
                  name="Duration (min)"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. Calories Burned Chart */}
        <Card className="p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Total Calories Burned
              </h3>
              <span className="text-xs font-bold text-amber-500">
                {formatNumber(totalCalories)} kcal total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Workouts + daily active movement
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="progCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  name="Calories (kcal)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#progCal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 4. Steps Chart */}
        <Card className="p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Daily Steps
              </h3>
              <span className="text-xs font-bold text-emerald-500">
                Avg {formatNumber(avgSteps)} steps
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily pedometer logs
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="steps" name="Steps" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 5. Hydration Chart */}
        <Card className="p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5. Water Intake
              </h3>
              <span className="text-xs font-bold text-sky-500">
                Avg {formatNumber(avgWater)} ml / day
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Water logged versus target hydration
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="progWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="water"
                  name="Water (ml)"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#progWater)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 6. Sleep Duration Chart */}
        <Card className="p-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                6. Sleep Duration
              </h3>
              <span className="text-xs font-bold text-purple-500">
                Avg {avgSleepH}h {avgSleepM}m
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nightly rest versus {sleepData.sleepGoal || 8}h recovery target
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 12]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <ReferenceLine
                  y={sleepData.sleepGoal || 8}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Target', fill: '#10b981', fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  name="Hours"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
