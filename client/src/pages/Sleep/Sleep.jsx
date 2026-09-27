import React, { useState, useEffect } from 'react';
import {
  Moon,
  Plus,
  Clock,
  Sparkles,
  Calendar,
  Trash2,
  Edit2,
  TrendingUp,
  Smile
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { sleepService } from '../../services/sleepService';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';

const QUALITIES = ['Poor', 'Fair', 'Good', 'Excellent'];

export const Sleep = () => {
  const [sleepData, setSleepData] = useState({
    sleepLogs: [],
    averageSleep: 0,
    sleepGoal: 8,
    totalEntries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSleep, setEditingSleep] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states with ISO date-time defaults
  const getDefaultBedtime = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(23, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const getDefaultWakeTime = () => {
    const d = new Date();
    d.setHours(7, 30, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: getDefaultBedtime(),
    wakeTime: getDefaultWakeTime(),
    quality: 'Good',
    notes: ''
  });

  const fetchSleep = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await sleepService.getSleepEntries({ days: 14 });
      if (res.success) {
        setSleepData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sleep logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleep();
  }, []);

  // Compute calculated duration in hours
  const calculatedDuration = (() => {
    if (!formData.bedtime || !formData.wakeTime) return 0;
    const bed = new Date(formData.bedtime);
    const wake = new Date(formData.wakeTime);
    let diffMs = wake - bed;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
  })();

  const handleOpenCreate = () => {
    setEditingSleep(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      bedtime: getDefaultBedtime(),
      wakeTime: getDefaultWakeTime(),
      quality: 'Good',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingSleep(item);
    setFormData({
      date: new Date(item.date).toISOString().split('T')[0],
      bedtime: new Date(item.bedtime).toISOString().slice(0, 16),
      wakeTime: new Date(item.wakeTime).toISOString().slice(0, 16),
      quality: item.quality,
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingSleep) {
        await sleepService.updateSleepEntry(editingSleep._id, formData);
        setSuccess('Sleep log updated successfully!');
      } else {
        await sleepService.createSleepEntry(formData);
        setSuccess('Sleep record logged successfully!');
      }
      setIsModalOpen(false);
      fetchSleep();
    } catch (err) {
      setError(err.message || 'Failed to save sleep log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await sleepService.deleteSleepEntry(id);
      setSuccess('Sleep entry deleted.');
      fetchSleep();
    } catch (err) {
      setError(err.message || 'Failed to delete sleep entry');
    }
  };

  const { sleepLogs, averageSleep, sleepGoal } = sleepData;

  const chartData = sleepLogs.slice(-7).map((log) => ({
    date: formatDate(log.date, { weekday: 'short', month: 'numeric', day: 'numeric' }),
    duration: log.duration,
    quality: log.quality
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sleep & Recovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track bedtime, wake time, sleep quality, and physiological recovery.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Log Sleep
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Average Sleep Duration"
          value={averageSleep}
          unit="hours"
          icon={Moon}
          color="purple"
          subtitle={`Across ${sleepData.totalEntries} recorded nights`}
        />
        <StatCard
          title="Target Sleep Goal"
          value={sleepGoal}
          unit="hours/night"
          icon={Clock}
          color="blue"
          subtitle="Configured in Settings"
        />
        <StatCard
          title="Latest Sleep Quality"
          value={sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1]?.quality : 'N/A'}
          icon={Smile}
          color="brand"
          subtitle={sleepLogs.length > 0 ? `${sleepLogs[sleepLogs.length - 1]?.duration} hrs logged` : 'No logs yet'}
        />
      </div>

      {/* Sleep Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Sleep Chart
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hours of rest versus your {sleepGoal}h sleep goal reference
            </p>
          </div>
          <div className="text-xs font-semibold text-purple-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Hours Slept
          </div>
        </div>

        <div className="h-72 mt-4 w-full">
          {loading ? (
            <LoadingSpinner text="Loading sleep charts..." />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                  y={sleepGoal}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Goal', fill: '#10b981', fontSize: 11 }}
                />
                <Bar
                  dataKey="duration"
                  name="Hours"
                  fill="#a855f7"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No sleep records available to display chart.
            </div>
          )}
        </div>
      </Card>

      {/* Sleep History Table */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Sleep History
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Detailed breakdown of your sleep sessions
        </p>

        {loading ? (
          <LoadingSpinner size="sm" text="Fetching sleep history..." />
        ) : sleepLogs.length === 0 ? (
          <EmptyState
            icon={Moon}
            title="No Sleep Logs Yet"
            description="Start recording your bedtime and wake times to see actionable recovery insights."
            actionLabel="Log Tonight's Sleep"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sleepLogs.map((log) => (
              <div
                key={log._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {log.duration} hours of sleep
                    </h4>
                    <p className="text-xs text-slate-400">
                      {formatDate(log.date)} • Bed: {formatTime(log.bedtime)} • Wake: {formatTime(log.wakeTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={log.quality === 'Excellent' ? 'primary' : log.quality === 'Good' ? 'blue' : log.quality === 'Fair' ? 'moderate' : 'hard'}>
                    {log.quality}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(log)}
                      className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Log Sleep Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSleep ? 'Edit Sleep Entry' : 'Log Sleep Record'}
        subtitle="Automatic duration calculated based on bedtime and wake time"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Bedtime"
              type="datetime-local"
              value={formData.bedtime}
              onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
              required
            />

            <Input
              label="Wake Time"
              type="datetime-local"
              value={formData.wakeTime}
              onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
              required
            />
          </div>

          {/* Computed Duration Banner */}
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              Calculated Sleep Duration:
            </span>
            <span className="font-extrabold text-sm text-purple-700 dark:text-purple-300">
              {calculatedDuration} hours
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Sleep Quality
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUALITIES.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setFormData({ ...formData, quality: q })}
                  className={`py-2 px-1 text-xs rounded-xl font-bold transition-all ${
                    formData.quality === q
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Woke up once, felt refreshed..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2 px-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingSleep ? 'Save Changes' : 'Log Sleep'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sleep;
