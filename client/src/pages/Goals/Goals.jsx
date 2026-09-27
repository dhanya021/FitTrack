import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  TrendingUp,
  Sparkles,
  Award
} from 'lucide-react';
import { goalService } from '../../services/goalService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const CATEGORIES = [
  'All',
  'Steps',
  'Workouts',
  'Water',
  'Sleep',
  'Distance',
  'Calories',
  'Active Minutes'
];

const DEFAULT_UNITS = {
  Steps: 'steps',
  Workouts: 'workouts',
  Water: 'ml',
  Sleep: 'hrs',
  Distance: 'km',
  Calories: 'kcal',
  'Active Minutes': 'min'
};

export const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [progressVal, setProgressVal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Workouts',
    target: 5,
    current: 0,
    unit: 'workouts',
    deadline: '',
    status: 'In Progress'
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const params = categoryFilter !== 'All' ? { category: categoryFilter } : {};
      const res = await goalService.getGoals(params);
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch fitness goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [categoryFilter]);

  const handleOpenCreate = () => {
    setCurrentGoal(null);
    setFormData({
      title: '',
      category: 'Workouts',
      target: 5,
      current: 0,
      unit: 'workouts',
      deadline: '',
      status: 'In Progress'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      title: goal.title,
      category: goal.category,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      status: goal.status
    });
    setIsModalOpen(true);
  };

  const handleOpenQuickProgress = (goal) => {
    setCurrentGoal(goal);
    setProgressVal(goal.current);
    setIsProgressOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (currentGoal) {
        await goalService.updateGoal(currentGoal._id, formData);
        setSuccess('Goal updated successfully!');
      } else {
        await goalService.createGoal(formData);
        setSuccess('New fitness goal created!');
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    if (!currentGoal) return;
    try {
      setSubmitting(true);
      setError('');
      await goalService.updateGoal(currentGoal._id, { current: Number(progressVal) });
      setSuccess('Progress updated!');
      setIsProgressOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to update progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      const newStatus = goal.status === 'Completed' ? 'In Progress' : 'Completed';
      await goalService.updateGoal(goal._id, { status: newStatus });
      setSuccess(`Goal marked as ${newStatus}!`);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to toggle goal status');
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await goalService.deleteGoal(id);
      setSuccess('Goal removed.');
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to delete goal');
    }
  };

  const completedCount = goals.filter((g) => g.status === 'Completed').length;
  const inProgressCount = goals.filter((g) => g.status === 'In Progress').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Fitness Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Target milestones for steps, workouts, sleep, hydration, and calories.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create Goal
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Goal Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Goals</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{goals.length}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">In Progress</p>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{inProgressCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Completed</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Completion Rate</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <LoadingSpinner text="Loading fitness goals..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Goals Found"
          description="Setting measurable targets is the secret to consistency. Create your first goal today!"
          actionLabel="Create Goal"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const isCompleted = goal.status === 'Completed';

            return (
              <Card
                key={goal._id}
                className={`p-5 flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                      {goal.category}
                    </span>
                    <button
                      onClick={() => handleToggleComplete(goal)}
                      title="Toggle completion"
                      className="cursor-pointer"
                    >
                      <Badge variant={isCompleted ? 'completed' : 'progress'}>
                        {goal.status}
                      </Badge>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {goal.title}
                  </h3>

                  {/* Progress Bar & Numerical Target */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                        {goal.current}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          / {goal.target} {goal.unit}
                        </span>
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {goal.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target Date: {formatDate(goal.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenQuickProgress(goal)}
                    leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
                  >
                    Update Progress
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentGoal ? 'Edit Goal' : 'Create Fitness Goal'}
        subtitle="Set an ambitious milestone to challenge yourself"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Run 100km this month"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  setFormData({
                    ...formData,
                    category: cat,
                    unit: DEFAULT_UNITS[cat] || formData.unit
                  });
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Target"
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                required
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Current"
                type="number"
                min="0"
                value={formData.current}
                onChange={(e) => setFormData({ ...formData, current: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Unit"
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
          </div>

          <Input
            label="Target Deadline (Optional)"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {currentGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Progress Update Modal */}
      <Modal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        title="Update Progress"
        subtitle={currentGoal?.title}
      >
        <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
          <Input
            label={`Current ${currentGoal?.unit || 'Progress'}`}
            type="number"
            min="0"
            value={progressVal}
            onChange={(e) => setProgressVal(e.target.value)}
            helperText={`Target is ${currentGoal?.target} ${currentGoal?.unit}`}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsProgressOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Progress
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
