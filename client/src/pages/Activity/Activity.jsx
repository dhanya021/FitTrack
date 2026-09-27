import React, { useState, useEffect } from 'react';
import {
  Flame,
  Footprints,
  MapPin,
  Clock,
  Plus,
  Calendar,
  TrendingUp,
  BarChart3,
  Edit2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { activityService } from '../../services/activityService';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatNumber } from '../../utils/formatters';

export const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [timeframe, setTimeframe] = useState('7'); // '7', '30', '90'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: 8000,
    distance: 6.2,
    activeMinutes: 45,
    caloriesBurned: 400
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await activityService.getActivities({ days: timeframe });
      if (res.success) {
        setActivities(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch activity records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [timeframe]);

  const handleOpenLog = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      steps: 8000,
      distance: 6.2,
      activeMinutes: 45,
      caloriesBurned: 400
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await activityService.logActivity(formData);
      setSuccess('Daily activity logged successfully!');
      setIsModalOpen(false);
      fetchActivities();
    } catch (err) {
      setError(err.message || 'Failed to record activity');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregated Summary
  const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
  const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalMinutes = activities.reduce((sum, a) => sum + (a.activeMinutes || 0), 0);
  const totalCalories = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);

  const avgSteps = activities.length > 0 ? Math.round(totalSteps / activities.length) : 0;
  const avgActiveMins = activities.length > 0 ? Math.round(totalMinutes / activities.length) : 0;

  // Chart Data preparation
  const chartData = activities.map((item) => ({
    date: item.date ? item.date.split('T')[0] : '',
    formattedDate: formatDate(item.date, { month: 'short', day: 'numeric' }),
    steps: item.steps || 0,
    calories: item.caloriesBurned || 0,
    distance: item.distance || 0,
    activeMinutes: item.activeMinutes || 0
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Activity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Steps, active movement, distance, and passive calorie expenditure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector: 7, 30, 90 days */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeframe === days
                    ? 'bg-white dark:bg-[#131B2A] text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <Button onClick={handleOpenLog} leftIcon={<Plus className="w-4 h-4" />}>
            Log Activity
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Average Steps"
          value={formatNumber(avgSteps)}
          unit="steps/day"
          icon={Footprints}
          color="brand"
          subtitle={`Total: ${formatNumber(totalSteps)}`}
        />
        <StatCard
          title="Total Distance"
          value={totalDistance.toFixed(1)}
          unit="km"
          icon={MapPin}
          color="blue"
          subtitle={`${activities.length} days logged`}
        />
        <StatCard
          title="Active Minutes"
          value={formatNumber(totalMinutes)}
          unit="mins"
          icon={Clock}
          color="purple"
          subtitle={`Avg ${avgActiveMins}m / day`}
        />
        <StatCard
          title="Activity Calories"
          value={formatNumber(totalCalories)}
          unit="kcal"
          icon={Flame}
          color="amber"
          subtitle="Calories burned"
        />
      </div>

      {/* Steps Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Steps & Distance Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily step count and kilometer coverage for the past {timeframe} days
            </p>
          </div>
          <div className="text-xs font-semibold text-brand-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            Steps (bars)
          </div>
        </div>

        <div className="h-72 mt-4 w-full">
          {loading ? (
            <LoadingSpinner text="Loading charts..." />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar
                  dataKey="steps"
                  name="Steps"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No activity logs recorded for this {timeframe}-day window.
            </div>
          )}
        </div>
      </Card>

      {/* Calories & Active Minutes Dual Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Minutes & Burn Rate
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlation between continuous active movement and calorie expenditure
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Active Mins
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Calories
            </span>
          </div>
        </div>

        <div className="h-72 mt-4 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  dataKey="activeMinutes"
                  name="Active Minutes"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  name="Calories (kcal)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No data available for chart.
            </div>
          )}
        </div>
      </Card>

      {/* Log Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Activity"
        subtitle="Log or update steps and distance for a given day"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Steps"
              type="number"
              min="0"
              value={formData.steps}
              onChange={(e) => {
                const s = Number(e.target.value);
                const d = parseFloat((s * 0.00078).toFixed(2));
                setFormData({ ...formData, steps: s, distance: d });
              }}
              required
            />

            <Input
              label="Distance (km)"
              type="number"
              step="0.1"
              min="0"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Active Minutes"
              type="number"
              min="0"
              value={formData.activeMinutes}
              onChange={(e) => setFormData({ ...formData, activeMinutes: Number(e.target.value) })}
              required
            />

            <Input
              label="Calories Burned"
              type="number"
              min="0"
              value={formData.caloriesBurned}
              onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activity;
