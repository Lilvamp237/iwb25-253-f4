import React, { useState } from 'react';
import type { Reply } from '../types';
import ReplyForm from './ReplyForm';

interface Props {
  reply: Reply;
  messageId: number; // The ID of the top-level message
  onReplyPosted: () => void;
}

export default function ReplyComponent({ reply, messageId, onReplyPosted }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReplyPosted();
  };

  return (
    <article className="reply-card">
      <p>{reply.text}</p>
      <small className="muted">Replied at {new Date(reply.timestamp).toLocaleString()}</small>
      <div className="actions">
        <button className="btn-link" onClick={() => setShowReplyForm(!showReplyForm)}>
          {showReplyForm ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {showReplyForm && (
        <ReplyForm
          messageId={messageId}
          parentReplyId={reply.id} // This is the key for nesting!
          onPosted={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* --- Recursion Happens Here --- */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="replies nested">
          {reply.replies.map((nestedReply) => (
            <ReplyComponent
              key={nestedReply.id}
              reply={nestedReply}
              messageId={messageId}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </article>
  );
}