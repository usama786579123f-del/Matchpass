import { useState } from 'react';
import { Download, Trash2, AlertTriangle, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const AccountSettings = () => {
  const { user, logout, refreshUser } = useAuth();
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Profile edit state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/users/profile', profileData);
      toast.success('Profile updated.');
      if (typeof refreshUser === 'function') {
        refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/gdpr/request-export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'matchpass-my-data.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Your data export has been downloaded.');
    } catch (err) {
      toast.error('Could not export your data.');
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    setRequesting(true);
    try {
      await api.post('/gdpr/request-deletion', { reason });
      setRequested(true);
      toast.success('Deletion request submitted.');
    } catch (err) {
      toast.error('Could not submit deletion request.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="font-display text-display-sm text-ink">Account settings</h1>
      <p className="mt-1 text-slate-500">Manage your profile, security, and personal data.</p>

      {/* Profile edit */}
      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <User size={16} /> Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">Update your name and contact details.</p>

        <form onSubmit={handleProfileSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
              Phone <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder="e.g. +44 7911 123456"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="input-field cursor-not-allowed bg-slate-50 text-slate-400"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Email can't be changed here. Contact support if you need to update it.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-primary self-start"
          >
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Lock size={16} /> Change password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a strong password you don't use anywhere else.
        </p>

        <form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-ink">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-ink">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="input-field"
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="mb-1.5 block text-sm font-medium text-ink">
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              className="input-field"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary self-start"
          >
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Data export */}
      <div className="card mt-6 p-6">
        <h2 className="font-display text-sm font-semibold text-ink">Export your data</h2>
        <p className="mt-1 text-sm text-slate-500">
          Download a copy of your personal data, orders, and listings held by
          MatchPass, in accordance with UK GDPR's right to access.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary mt-4 text-sm"
        >
          <Download size={15} /> {exporting ? 'Preparing export...' : 'Download my data'}
        </button>
      </div>

      {/* Deletion request */}
      <div className="card mt-6 border border-red-100 p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-danger">
          <AlertTriangle size={16} /> Delete your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Request permanent deletion of your personal data. This cannot be
          undone. If you have orders or listings still in progress, please
          wait until they're complete before requesting deletion.
        </p>

        {requested ? (
          <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700">
            Your deletion request has been received. Our team will process it
            within 30 days as required by law.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: tell us why you're leaving"
              rows={2}
              className="input-field resize-none"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Type <span className="font-mono">DELETE</span> to confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="input-field"
              />
            </div>
            <button
              onClick={handleRequestDeletion}
              disabled={confirmText !== 'DELETE' || requesting}
              className="btn-primary self-start !bg-danger hover:!bg-red-700"
            >
              <Trash2 size={15} />
              {requesting ? 'Submitting...' : 'Request account deletion'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;