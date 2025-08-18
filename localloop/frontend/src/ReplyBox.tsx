import { useState } from "react";

export default function ReplyBox({
  messageId,
  onReplied
}: { messageId: string; onReplied?: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setText("");
      onReplied?.(); // refresh the feed in parent
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input
        placeholder="Write a reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        style={{ flex: 1, padding: 8 }}
      />
      <button disabled={busy} type="submit">
        {busy ? "Sending…" : "Reply"}
      </button>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </form>
  );
}
