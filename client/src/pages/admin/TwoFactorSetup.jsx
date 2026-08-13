import { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const TwoFactorSetup = () => {
  const { user, refetchUser } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const response = await api.post('/2fa/setup');
      setQrCode(response.data.data.qrCode);
      setManualKey(response.data.data.manualEntryKey);
    } catch (err) {
      toast.error('Could not start 2FA setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/2fa/verify-setup', { token: code });
      toast.success('Two-factor authentication enabled!');
      setQrCode('');
      setCode('');
      refetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/2fa/disable', { password });
      toast.success('Two-factor authentication disabled.');
      setPassword('');
      refetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-display text-display-sm text-ink">Two-factor authentication</h1>
      <p className="mt-1 text-slate-500">
        Add an extra layer of security to your admin account.
      </p>

      {user?.twoFactorEnabled ? (
        <div className="card mt-6 max-w-md p-6">
          <div className="flex items-center gap-2 text-primary-700">
            <ShieldCheck size={20} />
            <p className="font-semibold">2FA is enabled</p>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Your account requires a code from your authenticator app on every
            login.
          </p>
          <form onSubmit={handleDisable} className="mt-4 flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to disable"
              className="input-field"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary self-start !text-danger"
            >
              <ShieldOff size={15} /> Disable 2FA
            </button>
          </form>
        </div>
      ) : (
        <div className="card mt-6 max-w-md p-6">
          {!qrCode ? (
            <>
              <p className="text-sm text-slate-500">
                Scan a QR code with Google Authenticator, Authy, or any TOTP
                app to enable 2FA.
              </p>
              <button onClick={handleStartSetup} disabled={loading} className="btn-primary mt-4">
                {loading ? 'Generating...' : 'Set up 2FA'}
              </button>
            </>
          ) : (
            <form onSubmit={handleVerifySetup} className="flex flex-col gap-4">
              <img src={qrCode} alt="2FA QR code" className="mx-auto h-48 w-48" />
              <p className="text-center text-xs text-slate-400">
                Can't scan? Enter this key manually:{' '}
                <span className="font-mono">{manualKey}</span>
              </p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="input-field text-center font-mono text-lg tracking-widest"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary justify-center">
                {loading ? 'Verifying...' : 'Confirm and enable'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;