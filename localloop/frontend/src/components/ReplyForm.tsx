import React, { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
  messageId: number;
  parentReplyId?: number; // Optional: for nested replies
  onPosted: () => void;
  onCancel?: () => void; // Optional: to hide the form
}

export default function ReplyForm({ messageId, parentReplyId, onPosted, onCancel }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canReply = text.trim().length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canReply) return;

    setSubmitting(true);
    setError('');

    // The payload includes parentReplyId only when it's provided
    const payload: { text: string; parentReplyId?: number } = {
      text: text.trim(),
    };
    if (parentReplyId) {
      payload.parentReplyId = parentReplyId;
    }

    try {
      // The URL is dynamically built to match the Ballerina service
      const res = await fetch(`/api/message/${messageId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to post reply. Server responded with ${res.status}`);
      }
      onPosted(); // This triggers the feed refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="reply-form">
      <textarea
        placeholder="Write a reply..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={280}
        autoFocus
      />
      <div className="row-actions">
        <div>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
        <div className="row">
            <small className="char">{text.length}/280</small>
            <button type="submit" disabled={!canReply || submitting} className="btn-send-small">
              {submitting ? 'Replying…' : 'Reply'}
            </button>
        </div>
      </div>
       {error && <div className="error-text">{error}</div>}
    </form>
  );
}