import { useEffect, useState } from 'react';
import type { Message } from '../types';
import MessageComponent from './MessageComponent';

interface Props {
  refreshKey: number;
  onRefreshed: () => void; // Callback to trigger refresh
}

export default function Feed({ refreshKey, onRefreshed }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/feed');
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      
      const data = await res.json();
      
      // The backend wraps the response, so we access `data.feed`
      const feedData = data.feed || [];
      if (!Array.isArray(feedData)) throw new Error("Feed data is not an array");

      setMessages(feedData);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }

  // Reload feed when refreshKey changes (i.e., when a post or reply is made)
  useEffect(() => {
    loadFeed();
  }, [refreshKey]);

  if (error) return <div className="error-text">Feed error: {error}. Is the backend running?</div>
  if (loading) return <div className="muted" style={{ marginTop: 12 }}>Loading messages…</div>
  if (!messages.length) return <div className="muted" style={{ marginTop: 12 }}>No messages yet. Be the first to post!</div>

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Nearby Messages</h2>
      <ul className="feed-list">
        {messages.map(m => (
          <MessageComponent key={m.id} message={m} onReplyPosted={onRefreshed} />
        ))}
      </ul>
    </div>
  );
}