import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Flame,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { workoutService } from '../../services/workoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { formatDate, formatDuration } from '../../utils/formatters';

const WORKOUT_TYPES = [
  'All',
  'Strength',
  'Cardio',
  'Running',
  'Cycling',
  'Walking',
  'Yoga',
  'HIIT',
  'Other'
];

const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Hard'];

export const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Strength',
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    caloriesBurned: 300,
    difficulty: 'Moderate',
    notes: ''
  });

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: search.trim(),
        type: selectedType,
        difficulty: selectedDifficulty,
        sortBy,
        order: sortOrder
      };
      const res = await workoutService.getWorkouts(params);
      if (res.success) {
        setWorkouts(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkouts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedType, selectedDifficulty, sortBy, sortOrder]);

  const handleOpenCreate = () => {
    setCurrentWorkout(null);
    setFormData({
      name: '',
      type: 'Strength',
      date: new Date().toISOString().split('T')[0],
      duration: 45,
      caloriesBurned: 300,
      difficulty: 'Moderate',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (workout) => {
    setCurrentWorkout(workout);
    setFormData({
      name: workout.name,
      type: workout.type,
      date: new Date(workout.date).toISOString().split('T')[0],
      duration: workout.duration,
      caloriesBurned: workout.caloriesBurned,
      difficulty: workout.difficulty,
      notes: workout.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (workout) => {
    setCurrentWorkout(workout);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (workout) => {
    setCurrentWorkout(workout);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.duration || !formData.caloriesBurned) {
      setError('Please fill in all required workout fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      if (currentWorkout) {
        await workoutService.updateWorkout(currentWorkout._id, formData);
        setSuccess('Workout updated successfully!');
      } else {
        await workoutService.createWorkout(formData);
        setSuccess('Workout logged successfully!');
      }
      setIsModalOpen(false);
      fetchWorkouts();
    } catch (err) {
      setError(err.message || 'Failed to save workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentWorkout) return;
    try {
      setSubmitting(true);
      setError('');
      await workoutService.deleteWorkout(currentWorkout._id);
      setSuccess('Workout deleted successfully.');
      setIsDeleteOpen(false);
      fetchWorkouts();
    } catch (err) {
      setError(err.message || 'Failed to delete workout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log, track, and analyze your workout sessions.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Log Workout
        </Button>
      </div>

      {/* Messages */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search, Filter, Sort Controls */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              placeholder="Search by workout name or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f);
                setSortOrder(o);
              }}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="duration-desc">Longest Duration</option>
              <option value="caloriesBurned-desc">Highest Calories</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* Types Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {WORKOUT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedType === type
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Difficulty:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Workouts Grid */}
      {loading ? (
        <LoadingSpinner text="Loading workouts..." />
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No Workouts Found"
          description="You haven't logged any workouts matching this filter or search. Log your session now to keep your streak going!"
          actionLabel="Log a Workout"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <Card
              key={workout._id}
              className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                        {workout.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {formatDate(workout.date)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={workout.difficulty.toLowerCase()}>
                    {workout.difficulty}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formatDuration(workout.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Flame className="w-4 h-4 text-emerald-500" />
                    <span>{workout.caloriesBurned} kcal</span>
                  </div>
                </div>

                {workout.notes && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    "{workout.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                  {workout.type}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenDetail(workout)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(workout)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Workout"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(workout)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentWorkout ? 'Edit Workout' : 'Log New Workout'}
        subtitle="Keep your streak and performance records up to date"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Workout Name"
            placeholder="e.g. Morning 5k Run or Chest & Triceps"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                {WORKOUT_TYPES.filter((t) => t !== 'All').map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                {DIFFICULTIES.filter((d) => d !== 'All').map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />

            <Input
              label="Calories Burned"
              type="number"
              min="0"
              value={formData.caloriesBurned}
              onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Notes & Exercises
            </label>
            <textarea
              rows="3"
              placeholder="Reps, sets, weights, or how your body felt..."
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
              {currentWorkout ? 'Save Changes' : 'Log Workout'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={currentWorkout?.name || 'Workout Details'}
        subtitle={currentWorkout ? formatDate(currentWorkout.date) : ''}
      >
        {currentWorkout && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <span className="text-xs font-semibold text-slate-500">Category & Intensity</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {currentWorkout.type}
                </span>
                <Badge variant={currentWorkout.difficulty.toLowerCase()}>
                  {currentWorkout.difficulty}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p className="text-xs text-slate-400">Duration</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {formatDuration(currentWorkout.duration)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p className="text-xs text-slate-400">Calories Burned</p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {currentWorkout.caloriesBurned} kcal
                </p>
              </div>
            </div>

            {currentWorkout.notes && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Workout Notes
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {currentWorkout.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenEdit(currentWorkout);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Workout"
        subtitle="This action cannot be undone."
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{currentWorkout?.name}"</strong>?
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={submitting}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Workouts;
