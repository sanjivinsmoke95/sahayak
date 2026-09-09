'use client';

import { useAuthToken } from '@/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/lib/sahayak/settings';
import { toast } from 'sonner';
import type { Lang, SettingsRead } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--sh-border)' }}>
      <div>
        <p style={{ ...F, fontSize: 14, fontWeight: 600, color: 'var(--sh-dark-ink)', margin: 0 }}>{label}</p>
        <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>{sub}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: checked ? 'var(--sh-blue)' : '#CBD5E1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: checked ? 22 : 2 }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const getToken = useAuthToken();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery<SettingsRead>({
    queryKey: ['settings'],
    queryFn: async () => {
      const token = await getToken();
      return settingsService.get(token ?? '');
    },
  });

  const { mutate: update } = useMutation({
    mutationFn: async (patch: Partial<SettingsRead>) => {
      const token = (await getToken()) ?? '';
      return settingsService.update(patch, token);
    },
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data);
      toast.success('Settings saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return <div style={{ padding: '80px 40px', textAlign: 'center' }}><p style={{ ...F, color: 'var(--sh-ink-muted)' }}>Loading settings…</p></div>;
  }

  if (!settings) return null;

  return (
    <div style={{ padding: '0 0 64px' }}>
      <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
        <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Settings</h1>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>Language, display, and accessibility preferences</p>
      </div>

      <div style={{ padding: '32px 40px', maxWidth: 640 }}>
        {/* Language */}
        <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 16px' }}>Language</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ code: 'en' as Lang, label: 'English' }, { code: 'hi' as Lang, label: 'हिंदी' }, { code: 'te' as Lang, label: 'తెలుగు' }].map(l => (
              <button key={l.code} onClick={() => update({ language: l.code })} style={{
                ...F, flex: 1, border: '1.5px solid', borderRadius: 8, padding: '10px',
                fontSize: 14, fontWeight: settings.language === l.code ? 700 : 500, cursor: 'pointer',
                borderColor: settings.language === l.code ? 'var(--sh-blue)' : 'var(--sh-border)',
                background: settings.language === l.code ? 'var(--sh-soft-blue)' : '#fff',
                color: settings.language === l.code ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
              }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text size */}
        <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 16px' }}>Text size</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { code: 'standard' as const, label: 'Standard', size: 14 },
              { code: 'large' as const, label: 'Large', size: 16 },
              { code: 'xlarge' as const, label: 'Extra large', size: 18 },
            ].map(ts => (
              <button key={ts.code} onClick={() => update({ textSize: ts.code })} style={{
                ...F, flex: 1, border: '1.5px solid', borderRadius: 8, padding: '10px',
                fontSize: ts.size, fontWeight: settings.textSize === ts.code ? 700 : 500, cursor: 'pointer',
                borderColor: settings.textSize === ts.code ? 'var(--sh-blue)' : 'var(--sh-border)',
                background: settings.textSize === ts.code ? 'var(--sh-soft-blue)' : '#fff',
                color: settings.textSize === ts.code ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
              }}>
                {ts.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '0 24px' }}>
          <ToggleRow
            label="Read aloud"
            sub="Use text-to-speech to read document explanations"
            checked={settings.readAloud}
            onChange={v => update({ readAloud: v })}
          />
          <ToggleRow
            label="Auto-compress uploads"
            sub="Automatically reduce file size before uploading"
            checked={settings.autoShrink}
            onChange={v => update({ autoShrink: v })}
          />
        </div>
      </div>
    </div>
  );
}
