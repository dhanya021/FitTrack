import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Footprints,
  Droplets,
  Moon,
  Dumbbell,
  Clock,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
  Trophy,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { userService } from '../../services/userService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { formatNumber, formatDate, formatDuration } from '../../utils/formatters';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLoadDemoData = async () => {
    try {
      setSeedingDemo(true);
      setError('');
      await userService.populateDemoData();
      setSuccessMsg('Demo data successfully generated! Check out your stats and charts below.');
      await fetchDashboard();
    } catch (err) {
      setError(err.message || 'Failed to populate demo data');
    } finally {
      setSeedingDemo(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing your daily fitness statistics..." />;
  }

  const today = data?.today || {};
  const streaks = data?.streaks || { currentStreak: 0, longestStreak: 0 };
  const weekly = data?.weekly || {};
  const weeklyChartData = data?.weeklyChartData || [];
  const recentWorkouts = data?.recentWorkouts || [];
  const goalProgress = data?.goalProgress || [];
  const prefs = data?.preferences || {};

  const stepProgress = prefs.dailyStepGoal
    ? (today.steps / prefs.dailyStepGoal) * 100
    : 0;
  const waterProgress = prefs.waterGoal
    ? (today.waterIntake / prefs.waterGoal) * 100
    : 0;
  const sleepProgress = prefs.sleepGoal
    ? (today.sleepDuration / prefs.sleepGoal) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Messages */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />
      )}

      {/* Header Banner & Demo Callout if brand new */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-950 dark:via-emerald-900/80 dark:to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-emerald-900/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Fitness Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Today's Activity & Performance
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            Live metrics calculated directly from your logged workouts, sleep, hydration, and steps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadDemoData}
            isLoading={seedingDemo}
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md shadow-none"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Load Demo Data
          </Button>

          <Link to="/workouts">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-emerald-900 hover:bg-emerald-50 border-0 shadow-lg"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Streak Highlight Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <Card className="p-5 flex items-center justify-between bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center ring-8 ring-amber-500/5">
              <Flame className="w-7 h-7 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Streak
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {streaks.currentStreak}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {streaks.currentStreak === 1 ? 'day' : 'days'} in a row
                </span>
              </div>
            </div>
          </div>
          <span className="text-2xl">🔥</span>
        </Card>

        {/* Longest Streak */}
        <Card className="p-5 flex items-center justify-between border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center ring-8 ring-purple-500/5">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Best All-Time Streak
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {streaks.longestStreak}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  days record
                </span>
              </div>
            </div>
          </div>
          <span className="text-2xl">🏆</span>
        </Card>

        {/* Weekly Workout Count */}
        <Card className="p-5 flex items-center justify-between border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weekly Workouts
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {weekly.workoutCount || 0}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  / {prefs.weeklyWorkoutGoal || 5} target
                </span>
              </div>
            </div>
          </div>
          <span className="text-2xl">⚡</span>
        </Card>
      </div>

      {/* Today's 6 Key Metrics */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>Today's Metrics</span>
          <span className="text-xs font-normal text-slate-400">
            ({formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })})
          </span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Steps"
            value={formatNumber(today.steps)}
            unit="steps"
            icon={Footprints}
            color="brand"
            progress={stepProgress}
          />

          <StatCard
            title="Calories"
            value={formatNumber(today.caloriesBurned)}
            unit="kcal"
            icon={Flame}
            color="amber"
          />

          <StatCard
            title="Water"
            value={formatNumber(today.waterIntake)}
            unit="ml"
            icon={Droplets}
            color="blue"
            progress={waterProgress}
          />

          <StatCard
            title="Sleep"
            value={today.sleepDuration || 0}
            unit="hrs"
            icon={Moon}
            color="purple"
            progress={sleepProgress}
          />

          <StatCard
            title="Workouts"
            value={today.workoutCount}
            unit="done"
            icon={Dumbbell}
            color="rose"
          />

          <StatCard
            title="Active Time"
            value={today.activeMinutes}
            unit="min"
            icon={Clock}
            color="indigo"
          />
        </div>
      </div>

      {/* Weekly Activity Chart & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Activity & Calories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily steps and active calories burned across the past 7 days
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Calories Burned
              </span>
              <span className="flex items-center gap-1.5 text-sky-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Steps
              </span>
            </div>
          </div>

          <div className="h-72 mt-4 w-full">
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCal)"
                  />
                  <Bar
                    dataKey="steps"
                    name="Steps"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                    opacity={0.7}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No activity data recorded yet this week.
              </div>
            )}
          </div>
        </Card>

        {/* Goal Progress Column */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Goal Progress
              </h3>
              <Link
                to="/goals"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {goalProgress.length > 0 ? (
                goalProgress.map((goal) => (
                  <div key={goal._id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {goal.title}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{goal.category}</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {goal.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p>No active goals yet.</p>
                  <Link to="/goals" className="inline-block mt-2">
                    <Button size="sm" variant="outline">
                      Create Your First Goal
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 -mx-6 -mb-6 p-4 rounded-b-2xl flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weekly Burned:
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatNumber(weekly.caloriesBurned || 0)} kcal
            </span>
          </div>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Workouts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your latest logged training sessions
            </p>
          </div>
          <Link to="/workouts">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              All Workouts
            </Button>
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((workout) => (
              <div
                key={workout._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {workout.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>{formatDate(workout.date)}</span>
                      <span>•</span>
                      <span>{workout.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">
                    ⏱️ {formatDuration(workout.duration)}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    🔥 {workout.caloriesBurned} kcal
                  </span>
                  <Badge variant={workout.difficulty.toLowerCase()}>
                    {workout.difficulty}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No workouts logged yet. Start tracking your fitness journey today!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
