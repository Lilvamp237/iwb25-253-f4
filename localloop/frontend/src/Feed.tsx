import { useEffect, useState } from 'react';
import ReplyBox from './ReplyBox';

type Reply = { id: string; text: string; timestamp: unknown };
type Message = { id: string; text: string; lat: number; lon: number; timestamp: unknown; replies?: Reply[] };

export default function Feed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>('');

  // use the same coords you used when seeding the backend
  const lat = 6.9271, lon = 79.8612;

  async function loadFeed() {
    setError('');
    try {
      const res = await fetch(`/api/feed?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Message[];
      setMessages(data.map(m => ({ ...m, replies: Array.isArray(m.replies) ? m.replies : [] })));
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Failed to load feed');
    }
  }

  useEffect(() => { loadFeed(); }, []);

  if (error) return <div style={{ color: 'crimson', marginTop: 12 }}>Feed error: {error}</div>;
  if (!messages.length) return <div style={{ marginTop: 12 }}>No messages yet.</div>;

  return (
    <div style={{ marginTop: 16 }}>
    <h2>Nearby Messages</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {messages.map(m => (
        <li
          key={m.id}
          style={{
            padding: 12,
            border: '1px solid #eee',
            borderRadius: 10,
            marginBottom: 12
          }}
        >
          <div style={{ fontWeight: 600 }}>{m.text}</div>

          <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
            {m.replies?.map((r, i) => (
              <li
                key={`${m.id}-r-${i}`}
                style={{ marginLeft: 12, color: '#444' }}
              >
                ↳ {r.text}
              </li>
            ))}
          </ul>

          {/* 👇 Add the ReplyBox here */}
          <ReplyBox messageId={m.id} onReplied={loadFeed} />
        </li>
      ))}
    </ul>
  </div>
  );
}
