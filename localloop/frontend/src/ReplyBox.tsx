// src/components/ReplyBox.tsx
import { useState } from 'react';

export default function ReplyBox({ messageId, onReplied }: { messageId: string; onReplied?: () => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;                      // <-- new
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, text: body }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setText('');
      onReplied?.();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to send reply');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input
        placeholder="Write a reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={280}                      // <-- new
        required
        style={{ flex: 1, padding: 8 }}
      />
      <button disabled={busy || !text.trim()} type="submit">{busy ? 'Sending…' : 'Reply'}</button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
    </form>
  );
}
