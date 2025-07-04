import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';
import { User, Lock, Bell } from 'lucide-react';

const Settings = () => {
  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState({ email: false, sms: false });
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Fetch profile and notification preferences
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setNotifLoading(true);
      setProfileError(null);
      setNotifError(null);
      try {
        const data = await settingsService.getProfile();
        setProfile({ name: data.name, email: data.email });
        setNotifications(data.notificationPreferences || { email: false, sms: false });
      } catch (err: any) {
        setProfileError('Failed to load profile');
        setNotifError('Failed to load notification preferences');
      } finally {
        setProfileLoading(false);
        setNotifLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Profile handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileError(null);
    setProfileLoading(true);
    try {
      await settingsService.updateProfile(profile);
      setProfileMsg('Profile updated successfully');
      setEditingProfile(false);
    } catch (err: any) {
      setProfileError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password handlers
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await settingsService.changePassword({ currentPassword, newPassword });
      setPwMsg('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  // Notification handlers
  const handleNotifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };
  const handleNotifSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifMsg(null);
    setNotifError(null);
    setNotifLoading(true);
    try {
      await settingsService.updateNotifications(notifications);
      setNotifMsg('Preferences updated successfully');
    } catch (err: any) {
      setNotifError('Failed to update preferences');
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center tracking-tight">Settings</h1>
      <div className="space-y-10">
        {/* Profile Information */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-xl border border-indigo-100 transition-all duration-300 hover:shadow-2xl">
          <div className="px-6 py-7 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-700 rounded-full p-2"><User size={20} /></span>
              <h3 className="text-xl font-semibold leading-6 text-indigo-900">Profile Information</h3>
            </div>
            <hr className="mb-6 border-indigo-100" />
            {profileLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <form className="mt-2 space-y-5" onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 shadow-sm focus:border-indigo-400 focus:ring-indigo-100 sm:text-sm transition"
                      disabled={!editingProfile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 shadow-sm focus:border-indigo-400 focus:ring-indigo-100 sm:text-sm transition"
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
                {editingProfile ? (
                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-blue-500 py-2 px-5 text-sm font-semibold text-white shadow hover:from-indigo-600 hover:to-blue-600 focus:outline-none transition"
                      disabled={profileLoading}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-gray-300 bg-white py-2 px-5 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50 focus:outline-none transition"
                      onClick={() => { setEditingProfile(false); setProfileMsg(null); setProfileError(null); }}
                      disabled={profileLoading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-blue-500 py-2 px-5 text-sm font-semibold text-white shadow hover:from-indigo-600 hover:to-blue-600 focus:outline-none transition"
                    onClick={() => setEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                )}
                <div className="flex gap-2 mt-2">
                  {profileMsg && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full animate-fade-in">{profileMsg}</span>}
                  {profileError && <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full animate-fade-in">{profileError}</span>}
                </div>
              </form>
            )}
          </div>
        </div>
        {/* Change Password */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white shadow-xl border border-blue-100 transition-all duration-300 hover:shadow-2xl">
          <div className="px-6 py-7 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-700 rounded-full p-2"><Lock size={20} /></span>
              <h3 className="text-xl font-semibold leading-6 text-blue-900">Change Password</h3>
            </div>
            <hr className="mb-6 border-blue-100" />
            <form className="mt-2 space-y-5" onSubmit={handlePasswordSave}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-blue-200 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-blue-100 sm:text-sm transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-blue-200 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-blue-100 sm:text-sm transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-blue-200 bg-white px-3 py-2 shadow-sm focus:border-blue-400 focus:ring-blue-100 sm:text-sm transition"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 py-2 px-5 text-sm font-semibold text-white shadow hover:from-blue-600 hover:to-indigo-600 focus:outline-none transition"
                disabled={pwLoading}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
              <div className="flex gap-2 mt-2">
                {pwMsg && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full animate-fade-in">{pwMsg}</span>}
                {pwError && <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full animate-fade-in">{pwError}</span>}
              </div>
            </form>
          </div>
        </div>
        {/* Notification Preferences */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white shadow-xl border border-amber-100 transition-all duration-300 hover:shadow-2xl">
          <div className="px-6 py-7 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-amber-100 text-amber-700 rounded-full p-2"><Bell size={20} /></span>
              <h3 className="text-xl font-semibold leading-6 text-amber-900">Notification Preferences</h3>
            </div>
            <hr className="mb-6 border-amber-100" />
            {notifLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <form className="mt-2 space-y-5" onSubmit={handleNotifSave}>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="emailNotifications"
                      name="email"
                      type="checkbox"
                      checked={notifications.email}
                      onChange={handleNotifChange}
                      className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 transition"
                    />
                    <span className="text-sm text-amber-800">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="smsNotifications"
                      name="sms"
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={handleNotifChange}
                      className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 transition"
                    />
                    <span className="text-sm text-amber-800">SMS Notifications</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-amber-400 to-yellow-400 py-2 px-5 text-sm font-semibold text-white shadow hover:from-amber-500 hover:to-yellow-500 focus:outline-none transition"
                  disabled={notifLoading}
                >
                  Save Preferences
                </button>
                <div className="flex gap-2 mt-2">
                  {notifMsg && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full animate-fade-in">{notifMsg}</span>}
                  {notifError && <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full animate-fade-in">{notifError}</span>}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;