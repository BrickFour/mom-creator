import { useState } from 'react';
import { Share2, Building2, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';
import { MOMStatusBadge } from '../common/StatusBadge.jsx';
import { shareMOM } from '../../services/moms.js';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ShareMOMModal({
  isOpen,
  onClose,
  mom,
  meeting,
  sourceWorkspace,
  onSuccess,
}) {
  const { workspaces } = useWorkspace();
  const { showToast } = useToast();

  const [targetWorkspaceId, setTargetWorkspaceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Other workspaces the user is a member of (excluding current one)
  const otherWorkspaces = (workspaces || []).filter(
    (ws) => ws.id !== sourceWorkspace?.id
  );

  const handleClose = () => {
    if (submitting) return;
    setTargetWorkspaceId('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedId = targetWorkspaceId.trim();

    if (!cleanedId) {
      setError('Please enter a target Workspace ID');
      return;
    }

    if (!UUID_REGEX.test(cleanedId)) {
      setError('Please enter a valid Workspace UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)');
      return;
    }

    if (sourceWorkspace?.id && cleanedId === sourceWorkspace.id) {
      setError('Target workspace cannot be the same as the current workspace');
      return;
    }

    if (!mom?.id) {
      setError('MOM ID is missing');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await shareMOM(mom.id, cleanedId);

      showToast(
        result.message || `MOM successfully assigned to workspace "${result.target_workspace_name || cleanedId}"`,
        'success'
      );

      handleClose();

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Failed to share MOM:', err);
      setError(err.message || 'Failed to assign MOM to target workspace');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mom) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Share MOM to Workspace"
      description="Assign this Minutes of Meeting, its action items, and participants to another workspace using its Workspace ID."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Source MOM overview card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Document to Share
            </span>
            <MOMStatusBadge status={mom.status} />
          </div>

          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
            {mom.title || meeting?.title || 'Minutes of Meeting'}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>From current workspace:</span>
            <span className="font-medium text-slate-700">
              {sourceWorkspace?.name || 'Current Workspace'}
            </span>
          </div>
        </div>

        {/* Target Workspace ID Input */}
        <div className="space-y-1.5">
          <Input
            label="Target Workspace ID"
            placeholder="Paste target Workspace ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
            value={targetWorkspaceId}
            onChange={(e) => {
              setTargetWorkspaceId(e.target.value);
              if (error) setError('');
            }}
            error={error}
            required
            autoFocus
          />

          <p className="text-[11px] text-slate-500 leading-relaxed">
            The destination workspace owner can find their Workspace ID on their{' '}
            <span className="font-semibold text-slate-700">Workspaces</span> page by clicking{' '}
            <span className="font-semibold text-slate-700">Copy ID</span>.
          </p>
        </div>

        {/* Quick select from other owned/joined workspaces */}
        {otherWorkspaces.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-600">
              Or select from your other workspaces:
            </label>

            <div className="flex flex-wrap gap-1.5">
              {otherWorkspaces.map((ws) => {
                const isSelected = targetWorkspaceId.trim() === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      setTargetWorkspaceId(ws.id);
                      if (error) setError('');
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{ws.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Information Callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            Only workspace owners can assign MOMs across workspaces. A dedicated copy of the meeting, MOM document, action items, and participants will be created in the target workspace.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={submitting}
            disabled={!targetWorkspaceId.trim()}
            icon={Share2}
          >
            Share MOM
          </Button>
        </div>
      </form>
    </Modal>
  );
}
