'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/common';
import { Button, Input, Skeleton } from '@/components/ui';
import {
  useCitizenProfile,
  useConnectedSystems,
  useRetrySync,
  useSimulateSystem,
  useUpdateAddress,
  useUpdatePhone,
} from '@/hooks';
import type {
  AddressValue,
  ConnectedSystem,
  GovSystem,
  SyncResponse,
} from '@/services';

const ALL_SYSTEMS: GovSystem[] = ['aadhaar', 'pan', 'rto', 'passport', 'voter'];
const SYSTEM_ICON: Record<GovSystem, string> = {
  aadhaar: 'shield',
  pan: 'doc',
  rto: 'user',
  passport: 'globe',
  voter: 'check',
};

const emptyAddress: AddressValue = { line1: '', city: '', state: '', pincode: '' };

function addressLine(a: AddressValue): string {
  const cityState = [a.city, a.state].filter(Boolean).join(', ');
  return [cityState, a.pincode].filter(Boolean).join(' ') || a.line1 || '—';
}

export default function V2GovProfilePage() {
  const { data: profile, isLoading } = useCitizenProfile();
  const { data: systems } = useConnectedSystems();

  const updateAddress = useUpdateAddress();
  const updatePhone = useUpdatePhone();
  const retry = useRetrySync();
  const simulate = useSimulateSystem();

  const [editing, setEditing] = useState<'address' | 'phone' | null>(null);
  const [addrDraft, setAddrDraft] = useState<AddressValue>(emptyAddress);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [targets, setTargets] = useState<GovSystem[]>(ALL_SYSTEMS);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const busy = updateAddress.isPending || updatePhone.isPending;

  const systemsByKey = useMemo(() => {
    const map = new Map<GovSystem, ConnectedSystem>();
    (systems ?? []).forEach((s) => map.set(s.system, s));
    return map;
  }, [systems]);

  const startEdit = (field: 'address' | 'phone') => {
    setResult(null);
    setTargets(ALL_SYSTEMS);
    if (field === 'address') setAddrDraft(profile?.address ?? emptyAddress);
    else setPhoneDraft(profile?.phone ?? '');
    setEditing(field);
  };

  const toggleTarget = (system: GovSystem) =>
    setTargets((prev) =>
      prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system],
    );

  const submit = () => {
    if (targets.length === 0) {
      toast.error('Select at least one government service to update.');
      return;
    }
    const onDone = (data: SyncResponse) => {
      setResult(data);
      setEditing(null);
      if (data.status === 'success') toast.success('Updated across all selected services.');
      else if (data.status === 'partial') toast.warning('Some services could not be updated.');
      else toast.error('Update did not go through.');
    };
    const onFail = () => toast.error('Something went wrong. Please try again.');

    if (editing === 'address') {
      updateAddress.mutate(
        { value: addrDraft, targets, consent: true },
        { onSuccess: onDone, onError: onFail },
      );
    } else if (editing === 'phone') {
      updatePhone.mutate(
        { value: phoneDraft, targets, consent: true },
        { onSuccess: onDone, onError: onFail },
      );
    }
  };

  const onRetry = () => {
    if (!result) return;
    retry.mutate(result.batchId, {
      onSuccess: (data) => {
        setResult(data);
        if (data.status === 'success') toast.success('All services are now up to date.');
        else toast.warning('Still could not reach every service.');
      },
      onError: () => toast.error('Retry failed. Please try again.'),
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-[18px]" />
        <Skeleton className="h-32 w-full rounded-[18px]" />
        <Skeleton className="h-48 w-full rounded-[18px]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="v2-heading text-2xl font-bold text-[#101828]">Government Profile</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#667085]">
          Update your address or phone once here. With your consent, Sahayak shares the
          change with your connected government services so you don&apos;t have to visit each
          one separately.
        </p>
      </header>

      {/* Identity — display only, never propagated */}
      <section className="overflow-hidden rounded-[18px] border border-[#EAF1FF] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
        <div className="flex items-center gap-3 border-b border-[#EEF2F7] px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF1FF] text-[#173A78]">
            <Icon name="user" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-[#101828]">{profile.fullName || 'Citizen'}</p>
            <p className="text-xs text-[#6B7890]">
              {profile.dob ? `Date of birth · ${profile.dob}` : 'Verified citizen profile'}
            </p>
          </div>
        </div>

        <FieldRow
          icon="home"
          label="Address"
          value={addressLine(profile.address)}
          onEdit={() => startEdit('address')}
          disabled={busy}
        />
        <div className="h-px bg-[#EEF2F7]" />
        <FieldRow
          icon="phone"
          label="Phone number"
          value={profile.phone || '—'}
          onEdit={() => startEdit('phone')}
          disabled={busy}
        />
      </section>

      {/* Edit + consent */}
      {editing === 'address' && (
        <EditPanel
          title="Edit address"
          targets={targets}
          onToggle={toggleTarget}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
          submitting={busy}
        >
          <div className="grid gap-2.5">
            <Input
              placeholder="House / street"
              value={addrDraft.line1}
              onChange={(e) => setAddrDraft({ ...addrDraft, line1: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                placeholder="City"
                value={addrDraft.city}
                onChange={(e) => setAddrDraft({ ...addrDraft, city: e.target.value })}
              />
              <Input
                placeholder="State"
                value={addrDraft.state}
                onChange={(e) => setAddrDraft({ ...addrDraft, state: e.target.value })}
              />
            </div>
            <Input
              placeholder="Pincode"
              inputMode="numeric"
              value={addrDraft.pincode}
              onChange={(e) => setAddrDraft({ ...addrDraft, pincode: e.target.value })}
            />
          </div>
        </EditPanel>
      )}

      {editing === 'phone' && (
        <EditPanel
          title="Edit phone number"
          targets={targets}
          onToggle={toggleTarget}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
          submitting={busy}
        >
          <Input
            placeholder="New phone number"
            inputMode="tel"
            value={phoneDraft}
            onChange={(e) => setPhoneDraft(e.target.value)}
          />
        </EditPanel>
      )}

      {/* Sync result */}
      {result && result.status !== 'denied' && (
        <ResultPanel
          result={result}
          onRetry={onRetry}
          retrying={retry.isPending}
          onClose={() => setResult(null)}
        />
      )}

      {/* Connected systems */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="v2-heading text-lg font-bold text-[#101828]">Connected services</h2>
          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            className="text-xs font-semibold text-[#6B7890] underline-offset-2 hover:underline"
          >
            {showDemo ? 'Hide demo controls' : 'Demo controls'}
          </button>
        </div>
        <div className="space-y-2">
          {ALL_SYSTEMS.map((key) => {
            const sys = systemsByKey.get(key);
            if (!sys) return null;
            const inSync =
              addressLine(sys.address) === addressLine(profile.address) &&
              sys.phone === profile.phone;
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-[16px] border border-[#EAF1FF] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(16,40,99,0.05)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EAF1FF] text-[#173A78]">
                  <Icon name={SYSTEM_ICON[key]} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-[#101828]">{sys.label}</p>
                  <p className="truncate text-xs text-[#6B7890]">{addressLine(sys.address)}</p>
                </div>
                {!sys.isOnline ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#DC3545]">
                    <Icon name="offline" className="h-3.5 w-3.5" /> Offline
                  </span>
                ) : inSync ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EDFDF4] px-2.5 py-1 text-xs font-semibold text-[#16a34a]">
                    <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> In sync
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4E5] px-2.5 py-1 text-xs font-semibold text-[#B7791F]">
                    <Icon name="alert" className="h-3.5 w-3.5" /> Differs
                  </span>
                )}

                {showDemo && (
                  <button
                    type="button"
                    disabled={simulate.isPending}
                    onClick={() =>
                      simulate.mutate({ system: key, online: !sys.isOnline })
                    }
                    className="ml-1 shrink-0 rounded-lg border border-[#E1E7F0] px-2 py-1 text-xs font-semibold text-[#173A78] active:bg-[#F5F8FF] disabled:opacity-50"
                  >
                    {sys.isOnline ? 'Take offline' : 'Bring online'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {showDemo && (
          <p className="mt-2 px-1 text-xs leading-relaxed text-[#8A94A6]">
            Demo only: take a service offline, then update your address — it will fail for that
            service and can be retried once it&apos;s back online.
          </p>
        )}
      </section>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  value,
  onEdit,
  disabled,
}: {
  icon: string;
  label: string;
  value: string;
  onEdit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F3F6FC] text-[#173A78]">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7890]">{label}</p>
        <p className="truncate text-[15px] font-semibold text-[#101828]">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#173A78] active:bg-[#F5F8FF] disabled:opacity-50"
      >
        Edit
      </button>
    </div>
  );
}

const SYSTEM_LABELS: Record<GovSystem, string> = {
  aadhaar: 'Aadhaar',
  pan: 'PAN',
  rto: 'Driving Licence',
  passport: 'Passport',
  voter: 'Voter ID',
};

function EditPanel({
  title,
  children,
  targets,
  onToggle,
  onCancel,
  onSubmit,
  submitting,
}: {
  title: string;
  children: React.ReactNode;
  targets: GovSystem[];
  onToggle: (s: GovSystem) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <section className="rounded-[18px] border border-[#173A78]/15 bg-white p-4 shadow-[0_2px_10px_rgba(16,40,99,0.08)]">
      <p className="mb-3 text-[15px] font-bold text-[#101828]">{title}</p>
      {children}

      <div className="mt-4 rounded-[14px] bg-[#F5F8FF] p-3.5">
        <p className="text-sm font-semibold text-[#101828]">
          Share this update with connected government services?
        </p>
        <div className="mt-2.5 space-y-1.5">
          {ALL_SYSTEMS.map((system) => (
            <label
              key={system}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1"
            >
              <input
                type="checkbox"
                checked={targets.includes(system)}
                onChange={() => onToggle(system)}
                className="h-[18px] w-[18px] accent-[#173A78]"
              />
              <span className="text-sm font-medium text-[#101828]">{SYSTEM_LABELS[system]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2.5">
        <Button variant="secondary" full onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button full onClick={onSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Icon name="spark" className="h-5 w-5 animate-spin" /> Updating…
            </>
          ) : (
            'Allow and update'
          )}
        </Button>
      </div>
    </section>
  );
}

function ResultPanel({
  result,
  onRetry,
  retrying,
  onClose,
}: {
  result: SyncResponse;
  onRetry: () => void;
  retrying: boolean;
  onClose: () => void;
}) {
  const ok = result.results.filter((r) => r.status === 'success').length;
  const total = result.results.length;
  const anyFailed = result.results.some((r) => r.status === 'failed');

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#EAF1FF] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
      <div className="flex items-center gap-3 border-b border-[#EEF2F7] px-4 py-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            result.status === 'success'
              ? 'bg-[#EDFDF4] text-[#16a34a]'
              : 'bg-[#FFF4E5] text-[#B7791F]'
          }`}
        >
          <Icon
            name={result.status === 'success' ? 'check' : 'alert'}
            className="h-5 w-5"
            strokeWidth={result.status === 'success' ? 3 : 2}
          />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-[#101828]">
            {ok}/{total} services updated
          </p>
          <p className="text-xs text-[#6B7890]">
            {result.field === 'address' ? 'Address' : 'Phone number'} synchronization
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-[#98A2B3] active:bg-[#F5F8FF]"
          aria-label="Dismiss"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>

      <ul className="divide-y divide-[#F0F3F8]">
        {result.results.map((r) => (
          <li key={r.system} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex-1 text-sm font-medium text-[#101828]">{r.label}</span>
            {r.status === 'success' ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#16a34a]">
                <Icon name="check" className="h-4 w-4" strokeWidth={3} /> Updated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#DC3545]">
                <Icon name="alert" className="h-4 w-4" /> {r.error || 'Failed'}
              </span>
            )}
          </li>
        ))}
      </ul>

      {anyFailed && (
        <div className="border-t border-[#EEF2F7] p-3">
          <Button full onClick={onRetry} disabled={retrying}>
            {retrying ? (
              <>
                <Icon name="spark" className="h-5 w-5 animate-spin" /> Retrying…
              </>
            ) : (
              <>
                <Icon name="clock" className="h-5 w-5" /> Retry failed services
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
