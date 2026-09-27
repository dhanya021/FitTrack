import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Trash2,
  Coffee,
  GlassWater,
  CupSoda,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { waterService } from '../../services/waterService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatTime, formatNumber } from '../../utils/formatters';

export const Hydration = () => {
  const [data, setData] = useState({
    entries: [],
    todayTotal: 0,
    waterGoal: 2500,
    progressPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWater = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await waterService.getWaterEntries();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load hydration entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const handleAddAmount = async (amt) => {
    const amountNum = Number(amt);
    if (!amountNum || amountNum <= 0) return;

    try {
      setSubmitting(true);
      setError('');
      await waterService.addWaterEntry({ amount: amountNum });
      setSuccess(`Logged +${amountNum}ml of water! Stay refreshed.`);
      setCustomAmount('');
      fetchWater();
    } catch (err) {
      setError(err.message || 'Failed to record water entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await waterService.deleteWaterEntry(id);
      setSuccess('Water entry removed.');
      fetchWater();
    } catch (err) {
      setError(err.message || 'Failed to remove entry');
    }
  };

  const { todayTotal, waterGoal, progressPercentage, entries } = data;
  const remaining = Math.max(0, waterGoal - todayTotal);

  // SVG Circular progress radius & circumference
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, progressPercentage) / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Hydration Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your daily water intake and achieve your hydration goals.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dynamic Hydration Circular Progress Card */}
        <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-sky-500/5 to-transparent border-sky-500/20">
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-52 h-52 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="104"
                cy="104"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="104"
                cy="104"
                r={radius}
                className="text-sky-500 transition-all duration-700 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
              <Droplets className="w-8 h-8 text-sky-500 fill-sky-500/20 mb-1 animate-bounce" />
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(todayTotal)}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {formatNumber(waterGoal)} ml
              </span>
              <span className="text-xs font-bold text-sky-500 mt-1">
                {progressPercentage}%
              </span>
            </div>
          </div>

          <div className="w-full mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            {todayTotal >= waterGoal ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Daily hydration goal reached! 🏆</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drink <strong className="text-sky-500">{formatNumber(remaining)} ml</strong> more to hit your goal today.
              </p>
            )}
          </div>
        </Card>

        {/* Right Column: Quick Add + Custom Amount Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Quick Add Water
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              One-click logging for standard hydration sizes
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAddAmount(250)}
                disabled={submitting}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GlassWater className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    +250 ml
                  </p>
                  <p className="text-xs text-slate-400">Small Glass</p>
                </div>
              </button>

              <button
                onClick={() => handleAddAmount(500)}
                disabled={submitting}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CupSoda className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    +500 ml
                  </p>
                  <p className="text-xs text-slate-400">Water Bottle</p>
                </div>
              </button>

              <button
                onClick={() => handleAddAmount(750)}
                disabled={submitting}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    +750 ml
                  </p>
                  <p className="text-xs text-slate-400">Large Flask</p>
                </div>
              </button>
            </div>

            {/* Custom Amount Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAmount(customAmount);
              }}
              className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-end gap-3"
            >
              <div className="flex-1">
                <Input
                  label="Custom Amount (ml)"
                  type="number"
                  placeholder="e.g. 350"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" isLoading={submitting} leftIcon={<Plus className="w-4 h-4" />}>
                Add Water
              </Button>
            </form>
          </Card>

          {/* Today's Water Log History */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Today's Entries
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Individual water records logged today
            </p>

            {loading ? (
              <LoadingSpinner size="sm" text="Fetching water logs..." />
            ) : entries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No water entries logged yet today. Use the buttons above to log your first drink!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry._id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          +{entry.amount} ml
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {formatTime(entry.timestamp || entry.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Remove entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hydration;
