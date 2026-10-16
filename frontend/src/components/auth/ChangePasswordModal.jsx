import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function ChangePasswordModal({ isOpen, onClose }) {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      showToast('Password changed successfully!', 'success');
      handleClose();
    } catch (err) {
      setError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      description="Update your account password securely."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            placeholder="Min. 8 characters"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Confirm New Password"
          placeholder="Repeat new password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Password security guidelines</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Use at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={loading}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
