import React, { useState, useEffect } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Target,
  Palette,
  Sparkles,
  Lock,
  Save,
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Preferences
  const [preferences, setPreferences] = useState({
    dailyStepGoal: user?.preferences?.dailyStepGoal || 10000,
    waterGoal: user?.preferences?.waterGoal || 2500,
    sleepGoal: user?.preferences?.sleepGoal || 8,
    weeklyWorkoutGoal: user?.preferences?.weeklyWorkoutGoal || 5,
    unitPreference: user?.preferences?.unitPreference || 'metric',
    theme: user?.preferences?.theme || 'dark'
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.preferences) {
        setPreferences({
          dailyStepGoal: user.preferences.dailyStepGoal || 10000,
          waterGoal: user.preferences.waterGoal || 2500,
          sleepGoal: user.preferences.sleepGoal || 8,
          weeklyWorkoutGoal: user.preferences.weeklyWorkoutGoal || 5,
          unitPreference: user.preferences.unitPreference || 'metric',
          theme: user.preferences.theme || theme
        });
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');

      const payload = { name, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await userService.updateProfile(payload);
      if (res.success) {
        updateUser(res.data);
        setSuccess('Profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setError('');
      setSuccess('');

      const res = await userService.updateSettings(preferences);
      if (res.success) {
        updateUser({ preferences: res.data });
        setTheme(preferences.theme);
        setSuccess('Fitness goals & preferences saved to your account!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSeedingDemo(true);
      setError('');
      setSuccess('');
      await userService.populateDemoData();
      setSuccess('Demo fitness data successfully populated! Visit Dashboard or Workouts to explore.');
      setIsDemoModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to load demo data');
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your targets, personal information, and app preferences.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Fitness Goals & Targets Configuration */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daily & Weekly Fitness Targets
            </h2>
            <p className="text-xs text-slate-400">
              Personalized thresholds used to calculate your dashboard progress rings
            </p>
          </div>
        </div>

        <form onSubmit={handleSettingsSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Daily Step Goal"
              type="number"
              min="1000"
              step="500"
              value={preferences.dailyStepGoal}
              onChange={(e) =>
                setPreferences({ ...preferences, dailyStepGoal: Number(e.target.value) })
              }
              required
            />

            <Input
              label="Daily Water Goal (ml)"
              type="number"
              min="500"
              step="100"
              value={preferences.waterGoal}
              onChange={(e) =>
                setPreferences({ ...preferences, waterGoal: Number(e.target.value) })
              }
              required
            />

            <Input
              label="Nightly Sleep Goal (Hours)"
              type="number"
              min="4"
              max="14"
              step="0.5"
              value={preferences.sleepGoal}
              onChange={(e) =>
                setPreferences({ ...preferences, sleepGoal: Number(e.target.value) })
              }
              required
            />

            <Input
              label="Weekly Workouts Goal"
              type="number"
              min="1"
              max="14"
              value={preferences.weeklyWorkoutGoal}
              onChange={(e) =>
                setPreferences({ ...preferences, weeklyWorkoutGoal: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Unit Preference
              </label>
              <select
                value={preferences.unitPreference}
                onChange={(e) =>
                  setPreferences({ ...preferences, unitPreference: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                <option value="metric">Metric (Kilometers, Kilocalories, ml)</option>
                <option value="imperial">Imperial (Miles, Kilocalories, fl oz)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Application Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => {
                  setPreferences({ ...preferences, theme: e.target.value });
                  setTheme(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              >
                <option value="dark">Dark Theme (Recommended)</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" isLoading={savingSettings} leftIcon={<Save className="w-4 h-4" />}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Profile & Security */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Account Profile & Security
            </h2>
            <p className="text-xs text-slate-400">
              Manage your identity and authentication credentials
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Change Password (leave blank if unchanged)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Minimum 6 characters"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" isLoading={savingProfile} leftIcon={<Save className="w-4 h-4" />}>
              Update Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Sample Data Demo Section */}
      <Card className="p-6 sm:p-8 border-brand-500/20 bg-gradient-to-r from-brand-500/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Demonstration Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Populate 14-28 days of realistic workouts, steps, sleep, and hydration logs.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsDemoModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-brand-500" />}
          >
            Load Demo Data
          </Button>
        </div>
      </Card>

      {/* Demo Modal Confirmation */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Load Demo Fitness Data?"
        subtitle="Experience all charts, streaks, and analytics immediately"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This will generate realistic workout history, sleep cycles, hydration logs, and active fitness goals for your account so you can test all features and charts with rich data.
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setIsDemoModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSeedDemo} isLoading={seedingDemo} leftIcon={<Sparkles className="w-4 h-4" />}>
            Confirm & Load
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
